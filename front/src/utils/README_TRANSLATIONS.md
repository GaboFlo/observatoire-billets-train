# Système de Traduction Frontend

Ce système permet de gérer dynamiquement les traductions des données brutes reçues de l'API directement dans le frontend.

## 📁 Structure des fichiers

```
src/utils/
├── translations.ts              # Traductions principales
├── translationConfig.ts         # Configuration du système
├── generateMissingTranslations.ts # Utilitaires pour les traductions manquantes
└── README_TRANSLATIONS.md       # Cette documentation
```

## 🚀 Utilisation

### 1. Utilisation basique

```tsx
import {
  translateTravelClass,
  translateDiscountCard,
} from "@/utils/translations";

// Traduire une classe de voyage
const translatedClass = translateTravelClass("economy"); // "Économique"

// Traduire une carte de réduction
const translatedCard = translateDiscountCard("AVANTAGE_JEUNE"); // "Avantage Jeune"
```

### 2. Utilisation avec le composant TranslatedText

```tsx
import TranslatedText from "@/components/TranslatedText";

// Dans votre composant
<TranslatedText value="economy" type="travelClass" className="font-bold" />;

// Affiche "Économique" si traduit, sinon "economy" en italique
```

### 3. Hook personnalisé

```tsx
import { useTranslations } from "@/utils/translations";

const MyComponent = () => {
  const { translateTravelClass, translateCarrier } = useTranslations();

  return (
    <div>
      <span>{translateTravelClass("first")}</span>
      <span>{translateCarrier("SNCF")}</span>
    </div>
  );
};
```

## 📝 Ajouter de nouvelles traductions

### 1. Ajouter des traductions individuelles

```tsx
import { addTranslation, travelClassTranslations } from "@/utils/translations";

// Ajouter une nouvelle classe
addTranslation(travelClassTranslations, "luxury", "Luxe");
```

### 2. Ajouter plusieurs traductions

```tsx
import {
  addTranslations,
  discountCardTranslations,
} from "@/utils/translations";

// Ajouter plusieurs cartes de réduction
addTranslations(discountCardTranslations, {
  AVANTAGE_ETUDIANT: "Avantage Étudiant",
  AVANTAGE_MILITAIRE: "Avantage Militaire",
});
```

## 🔧 Configuration

Le fichier `translationConfig.ts` contient les paramètres du système :

```tsx
export const TRANSLATION_CONFIG = {
  DEV_MODE: process.env.NODE_ENV === "development",
  SHOW_ORIGINAL_IN_DEV: true,
  FALLBACK_STYLE: "italic text-gray-600",
  ORIGINAL_STYLE: "font-mono text-xs text-gray-500",
};
```

## 📊 Statistiques de traduction

Le composant `TranslationStats` affiche les statistiques de couverture des traductions :

```tsx
import TranslationStats from "@/components/TranslationStats";

<TranslationStats journeys={journeys} showMissing={true} />;
```

## 🛠️ Outils de développement

### 1. Analyse automatique des traductions manquantes

En mode développement, les traductions manquantes sont automatiquement affichées dans la console.

### 2. Génération de templates

```tsx
import {
  generateTranslationTemplate,
  travelClassTranslations,
} from "@/utils/translationConfig";

const missingClasses = ["economy", "business", "luxury"];
const template = generateTranslationTemplate(
  missingClasses,
  travelClassTranslations
);

console.log(template);
// Output:
//   economy: "economy", // À traduire
//   business: "business", // À traduire
//   luxury: "luxury", // À traduire
```

### 3. Copie dans le presse-papiers

```tsx
import { copyMissingTranslationsToClipboard } from "@/utils/generateMissingTranslations";

// Copier toutes les traductions manquantes dans le presse-papiers
await copyMissingTranslationsToClipboard(journeys);
```

## 🎨 Styles des traductions

- **Traduit** : Style normal
- **Non traduit** : Italique, gris (configurable)
- **Mode dev avec original** : Police monospace, petit, gris clair

## 📋 Types de données supportés

1. **Classes de voyage** (`travelClass`)

   - economy, first, business, standard, premium, comfort, basic

2. **Cartes de réduction** (`discountCard`)

   - AVANTAGE_JEUNE, AVANTAGE_SENIOR, AVANTAGE_FAMILLE, etc.

3. **Compagnies** (`carrier`)

   - SNCF, OUIGO, TER, TGV, INOUI, INTERCITES, etc.

4. **Noms de trains** (`trainName`)
   - TGV, OUIGO, TER, INOUI, INTERCITES

## 🔄 Workflow recommandé

1. **Développement** : Les valeurs non traduites sont visibles en italique
2. **Détection** : Les traductions manquantes sont loggées dans la console
3. **Ajout** : Utiliser les fonctions `addTranslation` ou `addTranslations`
4. **Vérification** : Utiliser le composant `TranslationStats` pour vérifier la couverture

## 🚨 Bonnes pratiques

- Toujours utiliser les fonctions de traduction plutôt que les valeurs brutes
- Ajouter les nouvelles traductions dans le fichier approprié
- Tester en mode développement pour voir les traductions manquantes
- Utiliser le composant `TranslatedText` pour une gestion cohérente des styles
