import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DetailedPricingResult } from "@/types/journey";
import { CalendarDays, Filter, X } from "lucide-react";
import {
  translateCarrier,
  translateDiscountCard,
  translateTravelClass,
} from "../utils/translations";

interface GlobalFiltersReusableWithDatesProps {
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
  analysisDates?: string[];
  selectedDates?: string[];
  onDateSelect?: (dates: string[]) => void;
}

const GlobalFiltersReusableWithDates = ({
  offers,
  filters,
  onCarrierFilter,
  onClassFilter,
  onDiscountCardFilter,
  clearFilters,
  analysisDates = [],
  selectedDates = [],
  onDateSelect,
}: GlobalFiltersReusableWithDatesProps) => {
  // Extraire les options disponibles depuis les offres
  const availableCarriers = [
    ...new Set(offers.map((o) => o.carrier).filter(Boolean)),
  ].sort();
  const availableClasses = [
    ...new Set(offers.map((o) => o.travelClass).filter(Boolean)),
  ].sort();
  const availableDiscountCards = [
    ...new Set(offers.map((o) => o.discountCard).filter(Boolean)),
  ].sort();

  const hasActiveFilters =
    filters.excludedCarriers.length > 0 ||
    filters.excludedClasses.length > 0 ||
    filters.excludedDiscountCards.length > 0 ||
    selectedDates.length > 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleDateString("fr-FR", {
      weekday: "short",
    });
    const dateOnly = date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
    return `${dayOfWeek} ${dateOnly}`;
  };

  const clearAllFilters = () => {
    clearFilters();
    if (onDateSelect) {
      onDateSelect([]);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
              {hasActiveFilters && (
                <p className="text-sm text-gray-500">
                  {filters.excludedCarriers.length +
                    filters.excludedClasses.length +
                    filters.excludedDiscountCards.length +
                    selectedDates.length}{" "}
                  filtre(s) actif(s)
                </p>
              )}
            </div>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4 mr-1" /> Effacer tout
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sélection de date */}
        <h4 className="text-sm font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <CalendarDays className="w-4 h-4" />
          Sélection de date
        </h4>

        {/* Sélecteur de date limité aux dates disponibles */}
        {analysisDates.length > 0 ? (
          <div className="mb-4">
            <select
              value={selectedDates[0] || ""}
              onChange={(e) =>
                onDateSelect?.(e.target.value ? [e.target.value] : [])
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionnez une date</option>
              {analysisDates.map((date) => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-600 text-sm">
              Aucune date disponible. Veuillez d'abord charger des données.
            </p>
          </div>
        )}

        {/* Compagnies */}
        <div>
          <h4 className="text-sm font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Compagnies ferroviaires
          </h4>
          <div className="flex flex-wrap gap-3">
            {availableCarriers.map((carrier, index) => {
              const isExcluded = filters.excludedCarriers.includes(carrier);

              return (
                <Badge
                  key={`carrier-${carrier}-${index}`}
                  variant="secondary"
                  className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isExcluded
                      ? "bg-gray-100 text-gray-400 line-through opacity-50"
                      : "bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-gray-700 border border-blue-200 hover:border-blue-300 hover:shadow-md"
                  }`}
                  onClick={() => onCarrierFilter(carrier)}
                >
                  {translateCarrier(carrier)}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Classes de voyage */}
        <div>
          <h4 className="text-sm font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Classes de voyage
          </h4>
          <div className="flex flex-wrap gap-3">
            {availableClasses.map((travelClass, index) => {
              const isExcluded = filters.excludedClasses.includes(travelClass);

              return (
                <Badge
                  key={`class-${travelClass}-${index}`}
                  variant="secondary"
                  className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isExcluded
                      ? "bg-gray-100 text-gray-400 line-through opacity-50"
                      : "bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-gray-700 border border-green-200 hover:border-green-300 hover:shadow-md"
                  }`}
                  onClick={() => onClassFilter(travelClass)}
                >
                  {translateTravelClass(travelClass)}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Cartes de réduction */}
        <div>
          <h4 className="text-sm font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Cartes de réduction
          </h4>
          <div className="flex flex-wrap gap-3">
            {availableDiscountCards.map((discountCard, index) => {
              const isExcluded =
                filters.excludedDiscountCards.includes(discountCard);

              return (
                <Badge
                  key={`discount-${discountCard}-${index}`}
                  variant="secondary"
                  className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isExcluded
                      ? "bg-gray-100 text-gray-400 line-through opacity-50"
                      : "bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 text-gray-700 border border-purple-200 hover:border-purple-300 hover:shadow-md"
                  }`}
                  onClick={() => onDiscountCardFilter(discountCard)}
                >
                  {translateDiscountCard(discountCard)}
                </Badge>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalFiltersReusableWithDates;
