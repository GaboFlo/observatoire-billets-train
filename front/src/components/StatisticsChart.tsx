import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { truncatePrice } from "@/lib/utils";
import { DetailedPricingResult } from "@/types/journey";
import {
  translateCarrier,
  translateDiscountCard,
  translateFlexibility,
  translateTravelClass,
} from "@/utils/translations";
import { BarChart3, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TrainInfo {
  trainNumber: string;
  departureTime: string;
  arrivalTime: string;
  carrier: string;
  minPrice: number;
}

interface StatisticsChartProps {
  offers: DetailedPricingResult[];
  selectedDate: string | null;
  selectedTrain: string | null;
  selectedCarriers?: string[];
  selectedClasses?: string[];
  selectedDiscountCards?: string[];
  selectedFlexibilities?: string[];
  availableTrains?: TrainInfo[];
  loading?: boolean;
}

const StatisticsChart = ({
  offers,
  selectedDate,
  selectedTrain,
  selectedCarriers = [],
  selectedClasses = [],
  selectedDiscountCards = [],
  selectedFlexibilities = [],
  availableTrains = [],
  loading = false,
}: StatisticsChartProps) => {
  const chartData = useMemo(() => {
    if (!offers || offers.length === 0) return [];

    // Grouper les données par jours avant le départ
    const groupedByDays = offers.reduce(
      (acc, offer) => {
        const days = offer.daysBeforeDeparture || 0;
        if (!acc[days]) {
          acc[days] = {
            daysBeforeDeparture: days,
            prices: [],
            availableTrains: 0,
            soldOutTrains: 0,
          };
        }

        // Utiliser le prix réel de l'offre (qui est stocké dans minPrice)
        acc[days].prices.push(truncatePrice(offer.minPrice));

        if (offer.is_sellable) {
          acc[days].availableTrains++;
        } else {
          acc[days].soldOutTrains++;
        }

        return acc;
      },
      {} as Record<
        number,
        {
          daysBeforeDeparture: number;
          prices: number[];
          availableTrains: number;
          soldOutTrains: number;
        }
      >
    );

    // Convertir en format pour le graphique
    return Object.values(groupedByDays)
      .map((group) => ({
        daysBeforeDeparture: -group.daysBeforeDeparture,
        minPrice: truncatePrice(Math.min(...group.prices)),
        avgPrice: truncatePrice(
          group.prices.reduce((sum: number, price: number) => sum + price, 0) /
            group.prices.length
        ),
        maxPrice: truncatePrice(Math.max(...group.prices)),
        availableTrains: group.availableTrains,
        soldOutTrains: group.soldOutTrains,
        totalTrains: group.availableTrains + group.soldOutTrains,
      }))
      .sort((a, b) => a.daysBeforeDeparture - b.daysBeforeDeparture);
  }, [offers]);

  const formatTooltip = (value: number, name: string) => {
    if (name === "minPrice")
      return [`${truncatePrice(value)}€`, "Prix minimum"];
    if (name === "avgPrice") return [`${truncatePrice(value)}€`, "Prix moyen"];
    if (name === "maxPrice")
      return [`${truncatePrice(value)}€`, "Prix maximum"];
    return [value, name];
  };

  const getChartTitle = () => {
    if (selectedDate && selectedTrain) {
      return "Évolution des prix pour ce train à cette date";
    }
    if (selectedDate && !selectedTrain) {
      return "Évolution des prix pour cette date";
    }
    if (!selectedDate && selectedTrain) {
      return "Évolution des prix pour ce train";
    }
    return "Évolution des prix selon les jours avant départ";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const getChartDescription = () => {
    const parts: (string | JSX.Element)[] = [];
    const highlightStyle = "text-blue-600 font-bold";

    const datePart = selectedDate
      ? [
          "Trajet du ",
          <span key="date" className={highlightStyle}>
            {formatDate(selectedDate)}
          </span>,
        ]
      : [
          "Trajet sur ",
          <span key="all-dates" className={highlightStyle}>
            toutes les dates
          </span>,
        ];
    parts.push(...datePart);

    if (selectedCarriers.length > 0) {
      const carriersText = selectedCarriers
        .map((c) => translateCarrier(c))
        .join(", ");
      parts.push(
        " avec ",
        <span key="carriers" className={highlightStyle}>
          {carriersText}
        </span>
      );
    }

    if (selectedClasses.length > 0) {
      const classesText = selectedClasses
        .map((c) => translateTravelClass(c))
        .join(", ");
      parts.push(
        " en  ",
        <span key="classes" className={highlightStyle}>
          {classesText}
        </span>,
        " classe "
      );
    }

    if (selectedDiscountCards.length > 0) {
      const cardsText = selectedDiscountCards
        .map((c) => translateDiscountCard(c))
        .join(", ");
      parts.push(
        " avec carte ",
        <span key="cards" className={highlightStyle}>
          {cardsText}
        </span>
      );
    }

    if (selectedFlexibilities.length > 0) {
      const flexText = selectedFlexibilities
        .map((f) => translateFlexibility(f))
        .join(", ");
      parts.push(
        " en flexibilité ",
        <span key="flex" className={highlightStyle}>
          {flexText}
        </span>
      );
    }

    if (selectedTrain) {
      const trainInfo = availableTrains.find(
        (t) => t.trainNumber === selectedTrain
      );
      if (trainInfo) {
        parts.push(
          " sur le train numéro ",
          <span key="train-number" className={highlightStyle}>
            {selectedTrain}
          </span>,
          " (",
          <span key="train-time" className={highlightStyle}>
            {formatTime(trainInfo.departureTime)} →{" "}
            {formatTime(trainInfo.arrivalTime)}
          </span>,
          ")"
        );
      } else {
        parts.push(
          " sur le train numéro ",
          <span key="train-number" className={highlightStyle}>
            {selectedTrain}
          </span>
        );
      }
    } else {
      parts.push(
        " sur ",
        <span key="all-trains" className={highlightStyle}>
          tous les trains
        </span>
      );
    }

    return <>{parts}</>;
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistiques
          </CardTitle>
          <CardDescription>Chargement des données...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistiques
          </CardTitle>
          <CardDescription>Aucune donnée disponible</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full flex items-center justify-center text-gray-500">
            Aucune donnée disponible pour les filtres sélectionnés
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {getChartTitle()}
        </CardTitle>
        <CardDescription>{getChartDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 15 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="daysBeforeDeparture"
                label={{
                  value: "Jours avant le départ",
                  position: "insideBottom",
                  offset: -10,
                }}
              />
              <YAxis
                label={{
                  value: "Prix (€)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip formatter={formatTooltip} />
              <Line
                type="monotone"
                name="Prix minimum"
                dataKey="minPrice"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 1 }}
              />
              <Line
                type="monotone"
                name="Prix moyen"
                dataKey="avgPrice"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 1 }}
              />
              <Line
                type="monotone"
                name="Prix maximum"
                dataKey="maxPrice"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444", strokeWidth: 2, r: 1 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsChart;
