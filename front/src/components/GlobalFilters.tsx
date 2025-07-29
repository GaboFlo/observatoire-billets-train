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
  onCarrierFilter: (carrier: string) => void;
  onClassFilter: (travelClass: string) => void;
  onDiscountCardFilter: (discountCard: string) => void;
}

const GlobalFilters = ({
  filters,
  availableOptions,
  onCarrierFilter,
  onClassFilter,
  onDiscountCardFilter,
}: GlobalFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
          <div className="space-y-4">
            {/* Compagnies */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-800">
                Compagnies
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableOptions.carriers.map((carrier: string) => {
                  const isExcluded = filters.excludedCarriers.includes(carrier);

                  return (
                    <Badge
                      key={carrier}
                      variant="secondary"
                      className={`cursor-pointer text-xs px-3 py-1.5 transition-colors ${
                        isExcluded
                          ? "bg-gray-100 text-gray-400 line-through"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                      onClick={() => onCarrierFilter(carrier)}
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
                  const isExcluded =
                    filters.excludedClasses.includes(travelClass);

                  return (
                    <Badge
                      key={travelClass}
                      variant="secondary"
                      className={`cursor-pointer text-xs px-3 py-1.5 transition-colors ${
                        isExcluded
                          ? "bg-gray-100 text-gray-400 line-through"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
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
              <h4 className="text-sm font-medium mb-3 text-gray-800">
                Cartes de réduction
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableOptions.discountCards.map((discountCard: string) => {
                  const isExcluded =
                    filters.excludedDiscountCards.includes(discountCard);

                  return (
                    <Badge
                      key={discountCard}
                      variant="secondary"
                      className={`cursor-pointer text-xs px-3 py-1.5 transition-colors ${
                        isExcluded
                          ? "bg-gray-100 text-gray-400 line-through"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                      onClick={() => onDiscountCardFilter(discountCard)}
                    >
                      {translateDiscountCard(discountCard)}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GlobalFilters;
