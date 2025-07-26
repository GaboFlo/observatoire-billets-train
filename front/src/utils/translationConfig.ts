// Configuration pour les traductions
// Ce fichier permet d'ajouter facilement de nouvelles traductions

export const TRANSLATION_CONFIG = {
  // Mode de développement - afficher les valeurs non traduites avec un style spécial
  DEV_MODE: process.env.NODE_ENV === 'development',
  
  // Afficher les valeurs originales en mode développement
  SHOW_ORIGINAL_IN_DEV: true,
  
  // Fallback pour les valeurs non traduites
  FALLBACK_STYLE: 'italic text-gray-600',
  
  // Style pour les valeurs originales en mode dev
  ORIGINAL_STYLE: 'font-mono text-xs text-gray-500',
} as const;

// Fonction pour ajouter facilement de nouvelles traductions
export const addTranslation = (
  translationMap: Record<string, string>,
  key: string,
  value: string
) => {
  translationMap[key] = value;
  return translationMap;
};

// Fonction pour ajouter plusieurs traductions en une fois
export const addTranslations = (
  translationMap: Record<string, string>,
  translations: Record<string, string>
) => {
  Object.assign(translationMap, translations);
  return translationMap;
};

// Fonction pour exporter les traductions manquantes (utile pour le développement)
export const getMissingTranslations = (
  values: string[],
  translationMap: Record<string, string>
): string[] => {
  return values.filter(value => !translationMap[value]);
};

// Fonction pour générer un template de traduction
export const generateTranslationTemplate = (
  values: string[],
  translationMap: Record<string, string>
): string => {
  const missing = getMissingTranslations(values, translationMap);
  
  if (missing.length === 0) {
    return '// Toutes les traductions sont présentes';
  }
  
  return missing
    .map(value => `  ${value}: "${value}", // À traduire`)
    .join('\n');
}; 