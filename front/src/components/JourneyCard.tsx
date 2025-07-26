import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Train } from "lucide-react";
import { Link } from "react-router-dom";
import { GroupedJourney } from "@/types/journey";
import TranslatedText from "./TranslatedText";
import { translateCarrier, translateTravelClass, translateDiscountCard } from "@/utils/translations";

interface JourneyFilters {
  selectedClass?: string;
  selectedDiscountCard?: string;
  selectedCarrier?: string;
}

interface JourneyCardProps {
  journey: GroupedJourney;
  filters: JourneyFilters;
  onClassFilter: (travelClass: string) => void;
  onCarrierFilter: (carrier: string) => void;
  onDiscountCardFilter: (discountCard: string) => void;
  filteredPrices: {
    minPrice: number;
    avgPrice: number;
    maxPrice: number;
  };
}

const JourneyCard = ({
  journey,
  filters,
  onClassFilter,
  onCarrierFilter,
  onDiscountCardFilter,
  filteredPrices,
}: JourneyCardProps) => {
  const displayPrices = Object.keys(filters).some(
    (key) => filters[key as keyof typeof filters]
  )
    ? filteredPrices
    : {
        minPrice: journey.minPrice,
        avgPrice: journey.avgPrice,
        maxPrice: journey.maxPrice,
      };

  // Fonctions de tri
  const sortCarriers = (carriers: string[]) => {
    return [...carriers].sort((a, b) => 
      translateCarrier(a).localeCompare(translateCarrier(b), 'fr')
    );
  };

  const sortClasses = (classes: string[]) => {
    return [...classes].sort((a, b) => {
      const aTranslated = translateTravelClass(a);
      const bTranslated = translateTravelClass(b);
      
      // Seconde en premier
      if (aTranslated === "Seconde") return -1;
      if (bTranslated === "Seconde") return 1;
      
      // Première en deuxième
      if (aTranslated === "Première") return -1;
      if (bTranslated === "Première") return 1;
      
      // Puis ordre alphabétique
      return aTranslated.localeCompare(bTranslated, 'fr');
    });
  };

  const sortDiscountCards = (cards: string[]) => {
    return [...cards].sort((a, b) => {
      const aTranslated = translateDiscountCard(a);
      const bTranslated = translateDiscountCard(b);
      
      // "Aucune" en premier
      if (aTranslated === "Aucune") return -1;
      if (bTranslated === "Aucune") return 1;
      
      // Puis ordre alphabétique
      return aTranslated.localeCompare(bTranslated, 'fr');
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Train className="h-5 w-5" />
          {journey.name}
        </CardTitle>
        <CardDescription>
          {journey.departureStation} → {journey.arrivalStation}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-muted-foreground">Prix Min</p>
              <p className="font-medium text-lg">{displayPrices.minPrice}€</p>
            </div>
            <div>
              <p className="text-muted-foreground">Prix Moyen</p>
              <p className="font-medium text-lg">{displayPrices.avgPrice}€</p>
            </div>
            <div>
              <p className="text-muted-foreground">Prix Max</p>
              <p className="font-medium text-lg">{displayPrices.maxPrice}€</p>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Compagnies</p>
                                          <div className="flex flex-wrap gap-1">
                              {sortCarriers(journey.carriers).map((carrier) => (
                                <Badge
                                  key={carrier}
                                  variant={
                                    filters.selectedCarrier === carrier ? "default" : "outline"
                                  }
                                  className={`text-xs cursor-pointer transition-colors ${
                                    filters.selectedCarrier === carrier
                                      ? "bg-primary text-primary-foreground"
                                      : "hover:bg-secondary"
                                  }`}
                                  onClick={() => onCarrierFilter(carrier)}
                                >
                                  <TranslatedText value={carrier} type="carrier" />
                                </Badge>
                              ))}
                            </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Classes</p>
                                          <div className="flex flex-wrap gap-1">
                              {sortClasses(journey.classes).map((travelClass) => (
                                <Badge
                                  key={travelClass}
                                  variant={
                                    filters.selectedClass === travelClass ? "default" : "outline"
                                  }
                                  className={`text-xs cursor-pointer transition-colors ${
                                    filters.selectedClass === travelClass
                                      ? "bg-primary text-primary-foreground"
                                      : "hover:bg-secondary"
                                  }`}
                                  onClick={() => onClassFilter(travelClass)}
                                >
                                  <TranslatedText value={travelClass} type="travelClass" />
                                </Badge>
                              ))}
                            </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Cartes de réduction
              </p>
                                          <div className="flex flex-wrap gap-1">
                              {sortDiscountCards(journey.discountCards).slice(0, 3).map((card) => (
                                <Badge
                                  key={card}
                                  variant={
                                    filters.selectedDiscountCard === card
                                      ? "default"
                                      : "secondary"
                                  }
                                  className={`text-xs cursor-pointer transition-colors ${
                                    filters.selectedDiscountCard === card
                                      ? "bg-primary text-primary-foreground"
                                      : "hover:bg-secondary"
                                  }`}
                                  onClick={() => onDiscountCardFilter(card)}
                                >
                                  <TranslatedText value={card} type="discountCard" />
                                </Badge>
                              ))}
                {journey.discountCards.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{journey.discountCards.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {Object.keys(filters).some(
              (key) => filters[key as keyof typeof filters]
            ) ? (
              <span>
                Offres filtrées :{" "}
                {
                  journey.offers.filter(
                    (offer) =>
                      (!filters.selectedClass ||
                        offer.travelClass === filters.selectedClass) &&
                      (!filters.selectedDiscountCard ||
                        offer.discountCard === filters.selectedDiscountCard)
                  ).length
                }{" "}
                sur {journey.offers.length}
              </span>
            ) : (
              <span>
                {journey.offers.length} offre
                {journey.offers.length > 1 ? "s" : ""} disponible
                {journey.offers.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" asChild className="w-full">
          <Link to={`/journey/${journey.id}`}>Analyse détaillée</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JourneyCard; 