import JourneyCard from "./JourneyCard";
import { GroupedJourney, JourneyFilters } from "@/types/journey";

interface JourneysTabProps {
  journeys: GroupedJourney[];
  journeyFilters: JourneyFilters;
  onClassFilter: (journeyId: string, travelClass: string) => void;
  onCarrierFilter: (journeyId: string, carrier: string) => void;
  onDiscountCardFilter: (journeyId: string, discountCard: string) => void;
}

const JourneysTab = ({
  journeys,
  journeyFilters,
  onClassFilter,
  onCarrierFilter,
  onDiscountCardFilter,
}: JourneysTabProps) => {
  const calculateFilteredPrices = (
    journey: GroupedJourney,
    filters: {
      selectedCarrier?: string;
      selectedClass?: string;
      selectedDiscountCard?: string;
    }
  ) => {
    let filteredOffers = journey.offers;

    if (filters.selectedClass) {
      filteredOffers = filteredOffers.filter(
        (offer) => offer.travelClass === filters.selectedClass
      );
    }

    if (filters.selectedDiscountCard) {
      filteredOffers = filteredOffers.filter(
        (offer) => offer.discountCard === filters.selectedDiscountCard
      );
    }

    if (filters.selectedCarrier) {
      filteredOffers = filteredOffers.filter(
        (offer) => offer.carrier === filters.selectedCarrier
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
            onCarrierFilter={(carrier) =>
              onCarrierFilter(journey.id, carrier)
            }
            onDiscountCardFilter={(discountCard) =>
              onDiscountCardFilter(journey.id, discountCard)
            }
            filteredPrices={filteredPrices}
          />
        );
      })}
    </div>
  );
};

export default JourneysTab; 