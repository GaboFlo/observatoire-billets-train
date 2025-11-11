import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { truncatePrice } from "../../lib/utils";

interface PriceDisplayProps {
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
}

export const PriceDisplay = ({
  minPrice,
  avgPrice,
  maxPrice,
}: PriceDisplayProps) => {
  return (
    <div className="flex justify-between text-sm">
      <div>
        <p className="text-muted-foreground">Prix Min</p>
        <p className="font-medium text-lg">{truncatePrice(minPrice)}€</p>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            <p className="text-muted-foreground">Prix Moyen</p>
            <p className="font-medium text-lg">{truncatePrice(avgPrice)}€</p>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Si disponible, sinon, moyenne sur toutes les données filtrées</p>
        </TooltipContent>
      </Tooltip>
      <div>
        <p className="text-muted-foreground">Prix Max</p>
        <p className="font-medium text-lg">{truncatePrice(maxPrice)}€</p>
      </div>
    </div>
  );
};
