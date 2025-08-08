import { useEffect, useMemo, useState } from "react";
import { GroupedJourney } from "../types/journey";

export interface GlobalFilters {
  excludedCarriers: string[];
  excludedClasses: string[];
  excludedDiscountCards: string[];
}

export const useGlobalFilters = (
  journeys: GroupedJourney[],
  onFiltersChange?: (filters: GlobalFilters) => void,
  currentFilters?: GlobalFilters, // Nouveau paramètre pour synchroniser avec les filtres actuels
  allJourneys?: GroupedJourney[] // Nouvelles données non filtrées pour les options
) => {
  const [filters, setFilters] = useState<GlobalFilters>({
    excludedCarriers: currentFilters?.excludedCarriers || [],
    excludedClasses: currentFilters?.excludedClasses || [],
    excludedDiscountCards: currentFilters?.excludedDiscountCards || [],
  });

  // Synchroniser les filtres quand currentFilters change
  useEffect(() => {
    console.log("useGlobalFilters - currentFilters changé:", currentFilters);
    if (currentFilters) {
      setFilters(currentFilters);
    }
  }, [currentFilters]);

  // Extraire toutes les options disponibles à partir de TOUTES les données (non filtrées)
  const availableOptions = useMemo(() => {
    const carriers = new Set<string>();
    const classes = new Set<string>();
    const discountCards = new Set<string>();

    // Utiliser allJourneys si disponible, sinon utiliser journeys
    const dataToUse = allJourneys || journeys;

    dataToUse.forEach((journey) => {
      journey.offers.forEach((offer) => {
        carriers.add(offer.carrier);
        classes.add(offer.travelClass);
        discountCards.add(offer.discountCard);
      });
    });

    // S'assurer que MAX et NONE sont toujours inclus dans les cartes de réduction
    discountCards.add("MAX");
    discountCards.add("NONE");

    return {
      carriers: Array.from(carriers).sort(),
      classes: Array.from(classes).sort(),
      discountCards: Array.from(discountCards).sort(),
    };
  }, [allJourneys, journeys]);

  // Les journeys sont déjà filtrées par l'API, pas besoin de filtrage côté client
  const filteredJourneys = journeys;

  const handleCarrierFilter = (carrier: string) => {
    console.log("handleCarrierFilter appelé avec:", carrier);
    const newFilters = {
      ...filters,
      excludedCarriers: filters.excludedCarriers.includes(carrier)
        ? filters.excludedCarriers.filter((c) => c !== carrier)
        : [...filters.excludedCarriers, carrier],
    };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleClassFilter = (travelClass: string) => {
    console.log("handleClassFilter appelé avec:", travelClass);
    const newFilters = {
      ...filters,
      excludedClasses: filters.excludedClasses.includes(travelClass)
        ? filters.excludedClasses.filter((c) => c !== travelClass)
        : [...filters.excludedClasses, travelClass],
    };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleDiscountCardFilter = (discountCard: string) => {
    console.log("handleDiscountCardFilter appelé avec:", discountCard);
    const newFilters = {
      ...filters,
      excludedDiscountCards: filters.excludedDiscountCards.includes(
        discountCard
      )
        ? filters.excludedDiscountCards.filter((c) => c !== discountCard)
        : [...filters.excludedDiscountCards, discountCard],
    };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilters = () => {
    console.log("clearFilters appelé");
    const newFilters = {
      excludedCarriers: [],
      excludedClasses: [],
      excludedDiscountCards: [],
    };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
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
