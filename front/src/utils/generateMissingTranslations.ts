import { 
  travelClassTranslations, 
  discountCardTranslations, 
  carrierTranslations,
  trainNameTranslations 
} from "./translations";
import { generateTranslationTemplate } from "./translationConfig";

// Fonction pour analyser les données et générer les traductions manquantes
export const analyzeAndGenerateMissingTranslations = (journeys: any[]) => {
  // Collecter toutes les valeurs uniques
  const allCarriers = new Set<string>();
  const allClasses = new Set<string>();
  const allDiscountCards = new Set<string>();
  const allTrainNames = new Set<string>();

  journeys.forEach(journey => {
    journey.carriers?.forEach((carrier: string) => allCarriers.add(carrier));
    journey.classes?.forEach((cls: string) => allClasses.add(cls));
    journey.discountCards?.forEach((card: string) => allDiscountCards.add(card));
    journey.offers?.forEach((offer: any) => allTrainNames.add(offer.trainName));
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
  };
};

// Fonction pour afficher les traductions manquantes dans la console
export const logMissingTranslations = (journeys: any[]) => {
  const missing = analyzeAndGenerateMissingTranslations(journeys);
  
  console.group('🚀 Traductions manquantes détectées');
  
  if (missing.carriers !== '// Toutes les traductions sont présentes') {
    console.group('📦 Compagnies manquantes :');
    console.log(missing.carriers);
    console.groupEnd();
  }
  
  if (missing.classes !== '// Toutes les traductions sont présentes') {
    console.group('🎫 Classes manquantes :');
    console.log(missing.classes);
    console.groupEnd();
  }
  
  if (missing.discountCards !== '// Toutes les traductions sont présentes') {
    console.group('💳 Cartes de réduction manquantes :');
    console.log(missing.discountCards);
    console.groupEnd();
  }
  
  if (missing.trainNames !== '// Toutes les traductions sont présentes') {
    console.group('🚂 Noms de trains manquants :');
    console.log(missing.trainNames);
    console.groupEnd();
  }
  
  console.groupEnd();
};

// Fonction pour copier les traductions manquantes dans le presse-papiers
export const copyMissingTranslationsToClipboard = async (journeys: any[]) => {
  const missing = analyzeAndGenerateMissingTranslations(journeys);
  
  let clipboardText = '// Traductions manquantes à ajouter :\n\n';
  
  if (missing.carriers !== '// Toutes les traductions sont présentes') {
    clipboardText += '// Compagnies :\n';
    clipboardText += missing.carriers + '\n\n';
  }
  
  if (missing.classes !== '// Toutes les traductions sont présentes') {
    clipboardText += '// Classes :\n';
    clipboardText += missing.classes + '\n\n';
  }
  
  if (missing.discountCards !== '// Toutes les traductions sont présentes') {
    clipboardText += '// Cartes de réduction :\n';
    clipboardText += missing.discountCards + '\n\n';
  }
  
  if (missing.trainNames !== '// Toutes les traductions sont présentes') {
    clipboardText += '// Noms de trains :\n';
    clipboardText += missing.trainNames + '\n\n';
  }
  
  try {
    await navigator.clipboard.writeText(clipboardText);
    console.log('✅ Traductions manquantes copiées dans le presse-papiers');
  } catch (error) {
    console.error('❌ Erreur lors de la copie dans le presse-papiers:', error);
  }
}; 