// Import des traductions depuis le package partagé
import type { TranslationMap } from "@observatoire-billets-train/shared";
import {
  carrierTranslations,
  discountCardTranslations,
  stationTranslations,
  trainNameTranslations,
  travelClassTranslations,
} from "@observatoire-billets-train/shared";

// Ré-export des traductions
export {
  carrierTranslations,
  discountCardTranslations,
  stationTranslations,
  trainNameTranslations,
  travelClassTranslations,
};
export type { TranslationMap };

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

export const translateStation = (stationName: string): string => {
  return translate(stationName, stationTranslations, stationName);
};

export const formatTranslationKey = (key: string): string => {
  return key
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

export const useTranslations = () => {
  return {
    translateTravelClass,
    translateDiscountCard,
    translateCarrier,
    translateTrainName,
    translateStation,
    translate,
    formatTranslationKey,
  };
};
