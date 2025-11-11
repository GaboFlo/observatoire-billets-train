import { JourneyFilters } from "@/types/journey";
import { useState } from "react";

const useJourneyFilters = () => {
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
        ? currentSelected.filter((cls) => cls !== travelClass)
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
        ? currentSelected.filter((car) => car !== carrier)
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

  const handleDiscountCardFilter = (
    journeyId: string,
    discountCard: string
  ) => {
    setJourneyFilters((prev) => {
      const currentFilters = prev[journeyId] || {};
      const newSelectedCard =
        currentFilters.selectedDiscountCard === discountCard
          ? undefined
          : discountCard;

      return {
        ...prev,
        [journeyId]: {
          ...currentFilters,
          selectedDiscountCard: newSelectedCard,
        },
      };
    });
  };

  const handleSelectedDiscountCards = (
    journeyId: string,
    discountCard: string
  ) => {
    setJourneyFilters((prev) => {
      const currentFilters = prev[journeyId] || {};
      const currentSelected = currentFilters.selectedDiscountCards || [];

      const newSelected = currentSelected.includes(discountCard)
        ? currentSelected.filter((card) => card !== discountCard)
        : [...currentSelected, discountCard];

      return {
        ...prev,
        [journeyId]: {
          ...currentFilters,
          selectedDiscountCards:
            newSelected.length > 0 ? newSelected : undefined,
        },
      };
    });
  };

  return {
    journeyFilters,
    setJourneyFilters,
    handleClassFilter,
    handleSelectedClasses,
    handleCarrierFilter,
    handleSelectedCarriers,
    handleDiscountCardFilter,
    handleSelectedDiscountCards,
  };
};
