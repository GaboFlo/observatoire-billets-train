import { useEffect, useMemo, useState } from "react";
import { GroupedJourney } from "../types/journey";

export interface GlobalFilters {
  carriers: string[];
  classes: string[];
  discountCards: string[];
}

export const ALL_DISCOUNT_CARDS = ["NONE", "AVANTAGE_JEUNE", "MAX"];
export const ALL_TRAVEL_CLASSES = ["economy", "first"];
// Filtres par défaut centralisés
export const DEFAULT_FILTERS: GlobalFilters = {
  carriers: ["sncf", "db", "ouigo", "eurostar", "trenitalia_france"],
  classes: ["economy"],
  discountCards: ["NONE"],
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
      if (!currentFilters) {
        onFiltersChange?.(newFilters);
      }
    }
  }, [
    initialized,
    onFiltersChange,
    currentFilters?.carriers,
    currentFilters?.classes,
    currentFilters?.discountCards,
    currentFilters,
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
    const availableClasses = ["economy", "first"];
    let newClasses: string[];

    if (currentClasses.includes(travelClass)) {
      const otherClass = availableClasses.find((c) => c !== travelClass);
      newClasses = otherClass ? [otherClass] : [];
    } else {
      newClasses = [travelClass];
    }

    const newFilters = {
      ...filters,
      classes: newClasses,
    };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleDiscountCardFilter = (discountCard: string) => {
    const currentDiscountCards = filters.discountCards || [];
    const availableDiscountCards = availableOptions.discountCards;
    let newDiscountCards: string[];

    // Mode exclusif : une seule carte peut être sélectionnée à la fois
    if (currentDiscountCards.includes(discountCard)) {
      // Si on désélectionne la carte actuelle, on sélectionne NONE par défaut
      newDiscountCards = ["NONE"];
    } else {
      // Sinon, on sélectionne uniquement la nouvelle carte
      newDiscountCards = [discountCard];
    }

    const newFilters = {
      ...filters,
      discountCards: newDiscountCards,
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
      discountCards: ["NONE"], // Toujours réinitialiser à NONE
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
