import { DetailedPricingResult } from "@/types/journey";
import { useMemo, useState } from "react";

interface JourneyDetailsFilters {
  excludedCarriers: string[];
  excludedClasses: string[];
  excludedDiscountCards: string[];
  selectedTrainName?: string;
  selectedDepartureDate?: string;
}

export const useJourneyDetailsFilters = (offers: DetailedPricingResult[]) => {
  const [filters, setFilters] = useState<JourneyDetailsFilters>({
    excludedCarriers: [],
    excludedClasses: [],
    excludedDiscountCards: [],
  });

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      // Filtre par compagnie
      if (filters.excludedCarriers.includes(offer.carrier)) {
        return false;
      }

      // Filtre par classe de voyage
      if (filters.excludedClasses.includes(offer.travelClass)) {
        return false;
      }

      // Filtre par carte de réduction
      if (filters.excludedDiscountCards.includes(offer.discountCard)) {
        return false;
      }

      // Filtre par train spécifique
      if (
        filters.selectedTrainName &&
        offer.trainName !== filters.selectedTrainName
      ) {
        return false;
      }

      // Filtre par date de départ
      if (
        filters.selectedDepartureDate &&
        offer.departureDate !== filters.selectedDepartureDate
      ) {
        return false;
      }

      return true;
    });
  }, [offers, filters]);

  const handleCarrierFilter = (carrier: string) => {
    setFilters((prev) => ({
      ...prev,
      excludedCarriers: prev.excludedCarriers.includes(carrier)
        ? prev.excludedCarriers.filter((c) => c !== carrier)
        : [...prev.excludedCarriers, carrier],
    }));
  };

  const handleClassFilter = (travelClass: string) => {
    setFilters((prev) => ({
      ...prev,
      excludedClasses: prev.excludedClasses.includes(travelClass)
        ? prev.excludedClasses.filter((c) => c !== travelClass)
        : [...prev.excludedClasses, travelClass],
    }));
  };

  const handleDiscountCardFilter = (discountCard: string) => {
    setFilters((prev) => ({
      ...prev,
      excludedDiscountCards: prev.excludedDiscountCards.includes(discountCard)
        ? prev.excludedDiscountCards.filter((c) => c !== discountCard)
        : [...prev.excludedDiscountCards, discountCard],
    }));
  };

  const handleTrainSelect = (trainName: string, departureDate: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedTrainName:
        prev.selectedTrainName === trainName ? undefined : trainName,
      selectedDepartureDate:
        prev.selectedDepartureDate === departureDate
          ? undefined
          : departureDate,
    }));
  };

  const clearFilters = () => {
    setFilters({
      excludedCarriers: [],
      excludedClasses: [],
      excludedDiscountCards: [],
    });
  };

  const clearTrainFilter = () => {
    setFilters((prev) => ({
      ...prev,
      selectedTrainName: undefined,
      selectedDepartureDate: undefined,
    }));
  };

  return {
    filters,
    filteredOffers,
    handleCarrierFilter,
    handleClassFilter,
    handleDiscountCardFilter,
    handleTrainSelect,
    clearFilters,
    clearTrainFilter,
  };
};
