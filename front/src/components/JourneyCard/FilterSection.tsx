import { FilterBadge } from "./FilterBadge";
import { translateCarrier, translateTravelClass, translateDiscountCard } from "@/utils/translations";

interface FilterSectionProps {
  title: string;
  values: string[];
  type: "carrier" | "travelClass" | "discountCard";
  filters: any;
  onFilter: (value: string) => void;
  onSelected: (value: string) => void;
  onExcluded: (value: string) => void;
}

export const FilterSection = ({ 
  title, 
  values, 
  type, 
  filters, 
  onFilter, 
  onSelected, 
  onExcluded 
}: FilterSectionProps) => {
  const sortValues = (values: string[]) => {
    return [...values].sort((a, b) => {
      const aTranslated = getTranslation(a, type);
      const bTranslated = getTranslation(b, type);
      
      if (type === "travelClass") {
        // Seconde en premier
        if (aTranslated === "Seconde") return -1;
        if (bTranslated === "Seconde") return 1;
        
        // Première en deuxième
        if (aTranslated === "Première") return -1;
        if (bTranslated === "Première") return 1;
      } else if (type === "discountCard") {
        // "Aucune" en premier
        if (aTranslated === "Aucune") return -1;
        if (bTranslated === "Aucune") return 1;
      }
      
      // Puis ordre alphabétique
      return aTranslated.localeCompare(bTranslated, 'fr');
    });
  };

  const getTranslation = (value: string, type: string) => {
    switch (type) {
      case "carrier":
        return translateCarrier(value);
      case "travelClass":
        return translateTravelClass(value);
      case "discountCard":
        return translateDiscountCard(value);
      default:
        return value;
    }
  };

  const getFilterState = (value: string) => {
    let isSelected = false;
    let isExcluded = false;

    if (type === "travelClass") {
      // Pour les classes, vérifier à la fois selectedClass et selectedClasses
      isSelected = filters.selectedClass === value || filters.selectedClasses?.includes(value);
      isExcluded = filters.excludedClasses?.includes(value);
    } else if (type === "carrier") {
      // Pour les compagnies, vérifier à la fois selectedCarrier et selectedCarriers
      isSelected = filters.selectedCarrier === value || filters.selectedCarriers?.includes(value);
      isExcluded = filters.excludedCarriers?.includes(value);
    } else if (type === "discountCard") {
      // Pour les cartes de réduction, vérifier à la fois selectedDiscountCard et selectedDiscountCards
      isSelected = filters.selectedDiscountCard === value || filters.selectedDiscountCards?.includes(value);
      isExcluded = filters.excludedDiscountCards?.includes(value);
    }
    
    return { isSelected, isExcluded };
  };

  const handleClick = (value: string) => {
    const { isSelected, isExcluded } = getFilterState(value);
    
    if (isSelected) {
      // Si incluse (verte), on l'exclut
      if (type === "travelClass" && filters.selectedClass === value) {
        onFilter(value);
      } else if (type === "carrier" && filters.selectedCarrier === value) {
        onFilter(value);
      } else if (type === "discountCard" && filters.selectedDiscountCard === value) {
        onFilter(value);
      } else {
        onSelected(value);
      }
      onExcluded(value);
    } else if (isExcluded) {
      // Si exclue (rouge), on la réactive
      onExcluded(value);
    } else {
      // Si neutre, on l'inclut
      if (type === "travelClass" && filters.selectedClass === value) {
        onFilter(value);
      } else if (type === "carrier" && filters.selectedCarrier === value) {
        onFilter(value);
      } else if (type === "discountCard" && filters.selectedDiscountCard === value) {
        onFilter(value);
      } else {
        onSelected(value);
      }
    }
  };

  const getTitle = (value: string) => {
    const { isSelected, isExcluded } = getFilterState(value);
    
    if (isSelected) {
      return "Cliquer pour exclure";
    } else if (isExcluded) {
      return "Cliquer pour inclure";
    } else {
      return "Cliquer pour inclure";
    }
  };

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {sortValues(values).map((value) => {
          const { isSelected, isExcluded } = getFilterState(value);
          
          return (
            <FilterBadge
              key={value}
              value={value}
              type={type}
              isSelected={isSelected}
              isExcluded={isExcluded}
              onClick={() => handleClick(value)}
              title={getTitle(value)}
            />
          );
        })}
      </div>
    </div>
  );
}; 