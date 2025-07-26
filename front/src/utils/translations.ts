export interface TranslationMap {
  [key: string]: string;
}

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
  MAX:"TGV Max"
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
  "TRAIN TER HDF":"TER",
  INOUI: "TGV InOui",
  IC: "Intercités",
  ES: "Eurostar",
  ICE: "Trains Ice"
};

export const translate = (
  value: string,
  translationMap: TranslationMap,
  fallback?: string
): string => {
  const translation = translationMap[value];
  if (translation) {
    return translation;
  }
  
  return fallback || value;
};

export const translateTravelClass = (travelClass: string): string => {
  return translate(travelClass, travelClassTranslations, travelClass);
};

export const translateDiscountCard = (discountCard: string): string => {
  return translate(discountCard, discountCardTranslations, discountCard);
};

export const translateCarrier = (carrier: string): string => {
  return translate(carrier, carrierTranslations, carrier);
};

export const translateTrainName = (trainName: string): string => {
  return translate(trainName, trainNameTranslations, trainName);
};

export const formatTranslationKey = (key: string): string => {
  return key
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

export const useTranslations = () => {
  return {
    translateTravelClass,
    translateDiscountCard,
    translateCarrier,
    translateTrainName,
    translate,
    formatTranslationKey,
  };
}; 