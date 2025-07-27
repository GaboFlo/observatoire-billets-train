import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalFilters as GlobalFiltersType } from "@/hooks/useGlobalFilters";
import { translateCarrier, translateDiscountCard, translateTravelClass } from "@/utils/translations";

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
  const hasActiveFilters = 
    filters.selectedCarriers.length > 0 ||
    filters.excludedCarriers.length > 0 ||
    filters.selectedClasses.length > 0 ||
    filters.excludedClasses.length > 0 ||
    filters.selectedDiscountCards.length > 0 ||
    filters.excludedDiscountCards.length > 0;

  const handleFilterClick = (
    value: string,
    isSelected: boolean,
    isExcluded: boolean,
    onFilter: (value: string, isSelected: boolean) => void
  ) => {
    if (isSelected) {
      // Si sélectionné, passer à exclu
      onFilter(value, false);
    } else if (isExcluded) {
      // Si exclu, passer à sélectionné
      onFilter(value, true);
    } else {
      // Si neutre, passer à sélectionné
      onFilter(value, true);
    }
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Filtres globaux</CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Effacer les filtres
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Compagnies */}
          <div>
            <h4 className="text-sm font-medium mb-2 text-gray-700">{"Compagnies"}</h4>
            <div className="flex flex-wrap gap-1">
              {availableOptions.carriers.map((carrier) => {
                const isSelected = filters.selectedCarriers.includes(carrier);
                const isExcluded = filters.excludedCarriers.includes(carrier);
                
                return (
                  <Badge
                    key={carrier}
                    variant="secondary"
                    className={`cursor-pointer text-xs px-2 py-1 ${
                      isSelected ? 'bg-blue-500 hover:bg-blue-600 text-white' : 
                      isExcluded ? 'bg-gray-100 text-gray-400 line-through' : 
                      'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    onClick={() => handleFilterClick(carrier, isSelected, isExcluded, onCarrierFilter)}
                  >
                    {translateCarrier(carrier)}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Classes */}
          <div>
            <h4 className="text-sm font-medium mb-2 text-gray-700">{"Classes"}</h4>
            <div className="flex flex-wrap gap-1">
              {availableOptions.classes.map((travelClass) => {
                const isSelected = filters.selectedClasses.includes(travelClass);
                const isExcluded = filters.excludedClasses.includes(travelClass);
                
                return (
                  <Badge
                    key={travelClass}
                    variant="secondary"
                    className={`cursor-pointer text-xs px-2 py-1 ${
                      isSelected ? 'bg-green-500 hover:bg-green-600 text-white' : 
                      isExcluded ? 'bg-gray-100 text-gray-400 line-through' : 
                      'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    onClick={() => handleFilterClick(travelClass, isSelected, isExcluded, onClassFilter)}
                  >
                    {translateTravelClass(travelClass)}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Cartes de réduction */}
          <div>
            <h4 className="text-sm font-medium mb-2 text-gray-700">{"Cartes de réduction"}</h4>
            <div className="flex flex-wrap gap-1">
              {availableOptions.discountCards.map((discountCard) => {
                const isSelected = filters.selectedDiscountCards.includes(discountCard);
                const isExcluded = filters.excludedDiscountCards.includes(discountCard);
                
                return (
                  <Badge
                    key={discountCard}
                    variant="secondary"
                    className={`cursor-pointer text-xs px-2 py-1 ${
                      isSelected ? 'bg-purple-500 hover:bg-purple-600 text-white' : 
                      isExcluded ? 'bg-gray-100 text-gray-400 line-through' : 
                      'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    onClick={() => handleFilterClick(discountCard, isSelected, isExcluded, onDiscountCardFilter)}
                  >
                    {translateDiscountCard(discountCard)}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalFilters; 