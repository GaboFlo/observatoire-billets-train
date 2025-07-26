import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Train } from "lucide-react";
import { Link } from "react-router-dom";
import { GroupedJourney } from "@/types/journey";
import { FilterSection } from "./FilterSection";
import { PriceDisplay } from "./PriceDisplay";

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
          <PriceDisplay 
            minPrice={displayPrices.minPrice}
            avgPrice={displayPrices.avgPrice}
            maxPrice={displayPrices.maxPrice}
          />

          <div className="space-y-2">
            <FilterSection
              title="Compagnies"
              values={journey.carriers}
              type="carrier"
              filters={filters}
              onFilter={onCarrierFilter}
              onSelected={onSelectedCarriers}
              onExcluded={onExcludedCarriers}
            />

            <FilterSection
              title="Classes"
              values={journey.classes}
              type="travelClass"
              filters={filters}
              onFilter={onClassFilter}
              onSelected={onSelectedClasses}
              onExcluded={onExcludedClasses}
            />

            <FilterSection
              title="Cartes de réduction"
              values={journey.discountCards}
              type="discountCard"
              filters={filters}
              onFilter={onDiscountCardFilter}
              onSelected={onSelectedDiscountCards}
              onExcluded={onExcludedDiscountCards}
            />
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