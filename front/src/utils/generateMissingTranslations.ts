import { GroupedJourney } from "../types/journey";
import { generateTranslationTemplate } from "./translationConfig";
import {
  carrierTranslations,
  discountCardTranslations,
  stationTranslations,
  trainNameTranslations,
  travelClassTranslations,
} from "./translations";

// Fonction pour analyser les données et générer les traductions manquantes
export const analyzeAndGenerateMissingTranslations = (
  journeys: GroupedJourney[]
) => {
  // Collecter toutes les valeurs uniques
  const allCarriers = new Set<string>();
  const allClasses = new Set<string>();
  const allDiscountCards = new Set<string>();
  const allTrainNames = new Set<string>();
  const allStations = new Set<string>();

  journeys.forEach((journey) => {
    journey.carriers?.forEach((carrier: string) => allCarriers.add(carrier));
    journey.classes?.forEach((cls: string) => allClasses.add(cls));
    journey.discountCards?.forEach((card: string) =>
      allDiscountCards.add(card)
    );
    // Note: AggregatedPricingResult n'a pas de trainName,
    // cette propriété existe seulement dans DetailedPricingResult
    // Pour l'instant, on skip cette partie
  });

  // Générer les templates pour chaque type
  const carrierTemplate = generateTranslationTemplate(
    Array.from(allCarriers),
    carrierTranslations
  );

  const classTemplate = generateTranslationTemplate(
    Array.from(allClasses),
    travelClassTranslations
  );

  const stationTemplate = generateTranslationTemplate(
    Array.from(allStations),
    stationTranslations
  );

  const discountCardTemplate = generateTranslationTemplate(
    Array.from(allDiscountCards),
    discountCardTranslations
  );

  const trainNameTemplate = generateTranslationTemplate(
    Array.from(allTrainNames),
    trainNameTranslations
  );

  return {
    carriers: carrierTemplate,
    classes: classTemplate,
    discountCards: discountCardTemplate,
    trainNames: trainNameTemplate,
    stations: stationTemplate,
  };
};

// Fonction pour afficher les traductions manquantes dans la console
export const logMissingTranslations = (journeys: GroupedJourney[]) => {
  const missing = analyzeAndGenerateMissingTranslations(journeys);

  console.group("🚀 Traductions manquantes détectées");

  if (missing.carriers !== "// Toutes les traductions sont présentes") {
    console.group("📦 Compagnies manquantes :");
    console.groupEnd();
  }

  if (missing.classes !== "// Toutes les traductions sont présentes") {
    console.group("🎫 Classes manquantes :");
    console.groupEnd();
  }

  if (missing.discountCards !== "// Toutes les traductions sont présentes") {
    console.group("💳 Cartes de réduction manquantes :");
    console.groupEnd();
  }

  if (missing.trainNames !== "// Toutes les traductions sont présentes") {
    console.group("🚂 Noms de trains manquants :");
    console.groupEnd();
  }

  console.groupEnd();
};

// Fonction pour copier les traductions manquantes dans le presse-papiers
export const copyMissingTranslationsToClipboard = async (
  journeys: GroupedJourney[]
) => {
  const missing = analyzeAndGenerateMissingTranslations(journeys);

  let clipboardText = "// Traductions manquantes à ajouter :\n\n";

  if (missing.carriers !== "// Toutes les traductions sont présentes") {
    clipboardText += "// Compagnies :\n";
    clipboardText += missing.carriers + "\n\n";
  }

  if (missing.classes !== "// Toutes les traductions sont présentes") {
    clipboardText += "// Classes :\n";
    clipboardText += missing.classes + "\n\n";
  }

  if (missing.discountCards !== "// Toutes les traductions sont présentes") {
    clipboardText += "// Cartes de réduction :\n";
    clipboardText += missing.discountCards + "\n\n";
  }

  if (missing.trainNames !== "// Toutes les traductions sont présentes") {
    clipboardText += "// Noms de trains :\n";
    clipboardText += missing.trainNames + "\n\n";
  }

  try {
    await navigator.clipboard.writeText(clipboardText);
  } catch (error) {
    console.error("❌ Erreur lors de la copie dans le presse-papiers:", error);
  }
};
