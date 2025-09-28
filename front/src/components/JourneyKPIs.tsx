import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailedPricingResult } from "@/types/journey";
import {
  carrierTranslations,
  travelClassTranslations,
} from "@/utils/translations";
import { AlertTriangle, Calendar, Train } from "lucide-react";

interface JourneyKPIsProps {
  offers: DetailedPricingResult[];
}

const JourneyKPIs = ({ offers }: JourneyKPIsProps) => {
  // Calculer les KPIs
  const totalOffers = offers.length;
  const availableOffers = offers.filter((offer) => offer.is_sellable).length;
  const soldOutOffers = totalOffers - availableOffers;

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

  // Analyser les tendances de prix
  const pricesByDays = offers.reduce((acc, offer) => {
    const days = offer.daysBeforeDeparture || 0;
    if (!acc[days]) acc[days] = [];
    acc[days].push(offer.avgPrice);
    return acc;
  }, {} as Record<number, number[]>);

  const sortedDays = Object.keys(pricesByDays)
    .map(Number)
    .sort((a, b) => a - b);
  const priceTrend =
    sortedDays.length >= 2
      ? pricesByDays[sortedDays[sortedDays.length - 1]][0] -
        pricesByDays[sortedDays[0]][0]
      : 0;

  // Compagnies et classes uniques
  const uniqueCarriers = [...new Set(offers.map((offer) => offer.carrier))];
  const uniqueClasses = [
    ...new Set(
      offers
        .map((offer) => offer.travelClass)
        .filter((travelClass) => travelClass !== null)
    ),
  ];

  // Raisons de non-disponibilité
  const soldOutReasons = offers
    .filter((offer) => !offer.is_sellable && offer.unsellable_reason)
    .reduce((acc, offer) => {
      const reason = offer.unsellable_reason || "Inconnu";
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            Nombre de trajets étudiés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{totalOffers}</div>

          {soldOutOffers > 0 && (
            <div className="mt-2 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-orange-500" />
              <span className="text-xs text-orange-600">
                {soldOutOffers} complet(s)
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compagnies */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Train className="h-4 w-4 text-blue-600" />
            Compagnies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {uniqueCarriers.length}
          </div>
          <p className="text-xs text-muted-foreground">
            compagnies différentes
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {uniqueCarriers.slice(0, 2).map((carrier) => (
              <Badge key={carrier} variant="outline" className="text-xs">
                {carrierTranslations[carrier]}
              </Badge>
            ))}
            {uniqueCarriers.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{uniqueCarriers.length - 2}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Classes */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {uniqueClasses.length}
          </div>
          <p className="text-xs text-muted-foreground">classes de voyage</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {uniqueClasses.map((className) => (
              <Badge key={className} variant="outline" className="text-xs">
                {travelClassTranslations[className]}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JourneyKPIs;
