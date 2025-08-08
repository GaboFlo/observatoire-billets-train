import { useMemo, useState } from "react";
import { AggregatedPricingResult, GroupedJourney } from "../types/journey";

export interface GlobalFilters {
  excludedCarriers: string[];
  excludedClasses: string[];
  excludedDiscountCards: string[];
}

export const useGlobalFilters = (journeys: GroupedJourney[]) => {
  const [filters, setFilters] = useState<GlobalFilters>({
    excludedCarriers: [],
    excludedClasses: [],
    excludedDiscountCards: ["MAX"], // Ne plus exclure MAX par défaut
  });

  // Extraire toutes les options disponibles
  const availableOptions = useMemo(() => {
    const carriers = new Set<string>();
    const classes = new Set<string>();
    const discountCards = new Set<string>();

    journeys.forEach((journey) => {
      journey.offers.forEach((offer) => {
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
    return journeys
      .map((journey) => {
        const filteredOffers = journey.offers.filter((offer) => {
          // Filtre par compagnies
          if (filters.excludedCarriers.includes(offer.carrier)) {
            return false;
          }

          // Filtre par classes
          if (filters.excludedClasses.includes(offer.travelClass)) {
            return false;
          }

          // Filtre par cartes de réduction
          if (filters.excludedDiscountCards.includes(offer.discountCard)) {
            return false;
          }

          return true;
        });

        // Recalculer le prix moyen basé sur les offres filtrées
        let avgPrice = journey.avgPrice;
        if (filteredOffers.length > 0) {
          const allPrices = [
            ...filteredOffers.map((o: AggregatedPricingResult) => o.minPrice),
            ...filteredOffers.map((o: AggregatedPricingResult) => o.avgPrice),
            ...filteredOffers.map((o: AggregatedPricingResult) => o.maxPrice),
          ];
          avgPrice =
            allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;
        }

        return {
          ...journey,
          offers: filteredOffers,
          avgPrice: Math.round(avgPrice),
        };
      })
      .filter((journey) => journey.offers.length > 0);
  }, [journeys, filters]);

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

  const clearFilters = () => {
    setFilters({
      excludedCarriers: [],
      excludedClasses: [],
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
