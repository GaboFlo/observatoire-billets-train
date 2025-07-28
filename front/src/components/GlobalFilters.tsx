import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { GlobalFilters as GlobalFiltersType } from "../hooks/useGlobalFilters";
import {
  translateCarrier,
  translateDiscountCard,
  translateTravelClass,
} from "../utils/translations";

interface GlobalFiltersProps {
  filters: GlobalFiltersType;
  availableOptions: {
    carriers: string[];
    classes: string[];
    discountCards: string[];
  };
  onCarrierFilter: (carrier: string, isSelected: boolean) => void;
  onClassFilter: (travelClass: string, isSelected: boolean) => void;
  onDiscountCardFilter: (discountCard: string, isSelected: boolean) => void;
  onClearFilters: () => void;
}

const GlobalFilters = ({
  filters,
  availableOptions,
  onCarrierFilter,
  onClassFilter,
  onDiscountCardFilter,
  onClearFilters,
}: GlobalFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters =
    filters.selectedCarriers.length > 0 ||
    filters.excludedCarriers.length > 0 ||
    filters.selectedClasses.length > 0 ||
    filters.excludedClasses.length > 0 ||
    filters.selectedDiscountCards.length > 0 ||
    filters.excludedDiscountCards.length > 0;

  const handleFilterSelect = (
    value: string,
    onFilter: (value: string, isSelected: boolean) => void
  ) => {
    onFilter(value, true);
  };

  const handleFilterExclude = (
    value: string,
    onFilter: (value: string, isSelected: boolean) => void
  ) => {
    onFilter(value, false);
  };

  const handleFilterClick = (
    value: string,
    isSelected: boolean,
    isExcluded: boolean,
    onFilter: (value: string, isSelected: boolean) => void
  ) => {
    if (isSelected) {
      handleFilterExclude(value, onFilter);
    } else if (isExcluded) {
      handleFilterSelect(value, onFilter);
    } else {
      handleFilterSelect(value, onFilter);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-800">Filtres</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Réduire
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Déplier
              </>
            )}
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isExpanded && (
          <>
            <div className="space-y-4">
              {/* Compagnies */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-gray-800">
                  Compagnies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {availableOptions.carriers.map((carrier: string) => {
                    const isSelected =
                      filters.selectedCarriers.includes(carrier);
                    const isExcluded =
                      filters.excludedCarriers.includes(carrier);

                    return (
                      <Badge
                        key={carrier}
                        variant="secondary"
                        className={`cursor-pointer text-xs px-3 py-1.5 transition-colors ${
                          isSelected
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : isExcluded
                            ? "bg-gray-100 text-gray-400 line-through"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                        }`}
                        onClick={() =>
                          handleFilterClick(
                            carrier,
                            isSelected,
                            isExcluded,
                            onCarrierFilter
                          )
                        }
                      >
                        {translateCarrier(carrier)}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Classes */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-gray-800">
                  Classes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {availableOptions.classes.map((travelClass: string) => {
                    const isSelected =
                      filters.selectedClasses.includes(travelClass);
                    const isExcluded =
                      filters.excludedClasses.includes(travelClass);

                    return (
                      <Badge
                        key={travelClass}
                        variant="secondary"
                        className={`cursor-pointer text-xs px-3 py-1.5 transition-colors ${
                          isSelected
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : isExcluded
                            ? "bg-gray-100 text-gray-400 line-through"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                        }`}
                        onClick={() =>
                          handleFilterClick(
                            travelClass,
                            isSelected,
                            isExcluded,
                            onClassFilter
                          )
                        }
                      >
                        {translateTravelClass(travelClass)}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Cartes de réduction */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-gray-800">
                  Cartes de réduction
                </h4>
                <div className="flex flex-wrap gap-2">
                  {availableOptions.discountCards.map(
                    (discountCard: string) => {
                      const isSelected =
                        filters.selectedDiscountCards.includes(discountCard);
                      const isExcluded =
                        filters.excludedDiscountCards.includes(discountCard);

                      return (
                        <Badge
                          key={discountCard}
                          variant="secondary"
                          className={`cursor-pointer text-xs px-3 py-1.5 transition-colors ${
                            isSelected
                              ? "bg-purple-500 hover:bg-purple-600 text-white"
                              : isExcluded
                              ? "bg-gray-100 text-gray-400 line-through"
                              : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                          onClick={() =>
                            handleFilterClick(
                              discountCard,
                              isSelected,
                              isExcluded,
                              onDiscountCardFilter
                            )
                          }
                        >
                          {translateDiscountCard(discountCard)}
                        </Badge>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            {/* Boutons d'action en bas */}
            <div className="mt-4">
              {hasActiveFilters && (
                <button
                  onClick={onClearFilters}
                  className="w-full text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Effacer tous les filtres
                </button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GlobalFilters;
