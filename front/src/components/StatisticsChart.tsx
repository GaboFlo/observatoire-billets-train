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
  Legend,
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
  availableCarriers?: string[];
  availableClasses?: string[];
  availableDiscountCards?: string[];
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
  availableCarriers = [],
  availableClasses = [],
  availableDiscountCards = [],
  loading = false,
}: StatisticsChartProps) => {
  const chartData = useMemo(() => {
    if (!offers || offers.length === 0) return [];

    const groupedByDaysAndCard = offers.reduce(
      (acc, offer) => {
        const days = offer.daysBeforeDeparture || 0;
        const card = offer.discountCard || "NONE";
        const key = `${days}-${card}`;

        if (!acc[key]) {
          acc[key] = {
            daysBeforeDeparture: days,
            discountCard: card,
            prices: [],
          };
        }

        acc[key].prices.push(truncatePrice(offer.minPrice));

        return acc;
      },
      {} as Record<
        string,
        {
          daysBeforeDeparture: number;
          discountCard: string;
          prices: number[];
        }
      >
    );

    const allDays = new Set<number>();
    const allCards = new Set<string>();

    Object.values(groupedByDaysAndCard).forEach((group) => {
      allDays.add(group.daysBeforeDeparture);
      allCards.add(group.discountCard);
    });

    const sortedDays = Array.from(allDays).sort((a, b) => b - a);

    const result = sortedDays.map((days) => {
      const dataPoint: Record<string, number | string | null> = {
        daysBeforeDeparture: -days,
      };

      allCards.forEach((card) => {
        const key = `${days}-${card}`;
        const group = groupedByDaysAndCard[key];
        if (group && group.prices.length > 0) {
          const avgPrice = truncatePrice(
            group.prices.reduce((sum, price) => sum + price, 0) /
              group.prices.length
          );
          dataPoint[card] = avgPrice;
        } else {
          dataPoint[card] = null;
        }
      });

      return dataPoint;
    });

    return result;
  }, [offers]);

  const discountCards = useMemo(() => {
    const cards = new Set<string>();
    offers.forEach((offer) => {
      cards.add(offer.discountCard || "NONE");
    });
    return Array.from(cards).sort();
  }, [offers]);

  const cardColors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
  ];

  const formatTooltip = (value: number, name: string) => {
    if (typeof value === "number" && !Number.isNaN(value)) {
      return [`${truncatePrice(value)}€`, translateDiscountCard(name)];
    }
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

    const filteredCarriers =
      availableCarriers.length > 0
        ? selectedCarriers.filter((c) => availableCarriers.includes(c))
        : selectedCarriers;

    if (filteredCarriers.length > 0) {
      const carriersText = filteredCarriers
        .map((c) => translateCarrier(c))
        .join(", ");
      parts.push(
        " avec ",
        <span key="carriers" className={highlightStyle}>
          {carriersText}
        </span>
      );
    }

    const filteredClasses =
      availableClasses.length > 0
        ? selectedClasses.filter((c) => availableClasses.includes(c))
        : selectedClasses;

    if (filteredClasses.length > 0) {
      const classesText = filteredClasses
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

    const filteredDiscountCards =
      availableDiscountCards.length > 0
        ? selectedDiscountCards.filter((c) =>
            availableDiscountCards.includes(c)
          )
        : selectedDiscountCards;

    if (filteredDiscountCards.length > 0) {
      const cardsText = filteredDiscountCards
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
              <Legend
                formatter={(value) => translateDiscountCard(value)}
                wrapperStyle={{ paddingTop: "20px" }}
              />
              {discountCards.map((card, index) => (
                <Line
                  key={card}
                  type="monotone"
                  name={card}
                  dataKey={card}
                  stroke={cardColors[index % cardColors.length]}
                  strokeWidth={2}
                  dot={{ fill: cardColors[index % cardColors.length], strokeWidth: 2, r: 1 }}
                  connectNulls={true}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsChart;
