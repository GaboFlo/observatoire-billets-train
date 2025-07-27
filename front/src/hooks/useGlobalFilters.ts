import { useState, useMemo } from "react";
import { GroupedJourney } from "@/types/journey";

export interface GlobalFilters {
  selectedCarriers: string[];
  excludedCarriers: string[];
  selectedClasses: string[];
  excludedClasses: string[];
  selectedDiscountCards: string[];
  excludedDiscountCards: string[];
}

export const useGlobalFilters = (journeys: GroupedJourney[]) => {
  const [filters, setFilters] = useState<GlobalFilters>({
    selectedCarriers: [],
    excludedCarriers: [],
    selectedClasses: [],
    excludedClasses: [],
    selectedDiscountCards: [],
    excludedDiscountCards: [],
  });

  // Extraire toutes les options disponibles
  const availableOptions = useMemo(() => {
    const carriers = new Set<string>();
    const classes = new Set<string>();
    const discountCards = new Set<string>();

    journeys.forEach(journey => {
      journey.offers.forEach(offer => {
        carriers.add(offer.carrier);
        classes.add(offer.travelClass);
        discountCards.add(offer.discountCard);
      });
    });

    return {
      carriers: Array.from(carriers).sort(),
      classes: Array.from(classes).sort(),
      discountCards: Array.from(discountCards).sort(),
    };
  }, [journeys]);

  // Filtrer les trajets selon les filtres globaux
  const filteredJourneys = useMemo(() => {
    return journeys.map(journey => ({
      ...journey,
      offers: journey.offers.filter(offer => {
        // Filtre par compagnies
        if (filters.selectedCarriers.length > 0 && !filters.selectedCarriers.includes(offer.carrier)) {
          return false;
        }
        if (filters.excludedCarriers.includes(offer.carrier)) {
          return false;
        }

        // Filtre par classes
        if (filters.selectedClasses.length > 0 && !filters.selectedClasses.includes(offer.travelClass)) {
          return false;
        }
        if (filters.excludedClasses.includes(offer.travelClass)) {
          return false;
        }

        // Filtre par cartes de réduction
        if (filters.selectedDiscountCards.length > 0 && !filters.selectedDiscountCards.includes(offer.discountCard)) {
          return false;
        }
        if (filters.excludedDiscountCards.includes(offer.discountCard)) {
          return false;
        }

        return true;
      })
    })).filter(journey => journey.offers.length > 0);
  }, [journeys, filters]);

  const handleCarrierFilter = (carrier: string, isSelected: boolean) => {
    setFilters(prev => ({
      ...prev,
      selectedCarriers: isSelected 
        ? [...prev.selectedCarriers, carrier]
        : prev.selectedCarriers.filter(c => c !== carrier),
      excludedCarriers: !isSelected 
        ? [...prev.excludedCarriers, carrier]
        : prev.excludedCarriers.filter(c => c !== carrier),
    }));
  };

  const handleClassFilter = (travelClass: string, isSelected: boolean) => {
    setFilters(prev => ({
      ...prev,
      selectedClasses: isSelected 
        ? [...prev.selectedClasses, travelClass]
        : prev.selectedClasses.filter(c => c !== travelClass),
      excludedClasses: !isSelected 
        ? [...prev.excludedClasses, travelClass]
        : prev.excludedClasses.filter(c => c !== travelClass),
    }));
  };

  const handleDiscountCardFilter = (discountCard: string, isSelected: boolean) => {
    setFilters(prev => ({
      ...prev,
      selectedDiscountCards: isSelected 
        ? [...prev.selectedDiscountCards, discountCard]
        : prev.selectedDiscountCards.filter(c => c !== discountCard),
      excludedDiscountCards: !isSelected 
        ? [...prev.excludedDiscountCards, discountCard]
        : prev.excludedDiscountCards.filter(c => c !== discountCard),
    }));
  };

  const clearFilters = () => {
    setFilters({
      selectedCarriers: [],
      excludedCarriers: [],
      selectedClasses: [],
      excludedClasses: [],
      selectedDiscountCards: [],
      excludedDiscountCards: [],
    });
  };

  return {
    filters,
    availableOptions,
    filteredJourneys,
    handleCarrierFilter,
    handleClassFilter,
    handleDiscountCardFilter,
    clearFilters,
  };
}; 