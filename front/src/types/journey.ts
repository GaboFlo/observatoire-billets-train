export interface AggregatedPricingResult {
  departureStation: string;
  arrivalStation: string;
  travelClass: string;
  discountCard: string;
  trainName: string;
  carrier: string;
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
}

export interface GroupedJourney {
  id: string;
  name: string;
  departureStation: string;
  arrivalStation: string;
  carriers: string[];
  classes: string[];
  discountCards: string[];
  offers: AggregatedPricingResult[];
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
}

export interface JourneyFilters {
  [journeyId: string]: {
    selectedClass?: string;
    selectedDiscountCard?: string;
    selectedCarrier?: string;
  };
} 