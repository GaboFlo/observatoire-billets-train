import { Badge } from "@/components/ui/badge";
import TranslatedText from "../TranslatedText";

interface FilterBadgeProps {
  value: string;
  type: "carrier" | "travelClass" | "discountCard";
  isSelected: boolean;
  isExcluded: boolean;
  onClick: () => void;
  title: string;
}

export const FilterBadge = ({ 
  value, 
  type, 
  isSelected, 
  isExcluded, 
  onClick, 
  title 
}: FilterBadgeProps) => {
  return (
    <Badge
      variant={
        isSelected ? "default" : isExcluded ? "destructive" : "secondary"
      }
      className={`text-xs cursor-pointer transition-all duration-200 transform hover:scale-105 ${
        isSelected
          ? "bg-green-600 text-white shadow-sm"
          : isExcluded
          ? "bg-red-100 text-red-700 line-through shadow-sm"
          : "hover:bg-secondary hover:shadow-sm"
      }`}
      onClick={onClick}
      title={title}
    >
      <TranslatedText value={value} type={type} />
    </Badge>
  );
}; 