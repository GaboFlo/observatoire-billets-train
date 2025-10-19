import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { truncatePrice } from "@/lib/utils";
import { DetailedPricingResult } from "@/types/journey";
import { AlertTriangle, TrendingUp } from "lucide-react";
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

interface PriceEvolutionChartProps {
  offers: DetailedPricingResult[];
}

interface ChartDataPoint {
  daysBeforeDeparture: number;
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
  availableTrains: number;
  soldOutTrains: number;
  soldOutReason?: string;
}

const PriceEvolutionChart = ({ offers }: PriceEvolutionChartProps) => {
  // Mémoriser le calcul des données du graphique pour qu'il se mette à jour quand offers change
  const chartData = useMemo(() => {
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
            soldOutReasons: new Set<string>(),
          };
        }

        acc[days].prices.push(
          truncatePrice(offer.minPrice),
          truncatePrice(offer.avgPrice),
          truncatePrice(offer.maxPrice)
        );

        if (offer.is_sellable) {
          acc[days].availableTrains++;
        } else {
          acc[days].soldOutTrains++;
          if (offer.unsellable_reason) {
            acc[days].soldOutReasons.add(offer.unsellable_reason);
          }
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
          soldOutReasons: Set<string>;
        }
      >
    );

    // Convertir en format pour le graphique
    return Object.values(groupedByDays)
      .map((group) => ({
        daysBeforeDeparture: group.daysBeforeDeparture,
        minPrice: truncatePrice(Math.min(...group.prices)),
        avgPrice: truncatePrice(
          group.prices.reduce((sum: number, price: number) => sum + price, 0) /
            group.prices.length
        ),
        maxPrice: truncatePrice(Math.max(...group.prices)),
        availableTrains: group.availableTrains,
        soldOutTrains: group.soldOutTrains,
        soldOutReason: Array.from(group.soldOutReasons).join(", "),
      }))
      .sort((a, b) => a.daysBeforeDeparture - b.daysBeforeDeparture);
  }, [offers]);

  const formatTooltip = (value: number, name: string) => {
    if (name === "minPrice")
      return [`${truncatePrice(value)}€`, "Prix minimum"];
    if (name === "avgPrice") return [`${truncatePrice(value)}€`, "Prix moyen"];
    if (name === "maxPrice")
      return [`${truncatePrice(value)}€`, "Prix maximum"];
    if (name === "availableTrains") return [value, "Trains disponibles"];
    if (name === "soldOutTrains") return [value, "Trains complets"];
    return [value, name];
  };

  const getSoldOutInfo = useMemo(() => {
    const soldOutDays = chartData.filter((point) => point.soldOutTrains > 0);
    if (soldOutDays.length === 0) return null;

    return (
      <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <span className="font-medium text-orange-800">Trains complets</span>
        </div>
        <div className="space-y-1 text-sm text-orange-700">
          {soldOutDays.map((day) => (
            <div key={day.daysBeforeDeparture} className="flex justify-between">
              <span>J-{day.daysBeforeDeparture} :</span>
              <span>{day.soldOutTrains} train(s) complet(s)</span>
              {day.soldOutReason && (
                <span className="text-orange-600">({day.soldOutReason})</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }, [chartData]);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Évolution des prix
        </CardTitle>
        <CardDescription>
          Évolution des prix en fonction du nombre de jours avant le départ
        </CardDescription>
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
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                name="Prix moyen"
                dataKey="avgPrice"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                name="Prix maximum"
                dataKey="maxPrice"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {getSoldOutInfo}
      </CardContent>
    </Card>
  );
};

export default PriceEvolutionChart;
