import { useEffect, useMemo, useState } from "react";
import { GroupedJourney } from "../types/journey";

export interface GlobalFilters {
  carriers: string[];
  classes: string[];
  discountCards: string[];
}

export const ALL_DISCOUNT_CARDS = ["NONE", "AVANTAGE_JEUNE", "MAX"];
// Filtres par défaut centralisés
export const DEFAULT_FILTERS: GlobalFilters = {
  carriers: ["SNCF", "db", "ouigo", "sncf", "eurostar", "trenitalia_france"],
  classes: ["economy", "first"],
  discountCards: ["NONE", "AVANTAGE_JEUNE"],
};

export const useGlobalFilters = (
  journeys: GroupedJourney[],
  onFiltersChange?: (filters: GlobalFilters) => void,
  currentFilters?: GlobalFilters, // Nouveau paramètre pour synchroniser avec les filtres actuels
  allJourneys?: GroupedJourney[] // Nouvelles données non filtrées pour les options
) => {
  const [filters, setFilters] = useState<GlobalFilters>({
    carriers: currentFilters?.carriers || DEFAULT_FILTERS.carriers,
    classes: currentFilters?.classes || DEFAULT_FILTERS.classes,
    discountCards:
      currentFilters?.discountCards || DEFAULT_FILTERS.discountCards,
  });

  // Initialiser les filtres avec toutes les options disponibles sauf MAX (une seule fois)
  const [initialized, setInitialized] = useState(false);

  // Synchroniser les filtres quand currentFilters change
  useEffect(() => {
    if (currentFilters) {
      setFilters((prevFilters) => {
        // Éviter les mises à jour inutiles en comparant les valeurs
        if (
          JSON.stringify(prevFilters.carriers) !==
            JSON.stringify(currentFilters.carriers) ||
          JSON.stringify(prevFilters.classes) !==
            JSON.stringify(currentFilters.classes) ||
          JSON.stringify(prevFilters.discountCards) !==
            JSON.stringify(currentFilters.discountCards)
        ) {
          return currentFilters;
        }
        return prevFilters;
      });
    }
  }, [currentFilters]);

  // Extraire toutes les options disponibles à partir de TOUTES les données (non filtrées)
  const availableOptions = useMemo(() => {
    const carriers = new Set<string>();
    const classes = new Set<string>();
    const discountCards = new Set<string>();

    // Toujours utiliser allJourneys si disponible, même s'il est vide
    const dataToUse = allJourneys ?? journeys;

    for (const journey of dataToUse) {
      // Utiliser directement les propriétés du voyage
      for (const carrier of journey.carriers) {
        carriers.add(carrier);
      }
      for (const travelClass of journey.classes) {
        classes.add(travelClass);
      }
      for (const discountCard of journey.discountCards) {
        discountCards.add(discountCard);
      }
    }

    // S'assurer que MAX, NONE et AVANTAGE_JEUNE sont toujours inclus dans les cartes de réduction
    discountCards.add("MAX");
    discountCards.add("NONE");
    discountCards.add("AVANTAGE_JEUNE");

    return {
      carriers: Array.from(carriers).sort(),
      classes: Array.from(classes).sort(),
      discountCards: Array.from(discountCards).sort(),
    };
  }, [allJourneys, journeys]);

  // Initialiser les filtres avec les valeurs par défaut (une seule fois)
  useEffect(() => {
    if (!initialized) {
      const newFilters = {
        carriers: currentFilters?.carriers || DEFAULT_FILTERS.carriers,
        classes: currentFilters?.classes || DEFAULT_FILTERS.classes,
        discountCards:
          currentFilters?.discountCards || DEFAULT_FILTERS.discountCards,
      };
      setFilters(newFilters);
      setInitialized(true);
      onFiltersChange?.(newFilters);
    }
  }, [
    initialized,
    onFiltersChange,
    currentFilters?.carriers,
    currentFilters?.classes,
    currentFilters?.discountCards,
  ]);

  // Les journeys sont déjà filtrées par l'API, pas besoin de filtrage côté client
  const filteredJourneys = journeys;

  const handleCarrierFilter = (carrier: string) => {
    const currentCarriers = filters.carriers || [];
    const newFilters = {
      ...filters,
      carriers: currentCarriers.includes(carrier)
        ? currentCarriers.filter((c) => c !== carrier)
        : [...currentCarriers, carrier],
    };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleClassFilter = (travelClass: string) => {
    const currentClasses = filters.classes || [];
    const newFilters = {
      ...filters,
      classes: currentClasses.includes(travelClass)
        ? currentClasses.filter((c) => c !== travelClass)
        : [...currentClasses, travelClass],
    };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleDiscountCardFilter = (discountCard: string) => {
    const currentDiscountCards = filters.discountCards || [];
    const newFilters = {
      ...filters,
      discountCards: currentDiscountCards.includes(discountCard)
        ? currentDiscountCards.filter((c) => c !== discountCard)
        : [...currentDiscountCards, discountCard],
    };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilters = () => {
    // Réinitialiser avec toutes les options disponibles (y compris MAX)
    const allFilters = {
      carriers:
        availableOptions.carriers.length > 0
          ? availableOptions.carriers
          : DEFAULT_FILTERS.carriers,
      classes:
        availableOptions.classes.length > 0
          ? availableOptions.classes
          : DEFAULT_FILTERS.classes,
      discountCards:
        availableOptions.discountCards.length > 0
          ? availableOptions.discountCards
          : DEFAULT_FILTERS.discountCards, // Inclure MAX
    };
    setFilters(allFilters);
    onFiltersChange?.(allFilters);
  };

  return {
    filters: filters || DEFAULT_FILTERS,
    availableOptions,
    filteredJourneys,
    handleCarrierFilter,
    handleClassFilter,
    handleDiscountCardFilter,
    clearFilters,
  };
};
