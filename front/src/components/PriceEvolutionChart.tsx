import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DetailedPricingResult } from "@/types/journey";
import { AlertTriangle, Calendar, TrendingUp } from "lucide-react";
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
  // Grouper les données par jours avant le départ
  const groupedByDays = offers.reduce((acc, offer) => {
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

    acc[days].prices.push(offer.minPrice, offer.avgPrice, offer.maxPrice);

    if (offer.is_sellable) {
      acc[days].availableTrains++;
    } else {
      acc[days].soldOutTrains++;
      if (offer.unsellable_reason) {
        acc[days].soldOutReasons.add(offer.unsellable_reason);
      }
    }

    return acc;
  }, {} as Record<number, any>);

  // Convertir en format pour le graphique
  const chartData: ChartDataPoint[] = Object.values(groupedByDays)
    .map((group) => ({
      daysBeforeDeparture: group.daysBeforeDeparture,
      minPrice: Math.min(...group.prices),
      avgPrice: Math.round(
        group.prices.reduce((sum: number, price: number) => sum + price, 0) /
          group.prices.length
      ),
      maxPrice: Math.max(...group.prices),
      availableTrains: group.availableTrains,
      soldOutTrains: group.soldOutTrains,
      soldOutReason: Array.from(group.soldOutReasons).join(", "),
    }))
    .sort((a, b) => a.daysBeforeDeparture - b.daysBeforeDeparture);

  const formatTooltip = (value: any, name: string) => {
    if (name === "minPrice") return [`${value}€`, "Prix minimum"];
    if (name === "avgPrice") return [`${value}€`, "Prix moyen"];
    if (name === "maxPrice") return [`${value}€`, "Prix maximum"];
    if (name === "availableTrains") return [value, "Trains disponibles"];
    if (name === "soldOutTrains") return [value, "Trains complets"];
    return [value, name];
  };

  const getSoldOutInfo = () => {
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
  };

  const getPriceStats = () => {
    const allPrices = offers.flatMap((offer) => [
      offer.minPrice,
      offer.avgPrice,
      offer.maxPrice,
    ]);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const avgPrice = Math.round(
      allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length
    );

    const priceVariation = maxPrice - minPrice;
    const priceVariationPercent = Math.round((priceVariation / minPrice) * 100);

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{minPrice}€</div>
          <div className="text-sm text-green-700">Prix minimum</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{avgPrice}€</div>
          <div className="text-sm text-blue-700">Prix moyen</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{maxPrice}€</div>
          <div className="text-sm text-red-700">Prix maximum</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {priceVariationPercent}%
          </div>
          <div className="text-sm text-purple-700">Variation</div>
        </div>
      </div>
    );
  };

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
        {getPriceStats()}

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
              <Legend />
              <Line
                type="monotone"
                dataKey="minPrice"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="avgPrice"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="maxPrice"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {getSoldOutInfo()}

        <div className="mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Légende :</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Prix minimum</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Prix moyen</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Prix maximum</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceEvolutionChart;
