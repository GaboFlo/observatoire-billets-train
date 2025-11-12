# Observatoire des billets de train

Application web permettant d'analyser et de visualiser les prix des billets de train sur différentes routes, avec des statistiques détaillées et des graphiques d'évolution des tarifs.

## Architecture

Le projet est organisé en monorepo avec deux applications principales :

- **Backend** : API REST Express.js avec MongoDB
- **Frontend** : Application React avec Vite

## Backend

### Technologies

- **Express.js** : Framework web pour Node.js
- **MongoDB** : Base de données NoSQL pour le stockage des données de trains
- **Mongoose** : ODM pour MongoDB
- **TypeScript** : Typage statique

### Structure des données

Les données sont stockées dans MongoDB avec le schéma suivant :

```typescript
Train {
  created_at: Date
  departure_date: Date
  arrival_date: Date
  daysBeforeDeparture: number
  train_number: number
  train_name: string
  carrier: string
  departure_station: {
    id: number
    name: string
    parent_name: string
  }
  arrival_station: {
    id: number
    name: string
    parent_name: string
  }
  pricing: {
    price: number
    unsellable_reason: string | null
    discount_card: string
    travel_class: string
    flexibility: string
    is_sellable: boolean
  }
  is_error: boolean
}
```

### API Endpoints

#### `POST /api/trains/pricing`

Récupère les tarifs agrégés par route avec statistiques (min, max, moyenne).

**Paramètres** :

- `carriers` : Tableau de transporteurs
- `classes` : Tableau de classes de voyage
- `discountCards` : Tableau de cartes de réduction
- `flexibilities` : Tableau de flexibilités
- `selectedDates` : Tableau de dates sélectionnées
- `trainNumber` : Numéro de train (optionnel)
- `departureStationId` : ID de la gare de départ (optionnel)
- `arrivalStationId` : ID de la gare d'arrivée (optionnel)

**Réponse** : Tableau d'objets contenant les statistiques de prix par route.

#### `GET /api/trains/details/:departureStation/:arrivalStation`

Récupère les détails complets d'un trajet spécifique.

**Paramètres URL** :

- `departureStation` : Nom de la gare de départ
- `arrivalStation` : Nom de la gare d'arrivée

#### `POST /api/trains/details/:departureStation/:arrivalStation`

Récupère les détails d'un trajet avec filtres appliqués.

**Paramètres URL** : Identiques au GET

**Corps de la requête** :

- `carriers` : Tableau de transporteurs
- `classes` : Tableau de classes de voyage
- `discountCards` : Tableau de cartes de réduction
- `selectedDate` : Date spécifique (optionnel)

#### `POST /api/trains/available-dates`

Récupère les dates disponibles pour un trajet donné.

**Corps de la requête** :

- `departureStationId` : ID de la gare de départ
- `arrivalStationId` : ID de la gare d'arrivée

#### `POST /api/trains/trains-for-date`

Récupère les trains disponibles pour une date spécifique.

**Corps de la requête** :

- `departureStationId` : ID de la gare de départ
- `arrivalStationId` : ID de la gare d'arrivée
- `date` : Date au format YYYY-MM-DD

#### `POST /api/trains/statistics`

Récupère les statistiques détaillées avec filtres.

**Paramètres** : Identiques à `/api/trains/pricing`

#### `POST /api/trains/chart-data`

Récupère les données formatées pour les graphiques avec statistiques.

**Paramètres** : Identiques à `/api/trains/pricing`

**Réponse** : Objet contenant `chartData` (données pour graphique) et `stats` (min, max, moyenne).

### Système de cache

Le backend implémente un système de cache en mémoire pour optimiser les performances :

- **TTL** : 1 heure (60 minutes)
- **Cache par clé** : Générée à partir des filtres appliqués
- **Endpoints mis en cache** : `/pricing`, `/statistics`, `/chart-data`

### Agrégations MongoDB

Le backend utilise des agrégations MongoDB complexes pour :

- Calculer les statistiques de prix (min, max, moyenne)
- Grouper les données par route (normalisation bidirectionnelle)
- Filtrer les données selon les critères fournis
- Calculer les moyennes spécifiques (J7, J1-J7)

### Configuration

Le backend lit la configuration depuis les variables d'environnement :

- `.env.local` (priorité)
- `.env.production`
- `.env`

**Variables requises** :

```env
MONGO_URL=mongodb://localhost:27017/train
MONGO_DB_NAME=DATABASE
MONGO_COLLECTION_NAME=COLLECTION_NAME
MONGO_SERVER_SELECTION_TIMEOUT=5000
MONGO_SOCKET_TIMEOUT=45000
MONGO_DEBUG=false
```

## Frontend

### Technologies utilisées

- **React** : Bibliothèque UI
- **Vite** : Build tool et serveur de développement
- **React Router** : Routage
- **React Query** : Gestion des données et cache côté client
- **Tailwind CSS** : Styles
- **Recharts** : Graphiques

### Configuration de l'API

Le frontend utilise une variable d'environnement pour déterminer l'URL du backend :

- **En développement** : Le proxy Vite redirige automatiquement `/api` vers `http://localhost:3000`
- **En production** : Définir la variable `VITE_API_URL` avec l'URL complète du backend

**Exemple de configuration locale** :

```env
# .env.local (développement) - peut être laissé vide pour utiliser le proxy
VITE_API_URL=

# .env.production (production locale)
VITE_API_URL=https://votre-backend.web.com
```

**Important** : Avec Vite, les variables d'environnement sont intégrées au moment du build. Vous devez donc rebuild votre application après avoir modifié `VITE_API_URL`.

### Pages principales

- **Index** : Vue d'ensemble avec carte des trajets et filtres globaux
- **JourneyDetails** : Détails d'un trajet spécifique avec graphiques et statistiques

## Installation

### Prérequis

- Node.js (version 18+)
- MongoDB (local ou distant)
- npm

### Étapes

1. Cloner le repository

2. Installer les dépendances :

```bash
npm run install:all
```

3. Configurer les variables d'environnement :

   Créer un fichier `.env.local` dans le dossier `back/` avec les paramètres MongoDB.

4. Démarrer les applications :

```bash
# Démarrage simultané du frontend et du backend
npm run dev

# Ou séparément
npm run dev:front  # Frontend sur http://localhost:5173
npm run dev:back   # Backend sur http://localhost:3000
```

## Build de production

```bash
npm run build:all
```

## Structure du projet

```text
.
├── back/              # Backend Express.js
│   ├── src/
│   │   ├── index.ts          # Point d'entrée et routes API
│   │   ├── config.ts         # Configuration dotenv
│   │   ├── env-loader.ts     # Chargement des variables d'environnement
│   │   └── filterUtils.ts    # Utilitaires de filtrage MongoDB
│   └── package.json
├── front/             # Frontend React
│   ├── src/
│   │   ├── pages/            # Pages de l'application
│   │   ├── components/       # Composants React
│   │   ├── hooks/            # Hooks personnalisés
│   │   └── services/         # Services API
│   └── package.json
└── package.json       # Configuration monorepo
```
