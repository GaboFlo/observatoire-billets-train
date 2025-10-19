export interface AggregatedPricingResult {
  departureStation: string;
  departureStationId: number;
  arrivalStation: string;
  arrivalStationId: number;
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
  carriers: string[];
  classes: string[];
  discountCards: string[];
  flexibilities: string[];
}

export interface DetailedPricingResult {
  departureStation: string;
  departureStationId: number;
  arrivalStation: string;
  arrivalStationId: number;
  travelClass: string;
  discountCard: string;
  flexibility: string;
  trainName: string;
  carrier: string;
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  is_sellable: boolean;
  unsellable_reason: string | null;
  daysBeforeDeparture: number;
}

export interface ChartDataResult {
  price: number;
  is_sellable: boolean;
  daysBeforeDeparture: number;
}

export interface ChartStatsResult {
  chartData: ChartDataResult[];
  stats: {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
  };
}

export interface GroupedJourney {
  id: string;
  name: string;
  departureStation: string;
  departureStationId: number;
  arrivalStation: string;
  arrivalStationId: number;
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
    selectedDiscountCards?: string[];
    discountCards?: string[];
    selectedClasses?: string[];
    classes?: string[];
    selectedCarriers?: string[];
    carriers?: string[];
  };
}
