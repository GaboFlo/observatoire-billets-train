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
import { Train, Check, X, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { GroupedJourney } from "@/types/journey";
import TranslatedText from "./TranslatedText";
import { translateCarrier, translateTravelClass, translateDiscountCard } from "@/utils/translations";

interface JourneyFilters {
  selectedClass?: string;
  selectedDiscountCard?: string;
  selectedCarrier?: string;
  selectedDiscountCards?: string[];
  excludedDiscountCards?: string[];
  selectedClasses?: string[];
  excludedClasses?: string[];
  selectedCarriers?: string[];
  excludedCarriers?: string[];
}

interface JourneyCardProps {
  journey: GroupedJourney;
  filters: JourneyFilters;
  onClassFilter: (travelClass: string) => void;
  onSelectedClasses: (travelClass: string) => void;
  onExcludedClasses: (travelClass: string) => void;
  onCarrierFilter: (carrier: string) => void;
  onSelectedCarriers: (carrier: string) => void;
  onExcludedCarriers: (carrier: string) => void;
  onDiscountCardFilter: (discountCard: string) => void;
  onSelectedDiscountCards: (discountCard: string) => void;
  onExcludedDiscountCards: (discountCard: string) => void;
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
  onSelectedClasses,
  onExcludedClasses,
  onCarrierFilter,
  onSelectedCarriers,
  onExcludedCarriers,
  onDiscountCardFilter,
  onSelectedDiscountCards,
  onExcludedDiscountCards,
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

  // Calculer le nombre d'offres filtrées en tenant compte des exclusions
  const getFilteredOffersCount = () => {
    let filteredOffers = journey.offers;

    if (filters.selectedClass) {
      filteredOffers = filteredOffers.filter(
        (offer) => offer.travelClass === filters.selectedClass
      );
    }

    if (filters.selectedClasses && filters.selectedClasses.length > 0) {
      filteredOffers = filteredOffers.filter(
        (offer) => filters.selectedClasses!.includes(offer.travelClass)
      );
    }

    if (filters.excludedClasses && filters.excludedClasses.length > 0) {
      filteredOffers = filteredOffers.filter(
        (offer) => !filters.excludedClasses!.includes(offer.travelClass)
      );
    }

    if (filters.selectedDiscountCard) {
      filteredOffers = filteredOffers.filter(
        (offer) => offer.discountCard === filters.selectedDiscountCard
      );
    }

    if (filters.selectedDiscountCards && filters.selectedDiscountCards.length > 0) {
      filteredOffers = filteredOffers.filter(
        (offer) => filters.selectedDiscountCards!.includes(offer.discountCard)
      );
    }

    if (filters.excludedDiscountCards && filters.excludedDiscountCards.length > 0) {
      filteredOffers = filteredOffers.filter(
        (offer) => !filters.excludedDiscountCards!.includes(offer.discountCard)
      );
    }

    if (filters.selectedCarrier) {
      filteredOffers = filteredOffers.filter(
        (offer) => offer.carrier === filters.selectedCarrier
      );
    }

    if (filters.selectedCarriers && filters.selectedCarriers.length > 0) {
      filteredOffers = filteredOffers.filter(
        (offer) => filters.selectedCarriers!.includes(offer.carrier)
      );
    }

    if (filters.excludedCarriers && filters.excludedCarriers.length > 0) {
      filteredOffers = filteredOffers.filter(
        (offer) => !filters.excludedCarriers!.includes(offer.carrier)
      );
    }

    return filteredOffers.length;
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
              <div className="flex flex-wrap gap-1.5">
                {sortCarriers(journey.carriers).map((carrier) => {
                  const isSelected = filters.selectedCarrier === carrier || filters.selectedCarriers?.includes(carrier);
                  const isExcluded = filters.excludedCarriers?.includes(carrier);
                  
                  return (
                    <Badge
                      key={carrier}
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
                      onClick={() => {
                        if (isSelected) {
                          // Si incluse (verte), on l'exclut
                          if (filters.selectedCarrier === carrier) {
                            onCarrierFilter(carrier);
                          } else {
                            onSelectedCarriers(carrier);
                          }
                          onExcludedCarriers(carrier);
                        } else if (isExcluded) {
                          // Si exclue (rouge), on la réactive
                          onExcludedCarriers(carrier);
                        } else {
                          // Si neutre, on l'inclut
                          if (filters.selectedCarrier === carrier) {
                            onCarrierFilter(carrier);
                          } else {
                            onSelectedCarriers(carrier);
                          }
                        }
                      }}
                      title={
                        isSelected 
                          ? "Cliquer pour exclure" 
                          : isExcluded 
                          ? "Cliquer pour inclure" 
                          : "Cliquer pour inclure"
                      }
                    >
                      <TranslatedText value={carrier} type="carrier" />
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Classes</p>
              <div className="flex flex-wrap gap-1.5">
                {sortClasses(journey.classes).map((travelClass) => {
                  const isSelected = filters.selectedClass === travelClass || filters.selectedClasses?.includes(travelClass);
                  const isExcluded = filters.excludedClasses?.includes(travelClass);
                  
                  return (
                    <Badge
                      key={travelClass}
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
                      onClick={() => {
                        if (isSelected) {
                          // Si incluse (verte), on l'exclut
                          if (filters.selectedClass === travelClass) {
                            onClassFilter(travelClass);
                          } else {
                            onSelectedClasses(travelClass);
                          }
                          onExcludedClasses(travelClass);
                        } else if (isExcluded) {
                          // Si exclue (rouge), on la réactive
                          onExcludedClasses(travelClass);
                        } else {
                          // Si neutre, on l'inclut
                          if (filters.selectedClass === travelClass) {
                            onClassFilter(travelClass);
                          } else {
                            onSelectedClasses(travelClass);
                          }
                        }
                      }}
                      title={
                        isSelected 
                          ? "Cliquer pour exclure" 
                          : isExcluded 
                          ? "Cliquer pour inclure" 
                          : "Cliquer pour inclure"
                      }
                    >
                      <TranslatedText value={travelClass} type="travelClass" />
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Cartes de réduction
              </p>
              <div className="flex flex-wrap gap-1.5">
                {sortDiscountCards(journey.discountCards).map((card) => {
                  const isSelected = filters.selectedDiscountCard === card || filters.selectedDiscountCards?.includes(card);
                  const isExcluded = filters.excludedDiscountCards?.includes(card);
                  
                  return (
                    <Badge
                      key={card}
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
                      onClick={() => {
                        if (isSelected) {
                          // Si incluse (verte), on l'exclut
                          if (filters.selectedDiscountCard === card) {
                            onDiscountCardFilter(card);
                          } else {
                            onSelectedDiscountCards(card);
                          }
                          onExcludedDiscountCards(card);
                        } else if (isExcluded) {
                          // Si exclue (rouge), on la réactive
                          onExcludedDiscountCards(card);
                        } else {
                          // Si neutre, on l'inclut
                          if (filters.selectedDiscountCard === card) {
                            onDiscountCardFilter(card);
                          } else {
                            onSelectedDiscountCards(card);
                          }
                        }
                      }}
                      title={
                        isSelected 
                          ? "Cliquer pour exclure" 
                          : isExcluded 
                          ? "Cliquer pour inclure" 
                          : "Cliquer pour inclure"
                      }
                    >
                      <TranslatedText value={card} type="discountCard" />
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {Object.keys(filters).some(
              (key) => filters[key as keyof typeof filters]
            ) ? (
              <span>
                Offres filtrées :{" "}
                {getFilteredOffersCount()} sur {journey.offers.length}
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