import { DetailedPricingResult } from "@/types/journey";
import { useMemo, useState } from "react";

interface JourneyDetailsFilters {
  carriers: string[];
  classes: string[];
  discountCards: string[];
  flexibilities: string[];
  selectedTrainName?: string;
  selectedDepartureDate?: string;
}

export const useJourneyDetailsFilters = (offers: DetailedPricingResult[]) => {
  const [filters, setFilters] = useState<JourneyDetailsFilters>({
    carriers: [],
    classes: [],
    discountCards: [], // Pas de filtre par défaut pour les données de graphique
    flexibilities: [], // Pas de filtre par défaut pour les données de graphique
  });

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      // Filtre par compagnie - inclure seulement si la liste est vide ou contient la compagnie
      if (
        filters.carriers.length > 0 &&
        !filters.carriers.includes(offer.carrier)
      ) {
        return false;
      }

      // Filtre par classe de voyage - inclure seulement si la liste est vide ou contient la classe
      if (
        filters.classes.length > 0 &&
        !filters.classes.includes(offer.travelClass)
      ) {
        return false;
      }

      // Filtre par carte de réduction - inclure seulement si la liste est vide ou contient la carte
      if (
        filters.discountCards.length > 0 &&
        !filters.discountCards.includes(offer.discountCard)
      ) {
        return false;
      }

      // Filtre par flexibilité - inclure seulement si la liste est vide ou contient la flexibilité
      if (
        filters.flexibilities.length > 0 &&
        !filters.flexibilities.includes(offer.flexibility)
      ) {
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
      carriers: prev.carriers.includes(carrier)
        ? prev.carriers.filter((c) => c !== carrier)
        : [...prev.carriers, carrier],
    }));
  };

  const handleClassFilter = (travelClass: string) => {
    setFilters((prev) => ({
      ...prev,
      classes: prev.classes.includes(travelClass)
        ? prev.classes.filter((c) => c !== travelClass)
        : [...prev.classes, travelClass],
    }));
  };

  const handleDiscountCardFilter = (discountCard: string) => {
    setFilters((prev) => ({
      ...prev,
      discountCards: prev.discountCards.includes(discountCard)
        ? prev.discountCards.filter((c) => c !== discountCard)
        : [...prev.discountCards, discountCard],
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
      carriers: [],
      classes: [],
      discountCards: [],
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
