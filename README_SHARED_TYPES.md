# Package Shared - Types et Constantes Partagés

## Vue d'ensemble

Le package `@observatoire-billets-train/shared` centralise tous les types, interfaces et constantes utilisés par le frontend et le backend. Cela évite la duplication de code et garantit la cohérence des types entre les deux applications.

## Structure

```
shared/
├── package.json          # Configuration du package
├── tsconfig.json         # Configuration TypeScript
├── src/
│   └── index.ts          # Point d'entrée avec tous les exports
└── dist/                 # Fichiers compilés (générés)
```

## Utilisation

### Dans le Frontend

```typescript
// Import des types
import type { GroupedJourney, JourneyFilters } from '@observatoire-billets-train/shared';

// Import des constantes
import { TRAVEL_CLASSES, DISCOUNT_CARDS } from '@observatoire-billets-train/shared';

// Import des traductions
import { travelClassTranslations, discountCardTranslations } from '@observatoire-billets-train/shared';
```

### Dans le Backend

```typescript
// Import des types
import type { AggregatedPricingResult, ApiResponse } from '@observatoire-billets-train/shared';

// Import des constantes
import { CARRIERS, TRAIN_NAMES } from '@observatoire-billets-train/shared';
```

## Types Disponibles

### Interfaces Principales
- `TranslationMap` - Map de traductions clé-valeur
- `AggregatedPricingResult` - Résultat agrégé des prix
- `GroupedJourney` - Trajet groupé avec toutes ses propriétés
- `JourneyFilters` - Filtres pour les trajets
- `ApiResponse<T>` - Réponse API générique
- `PaginatedResponse<T>` - Réponse paginée
- `PricingFilters` - Filtres de prix
- `PricingStats` - Statistiques de prix
- `ApiError` - Erreur API

### Types Basés sur les Constantes
- `TravelClass` - Types de classe de voyage
- `DiscountCard` - Types de cartes de réduction
- `Carrier` - Types de transporteurs
- `TrainName` - Types de noms de trains

## Constantes

### Arrays de Valeurs
- `TRAVEL_CLASSES` - Classes de voyage disponibles
- `DISCOUNT_CARDS` - Cartes de réduction disponibles
- `CARRIERS` - Transporteurs disponibles
- `TRAIN_NAMES` - Noms de trains disponibles

## Traductions

### Maps de Traduction
- `travelClassTranslations` - Traductions des classes de voyage
- `discountCardTranslations` - Traductions des cartes de réduction
- `carrierTranslations` - Traductions des transporteurs
- `trainNameTranslations` - Traductions des noms de trains

## Développement

### Compilation
```bash
# Compiler le package shared
cd shared && npm run build

# Mode watch pour le développement
cd shared && npm run dev
```

### Installation
```bash
# Installer toutes les dépendances du monorepo
npm run install:all

# Ou manuellement
npm install
cd shared && npm install
cd ../front && npm install
cd ../back && npm install
```

## Déploiement

Le package shared est conçu pour être déployé indépendamment :

1. **Build du package shared** : `cd shared && npm run build`
2. **Publication** : Le package peut être publié sur npm ou utilisé localement
3. **Déploiement séparé** : Front et back peuvent être déployés sur des services différents

## Avantages

- ✅ **DRY** : Pas de duplication de types
- ✅ **Cohérence** : Types identiques entre front et back
- ✅ **Maintenance** : Un seul endroit pour modifier les types
- ✅ **Déploiement flexible** : Possibilité de déployer séparément
- ✅ **Type Safety** : TypeScript garanti la cohérence 