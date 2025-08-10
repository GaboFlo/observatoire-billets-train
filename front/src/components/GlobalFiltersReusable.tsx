import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DetailedPricingResult } from "@/types/journey";
import { Filter, X } from "lucide-react";

interface GlobalFiltersReusableProps {
  offers: DetailedPricingResult[];
  filters: {
    excludedCarriers: string[];
    excludedClasses: string[];
    excludedDiscountCards: string[];
  };
  onCarrierFilter: (carrier: string) => void;
  onClassFilter: (travelClass: string) => void;
  onDiscountCardFilter: (discountCard: string) => void;
  clearFilters: () => void;
}

const GlobalFiltersReusable = ({
  offers,
  filters,
  onCarrierFilter,
  onClassFilter,
  onDiscountCardFilter,
  clearFilters,
}: GlobalFiltersReusableProps) => {
  // Extraire les options disponibles depuis les offres
  const availableCarriers = [...new Set(offers.map((o) => o.carrier))].sort();
  const availableClasses = [
    ...new Set(offers.map((o) => o.travelClass)),
  ].sort();
  const availableDiscountCards = [
    ...new Set(offers.map((o) => o.discountCard)),
  ].sort();

  const hasActiveFilters =
    filters.excludedCarriers.length > 0 ||
    filters.excludedClasses.length > 0 ||
    filters.excludedDiscountCards.length > 0;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtres
        </CardTitle>
        <CardDescription>
          Filtrer les offres par compagnie, classe de voyage et cartes de
          réduction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Compagnies */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Compagnies</label>
          <div className="flex flex-wrap gap-2">
            {availableCarriers.map((carrier) => (
              <Badge
                key={carrier}
                variant={
                  filters.excludedCarriers.includes(carrier)
                    ? "secondary"
                    : "default"
                }
                className="cursor-pointer hover:opacity-80"
                onClick={() => onCarrierFilter(carrier)}
              >
                {carrier}
                {filters.excludedCarriers.includes(carrier) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Classes de voyage */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Classes de voyage</label>
          <div className="flex flex-wrap gap-2">
            {availableClasses.map((travelClass) => (
              <Badge
                key={travelClass}
                variant={
                  filters.excludedClasses.includes(travelClass)
                    ? "secondary"
                    : "default"
                }
                className="cursor-pointer hover:opacity-80"
                onClick={() => onClassFilter(travelClass)}
              >
                {travelClass}
                {filters.excludedClasses.includes(travelClass) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Cartes de réduction */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Cartes de réduction</label>
          <div className="flex flex-wrap gap-2">
            {availableDiscountCards.map((discountCard) => (
              <Badge
                key={discountCard}
                variant={
                  filters.excludedDiscountCards.includes(discountCard)
                    ? "secondary"
                    : "default"
                }
                className="cursor-pointer hover:opacity-80"
                onClick={() => onDiscountCardFilter(discountCard)}
              >
                {discountCard}
                {filters.excludedDiscountCards.includes(discountCard) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Bouton pour effacer les filtres */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="w-full"
          >
            <X className="mr-2 h-4 w-4" />
            Effacer tous les filtres
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default GlobalFiltersReusable;
