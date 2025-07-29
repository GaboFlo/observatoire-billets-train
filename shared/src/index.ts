// Types communs
export interface TranslationMap {
  [key: string]: string;
}

export interface AggregatedPricingResult {
  journeys: GroupedJourney[];
  totalCount: number;
  filters: JourneyFilters;
}

export interface GroupedJourney {
  id: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  price: number;
  carriers: string[];
  travelClasses: string[];
  discountCards: string[];
  trainNames: string[];
}

export interface JourneyFilters {
  carriers: string[];
  travelClasses: string[];
  discountCards: string[];
  trainNames: string[];
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PricingFilters {
  origin?: string;
  destination?: string;
  date?: string;
  carriers?: string[];
  travelClasses?: string[];
  discountCards?: string[];
}

export interface PricingStats {
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  totalJourneys: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

// Constantes partagées
export const TRAVEL_CLASSES = [
  "economy",
  "first",
  "business",
  "standard",
  "premium",
  "comfort",
  "basic",
] as const;

export const DISCOUNT_CARDS = ["AVANTAGE_JEUNE", "NONE", "MAX"] as const;

export const CARRIERS = ["sncf", "db", "ouigo", "eurostar"] as const;

export const TRAIN_NAMES = [
  "TGV",
  "OUIGO",
  "TRAIN TER",
  "TRAIN TER HDF",
  "INOUI",
  "IC",
  "ES",
  "ICE",
] as const;

export const STATIONS = [
  "Barcelona",
  "Bordeaux-st-jean",
  "La-rochelle-ville",
  "London-st-pancras",
  "Marseille-st-charles",
  "Chambery-challes-les-eaux",
  "Besancon-franche-comte-tgv",
] as const;

// Types basés sur les constantes
export type TravelClass = (typeof TRAVEL_CLASSES)[number];
export type DiscountCard = (typeof DISCOUNT_CARDS)[number];
export type Carrier = (typeof CARRIERS)[number];
export type TrainName = (typeof TRAIN_NAMES)[number];
export type Station = (typeof STATIONS)[number];

// Traductions
export const travelClassTranslations: TranslationMap = {
  economy: "Seconde",
  first: "Première",
  business: "Affaires",
  standard: "Standard",
  premium: "Premium",
  comfort: "Confort",
  basic: "Basique",
};

export const discountCardTranslations: TranslationMap = {
  AVANTAGE_JEUNE: "Avantage Jeune",
  NONE: "Aucune",
  MAX: "TGV Max",
};

export const carrierTranslations: TranslationMap = {
  sncf: "SNCF",
  db: "Deutsche Bahn",
  ouigo: "OUIGO",
  eurostar: "Eurostar",
};

export const trainNameTranslations: TranslationMap = {
  TGV: "TGV",
  OUIGO: "Ouigo",
  "TRAIN TER": "TER",
  "TRAIN TER HDF": "TER",
  INOUI: "TGV InOui",
  IC: "Intercités",
  ES: "Eurostar",
  ICE: "Trains Ice",
};

export const stationTranslations: TranslationMap = {
  Barcelona: "Barcelone",
  "Bordeaux-st-jean": "Bordeaux",
  "La-rochelle-ville": "La Rochelle",
  "London-st-pancras": "Londres",
  "Marseille-st-charles": "Marseille",
  "Chambery-challes-les-eaux": "Chambéry",
  "Besancon-franche-comte-tgv": "Besançon Franche-Comté TGV",
};
