interface PriceDisplayProps {
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
}

export const PriceDisplay = ({ minPrice, avgPrice, maxPrice }: PriceDisplayProps) => {
  return (
    <div className="flex justify-between text-sm">
      <div>
        <p className="text-muted-foreground">Prix Min</p>
        <p className="font-medium text-lg">{minPrice}€</p>
      </div>
      <div>
        <p className="text-muted-foreground">Prix Moyen</p>
        <p className="font-medium text-lg">{avgPrice}€</p>
      </div>
      <div>
        <p className="text-muted-foreground">Prix Max</p>
        <p className="font-medium text-lg">{maxPrice}€</p>
      </div>
    </div>
  );
}; 