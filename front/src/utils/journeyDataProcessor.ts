import { AggregatedPricingResult, GroupedJourney, JourneyFilters } from "@/types/journey";
import { logMissingTranslations } from "@/utils/generateMissingTranslations";

export const processPricingData = (data: AggregatedPricingResult[]): GroupedJourney[] => {
  // Grouper les données par trajet (departure + arrival)
  const journeyMap = new Map<string, AggregatedPricingResult[]>();

  data.forEach((item) => {
    const key = `${item.departureStationId}-${item.arrivalStationId}`;
    if (!journeyMap.has(key)) {
      journeyMap.set(key, []);
    }
    journeyMap.get(key)!.push(item);
  });

  // Créer les objets GroupedJourney
  const groupedJourneys: GroupedJourney[] = Array.from(
    journeyMap.entries()
  ).map(([key, offers]) => {
    const departure = offers[0].departureStation;
    const departureId = offers[0].departureStationId;
    const arrival = offers[0].arrivalStation;
    const arrivalId = offers[0].arrivalStationId;
    const carriers = [...new Set(offers.map((o) => o.carrier))];
    const classes = [...new Set(offers.map((o) => o.travelClass))];
    const discountCards = [...new Set(offers.map((o) => o.discountCard))];

    const allPrices = [
      ...offers.map((o) => o.minPrice),
      ...offers.map((o) => o.avgPrice),
      ...offers.map((o) => o.maxPrice),
    ];

    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const avgPrice =
      allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;

    return {
      id: key,
      name: `${departure} → ${arrival}`,
      departureStation: departure,
      departureStationId: departureId,
      arrivalStation: arrival,
      arrivalStationId: arrivalId,
      carriers,
      classes,
      discountCards,
      offers,
      minPrice,
      maxPrice,
      avgPrice: Math.round(avgPrice),
    };
  });

  return groupedJourneys;
};

export const createDefaultFilters = (groupedJourneys: GroupedJourney[]): JourneyFilters => {
  const defaultFilters: JourneyFilters = {};
  groupedJourneys.forEach((journey) => {
    if (journey.discountCards.includes("MAX")) {
      defaultFilters[journey.id] = {
        excludedDiscountCards: ["MAX"]
      };
    }
  });
  return defaultFilters;
};

export const processJourneyDetails = (data: AggregatedPricingResult[], journeyId: string): GroupedJourney | null => {
  // Trouver le trajet spécifique par son ID
  const journeyMap = new Map<string, AggregatedPricingResult[]>();

  data.forEach((item) => {
    const key = `${item.departureStationId}-${item.arrivalStationId}`;
    if (!journeyMap.has(key)) {
      journeyMap.set(key, []);
    }
    journeyMap.get(key)!.push(item);
  });

  const journeyData = journeyMap.get(journeyId);
  
  if (!journeyData) {
    return null;
  }

  const departure = journeyData[0].departureStation;
  const departureId = journeyData[0].departureStationId;
  const arrival = journeyData[0].arrivalStation;
  const arrivalId = journeyData[0].arrivalStationId;
  const carriers = [...new Set(journeyData.map((o) => o.carrier))];
  const classes = [...new Set(journeyData.map((o) => o.travelClass))];
  const discountCards = [...new Set(journeyData.map((o) => o.discountCard))];

  const allPrices = [
    ...journeyData.map((o) => o.minPrice),
    ...journeyData.map((o) => o.avgPrice),
    ...journeyData.map((o) => o.maxPrice),
  ];

  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const avgPrice =
    allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;

  return {
    id: journeyId,
    name: `${departure} → ${arrival}`,
    departureStation: departure,
    departureStationId: departureId,
    arrivalStation: arrival,
    arrivalStationId: arrivalId,
    carriers,
    classes,
    discountCards,
    offers: journeyData,
    minPrice,
    maxPrice,
    avgPrice: Math.round(avgPrice),
  };
};

export const analyzeMissingTranslations = (groupedJourneys: GroupedJourney[]) => {
  if (process.env.NODE_ENV === 'development') {
    logMissingTranslations(groupedJourneys);
  }
}; 