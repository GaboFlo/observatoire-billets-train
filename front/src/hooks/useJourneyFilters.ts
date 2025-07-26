import { useState } from "react";
import { JourneyFilters } from "@/types/journey";

export const useJourneyFilters = () => {
  const [journeyFilters, setJourneyFilters] = useState<JourneyFilters>({});

  const handleClassFilter = (journeyId: string, travelClass: string) => {
    setJourneyFilters((prev) => {
      const currentFilters = prev[journeyId] || {};
      const newSelectedClass =
        currentFilters.selectedClass === travelClass ? undefined : travelClass;

      return {
        ...prev,
        [journeyId]: {
          ...currentFilters,
          selectedClass: newSelectedClass,
        },
      };
    });
  };

  const handleSelectedClasses = (journeyId: string, travelClass: string) => {
    setJourneyFilters((prev) => {
      const currentFilters = prev[journeyId] || {};
      const currentSelected = currentFilters.selectedClasses || [];
      
      const newSelected = currentSelected.includes(travelClass)
        ? currentSelected.filter(cls => cls !== travelClass)
        : [...currentSelected, travelClass];

      return {
        ...prev,
        [journeyId]: {
          ...currentFilters,
          selectedClasses: newSelected.length > 0 ? newSelected : undefined,
        },
      };
    });
  };

  const handleExcludedClasses = (journeyId: string, travelClass: string) => {
    setJourneyFilters((prev) => {
      const currentFilters = prev[journeyId] || {};
      const currentExcluded = currentFilters.excludedClasses || [];
      
      const newExcluded = currentExcluded.includes(travelClass)
        ? currentExcluded.filter(cls => cls !== travelClass)
        : [...currentExcluded, travelClass];

      return {
        ...prev,
        [journeyId]: {
          ...currentFilters,
          excludedClasses: newExcluded.length > 0 ? newExcluded : undefined,
        },
      };
    });
  };

  const handleCarrierFilter = (journeyId: string, carrier: string) => {
    setJourneyFilters((prev) => {
      const currentFilters = prev[journeyId] || {};
      const newSelectedCarrier =
        currentFilters.selectedCarrier === carrier ? undefined : carrier;

      return {
        ...prev,
        [journeyId]: {
          ...currentFilters,
          selectedCarrier: newSelectedCarrier,
        },
      };
    });
  };

  const handleSelectedCarriers = (journeyId: string, carrier: string) => {
    setJourneyFilters((prev) => {
      const currentFilters = prev[journeyId] || {};
      const currentSelected = currentFilters.selectedCarriers || [];
      
      const newSelected = currentSelected.includes(carrier)
        ? currentSelected.filter(car => car !== carrier)
        : [...currentSelected, carrier];

      return {
        ...prev,
        [journeyId]: {
          ...currentFilters,
          selectedCarriers: newSelected.length > 0 ? newSelected : undefined,
        },
      };
    });
  };

  const handleExcludedCarriers = (journeyId: string, carrier: string) => {
    setJourneyFilters((prev) => {
      const currentFilters = prev[journeyId] || {};
      const currentExcluded = currentFilters.excludedCarriers || [];
      
      const newExcluded = currentExcluded.includes(carrier)
        ? currentExcluded.filter(car => car !== carrier)
        : [...currentExcluded, carrier];

      return {
        ...prev,
        [journeyId]: {
          ...currentFilters,
          excludedCarriers: newExcluded.length > 0 ? newExcluded : undefined,
        },
      };
    });
  };

  const handleDiscountCardFilter = (journeyId: string, discountCard: string) => {
    setJourneyFilters((prev) => {
      const currentFilters = prev[journeyId] || {};
      const newSelectedCard =
        currentFilters.selectedDiscountCard === discountCard ? undefined : discountCard;

      return {
        ...prev,
        [journeyId]: {
          ...currentFilters,
          selectedDiscountCard: newSelectedCard,
        },
      };
    });
  };

  const handleSelectedDiscountCards = (journeyId: string, discountCard: string) => {
    setJourneyFilters((prev) => {
      const currentFilters = prev[journeyId] || {};
      const currentSelected = currentFilters.selectedDiscountCards || [];
      
      const newSelected = currentSelected.includes(discountCard)
        ? currentSelected.filter(card => card !== discountCard)
        : [...currentSelected, discountCard];

      return {
        ...prev,
        [journeyId]: {
          ...currentFilters,
          selectedDiscountCards: newSelected.length > 0 ? newSelected : undefined,
        },
      };
    });
  };

  const handleExcludedDiscountCards = (journeyId: string, discountCard: string) => {
    setJourneyFilters((prev) => {
      const currentFilters = prev[journeyId] || {};
      const currentExcluded = currentFilters.excludedDiscountCards || [];
      
      const newExcluded = currentExcluded.includes(discountCard)
        ? currentExcluded.filter(card => card !== discountCard)
        : [...currentExcluded, discountCard];

      return {
        ...prev,
        [journeyId]: {
          ...currentFilters,
          excludedDiscountCards: newExcluded.length > 0 ? newExcluded : undefined,
        },
      };
    });
  };

  return {
    journeyFilters,
    setJourneyFilters,
    handleClassFilter,
    handleSelectedClasses,
    handleExcludedClasses,
    handleCarrierFilter,
    handleSelectedCarriers,
    handleExcludedCarriers,
    handleDiscountCardFilter,
    handleSelectedDiscountCards,
    handleExcludedDiscountCards,
  };
}; 