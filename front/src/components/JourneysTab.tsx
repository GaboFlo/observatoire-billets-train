import JourneyCard from "./JourneyCard";
import { GroupedJourney, JourneyFilters } from "@/types/journey";

interface JourneysTabProps {
  journeys: GroupedJourney[];
  journeyFilters: JourneyFilters;
  onClassFilter: (journeyId: string, travelClass: string) => void;
  onSelectedClasses: (journeyId: string, travelClass: string) => void;
  onExcludedClasses: (journeyId: string, travelClass: string) => void;
  onCarrierFilter: (journeyId: string, carrier: string) => void;
  onSelectedCarriers: (journeyId: string, carrier: string) => void;
  onExcludedCarriers: (journeyId: string, carrier: string) => void;
  onDiscountCardFilter: (journeyId: string, discountCard: string) => void;
  onSelectedDiscountCards: (journeyId: string, discountCard: string) => void;
  onExcludedDiscountCards: (journeyId: string, discountCard: string) => void;
}

const JourneysTab = ({
  journeys,
  journeyFilters,
  onClassFilter,
  onSelectedClasses,
  onExcludedClasses,
  onCarrierFilter,
  onSelectedCarriers,
  onExcludedCarriers,
  onDiscountCardFilter,
  onSelectedDiscountCards,
  onExcludedDiscountCards,
}: JourneysTabProps) => {
  const calculateFilteredPrices = (
    journey: GroupedJourney,
    filters: {
      selectedCarrier?: string;
      selectedCarriers?: string[];
      excludedCarriers?: string[];
      selectedClass?: string;
      selectedClasses?: string[];
      excludedClasses?: string[];
      selectedDiscountCard?: string;
      selectedDiscountCards?: string[];
      excludedDiscountCards?: string[];
    }
  ) => {
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

    if (filteredOffers.length === 0) {
      return { minPrice: 0, avgPrice: 0, maxPrice: 0 };
    }

    const allPrices = [
      ...filteredOffers.map((o) => o.minPrice),
      ...filteredOffers.map((o) => o.avgPrice),
      ...filteredOffers.map((o) => o.maxPrice),
    ];

    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const avgPrice =
      allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;

    return {
      minPrice,
      maxPrice,
      avgPrice: Math.round(avgPrice),
    };
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {journeys.map((journey) => {
        const currentFilters = journeyFilters[journey.id] || {};
        const filteredPrices = calculateFilteredPrices(journey, currentFilters);

        return (
          <JourneyCard
            key={journey.id}
            journey={journey}
            filters={currentFilters}
            onClassFilter={(travelClass) =>
              onClassFilter(journey.id, travelClass)
            }
            onSelectedClasses={(travelClass) =>
              onSelectedClasses(journey.id, travelClass)
            }
            onExcludedClasses={(travelClass) =>
              onExcludedClasses(journey.id, travelClass)
            }
            onCarrierFilter={(carrier) =>
              onCarrierFilter(journey.id, carrier)
            }
            onSelectedCarriers={(carrier) =>
              onSelectedCarriers(journey.id, carrier)
            }
            onExcludedCarriers={(carrier) =>
              onExcludedCarriers(journey.id, carrier)
            }
            onDiscountCardFilter={(discountCard) =>
              onDiscountCardFilter(journey.id, discountCard)
            }
            onSelectedDiscountCards={(discountCard) =>
              onSelectedDiscountCards(journey.id, discountCard)
            }
            onExcludedDiscountCards={(discountCard) =>
              onExcludedDiscountCards(journey.id, discountCard)
            }
            filteredPrices={filteredPrices}
          />
        );
      })}
    </div>
  );
};

export default JourneysTab; 