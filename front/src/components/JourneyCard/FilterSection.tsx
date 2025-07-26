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
    const isSelected = filters[`selected${type.charAt(0).toUpperCase() + type.slice(1)}`] === value || 
                      filters[`selected${type.charAt(0).toUpperCase() + type.slice(1)}s`]?.includes(value);
    const isExcluded = filters[`excluded${type.charAt(0).toUpperCase() + type.slice(1)}s`]?.includes(value);
    
    return { isSelected, isExcluded };
  };

  const handleClick = (value: string) => {
    const { isSelected, isExcluded } = getFilterState(value);
    
    if (isSelected) {
      // Si incluse (verte), on l'exclut
      if (filters[`selected${type.charAt(0).toUpperCase() + type.slice(1)}`] === value) {
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
      if (filters[`selected${type.charAt(0).toUpperCase() + type.slice(1)}`] === value) {
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