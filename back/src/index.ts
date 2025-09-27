import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import mongoose, { Document, Schema } from "mongoose";
import { env } from "./env-loader";

dotenv.config({ path: `.env.local`, override: true });

interface Station {
  id: number;
  name: string;
  parent_name: string;
}

interface Pricing {
  price: number;
  unsellable_reason: string | null;
  discount_card: string;
  travel_class: string;
  flexibility: string;
  is_sellable: boolean;
}

interface TrainDocument extends Document {
  created_at: Date;
  departure_date: Date;
  arrival_date: Date;
  train_number: number;
  train_name: string;
  carrier: string;
  departure_station: Station;
  arrival_station: Station;
  pricing: Pricing;
}

interface AggregatedPricingResult {
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
}

interface DetailedPricingResult {
  departureStation: string;
  departureStationId: number;
  arrivalStation: string;
  arrivalStationId: number;
  travelClass: string;
  discountCard: string;
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

const stationSchema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  parent_name: { type: String, required: true },
});

const pricingSchema = new Schema({
  price: { type: Number, required: true },
  unsellable_reason: { type: String, default: null },
  discount_card: { type: String, required: true },
  travel_class: { type: String, required: true },
  flexibility: { type: String, required: true },
  is_sellable: { type: Boolean, required: true },
});

const trainSchema = new Schema<TrainDocument>({
  created_at: { type: Date, required: true },
  departure_date: { type: Date, required: true },
  arrival_date: { type: Date, required: true },
  train_number: { type: Number, required: true },
  train_name: { type: String, required: true },
  carrier: { type: String, required: true },
  departure_station: { type: stationSchema, required: true },
  arrival_station: { type: stationSchema, required: true },
  pricing: { type: pricingSchema, required: true },
});

const Train = mongoose.model<TrainDocument>(
  "Train",
  trainSchema,
  env.MONGO.COLLECTION_NAME
);

// Cache pour l'endpoint pricing
interface CacheEntry {
  data: AggregatedPricingResult[];
  timestamp: number;
}

const pricingCache = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const generateCacheKey = (filters: {
  excludedCarriers: string[];
  excludedClasses: string[];
  excludedDiscountCards: string[];
  selectedDate: string | null;
}): string => {
  return JSON.stringify({
    excludedCarriers: filters.excludedCarriers.toSorted(),
    excludedClasses: filters.excludedClasses.toSorted(),
    excludedDiscountCards: filters.excludedDiscountCards.toSorted(),
    selectedDate: filters.selectedDate,
  });
};

const isCacheValid = (entry: CacheEntry): boolean => {
  return Date.now() - entry.timestamp < CACHE_TTL;
};

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

mongoose.set("debug", false);

mongoose
  .connect(env.MONGO.URL, {
    serverSelectionTimeoutMS: env.MONGO.SERVER_SELECTION_TIMEOUT,
    socketTimeoutMS: env.MONGO.SOCKET_TIMEOUT,
    dbName: env.MONGO.DB_NAME,
  })
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch((err) => console.error("❌ Erreur de connexion à MongoDB:", err));

app.get("/api/trains", async (req: Request, res: Response) => {
  const { departure, arrival, date, trainNumber } = req.query;
  try {
    const data = await Train.find({
      "departure_station.name": departure,
      "arrival_station.name": arrival,
      train_number: trainNumber,
      departure_date: {
        $gte: new Date(date as string),
        $lt: new Date(new Date(date as string).getTime() + 24 * 60 * 60 * 1000),
      },
    });

    // Appliquer le mapping des stations aux résultats
    const mappedData = data.map((train) => {
      const trainObj = train.toObject();

      return trainObj;
    });

    res.json(mappedData);
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des données." });
  }
});

// Fonction pour mapper les IDs de stations

app.get("/api/trains/pricing", async (req: Request, res: Response) => {
  try {
    const { excludedCarriers, excludedClasses, excludedDiscountCards } =
      req.query;

    // Construire le match de base
    const baseMatch: any = {
      "pricing.unsellable_reason": null,
    };

    // Ajouter les filtres par compagnies exclues
    if (excludedCarriers && typeof excludedCarriers === "string") {
      const carriers = excludedCarriers.split(",");
      if (carriers.length > 0) {
        baseMatch.carrier = { $nin: carriers };
      }
    }

    // Ajouter les filtres par classes exclues
    if (excludedClasses && typeof excludedClasses === "string") {
      const classes = excludedClasses.split(",");
      if (classes.length > 0) {
        baseMatch["pricing.travel_class"] = { $nin: classes };
      }
    }

    // Ajouter les filtres par cartes de réduction exclues
    if (excludedDiscountCards && typeof excludedDiscountCards === "string") {
      const discountCards = excludedDiscountCards.split(",");
      if (discountCards.length > 0) {
        baseMatch["pricing.discount_card"] = { $nin: discountCards };
      }
    }

    const data = await Train.aggregate<AggregatedPricingResult>(
      [
        {
          $match: baseMatch,
        },
        {
          $addFields: {
            // Créer une clé de route normalisée pour regrouper les trajets aller-retour
            routeKey: {
              $cond: {
                if: {
                  $lt: ["$departure_station.id", "$arrival_station.id"],
                },
                then: {
                  station1: "$departure_station.name",
                  station1Id: "$departure_station.id",
                  station2: "$arrival_station.name",
                  station2Id: "$arrival_station.id",
                },
                else: {
                  station1: "$arrival_station.name",
                  station1Id: "$arrival_station.id",
                  station2: "$departure_station.name",
                  station2Id: "$departure_station.id",
                },
              },
            },
          },
        },
        {
          $group: {
            _id: {
              station1: "$routeKey.station1",
              station1Id: "$routeKey.station1Id",
              station2: "$routeKey.station2",
              station2Id: "$routeKey.station2Id",
            },
            minPrice: { $min: "$pricing.price" },
            avgPrice: { $avg: "$pricing.price" },
            maxPrice: { $max: "$pricing.price" },
            // Collecter seulement les listes uniques
            carriers: { $addToSet: "$carrier" },
            classes: { $addToSet: "$pricing.travel_class" },
            discountCards: { $addToSet: "$pricing.discount_card" },
            // Garder les informations sur les deux sens
            departureStation: { $first: "$departure_station.name" },
            departureStationId: { $first: "$departure_station.id" },
            arrivalStation: { $first: "$arrival_station.name" },
            arrivalStationId: { $first: "$arrival_station.id" },
          },
        },
        {
          $project: {
            _id: 0,
            departureStation: "$departureStation",
            departureStationId: "$departureStationId",
            arrivalStation: "$arrivalStation",
            arrivalStationId: "$arrivalStationId",
            minPrice: 1,
            avgPrice: 1,
            maxPrice: 1,
            carriers: 1,
            classes: 1,
            discountCards: 1,
          },
        },
      ],
      { allowDiskUse: true }
    );

    res.json(data);
  } catch (error) {
    console.error("Erreur lors de l'agrégation des données:", error);
    res.status(500).json({ error: "Erreur lors de l'agrégation des données." });
  }
});

app.post("/api/trains/pricing", async (req: Request, res: Response) => {
  try {
    const {
      excludedCarriers = [],
      excludedClasses = [],
      excludedDiscountCards = [],
      selectedDate = null,
    } = req.body;

    // Vérifier le cache
    const cacheKey = generateCacheKey({
      excludedCarriers,
      excludedClasses,
      excludedDiscountCards,
      selectedDate,
    });

    const cachedEntry = pricingCache.get(cacheKey);
    if (cachedEntry && isCacheValid(cachedEntry)) {
      console.log("Cache hit pour /api/trains/pricing");
      return res.json(cachedEntry.data);
    }

    // Construire le match de base
    const baseMatch: any = {
      "pricing.unsellable_reason": null,
    };

    // Ajouter les filtres par compagnies exclues
    if (excludedCarriers.length > 0) {
      baseMatch.carrier = { $nin: excludedCarriers };
    }

    // Ajouter les filtres par classes exclues
    if (excludedClasses.length > 0) {
      baseMatch["pricing.travel_class"] = { $nin: excludedClasses };
    }

    // Ajouter les filtres par cartes de réduction exclues
    if (excludedDiscountCards.length > 0) {
      baseMatch["pricing.discount_card"] = { $nin: excludedDiscountCards };
    }

    // Ajouter le filtre par date si spécifié
    if (selectedDate) {
      baseMatch.departure_date = {
        $gte: new Date(selectedDate),
        $lt: new Date(new Date(selectedDate).getTime() + 24 * 60 * 60 * 1000),
      };
    }

    const data = await Train.aggregate<AggregatedPricingResult>(
      [
        {
          $match: baseMatch,
        },
        {
          $addFields: {
            // Créer une clé de route normalisée pour regrouper les trajets aller-retour
            routeKey: {
              $cond: {
                if: {
                  $lt: ["$departure_station.id", "$arrival_station.id"],
                },
                then: {
                  station1: "$departure_station.name",
                  station1Id: "$departure_station.id",
                  station2: "$arrival_station.name",
                  station2Id: "$arrival_station.id",
                },
                else: {
                  station1: "$arrival_station.name",
                  station1Id: "$arrival_station.id",
                  station2: "$departure_station.name",
                  station2Id: "$departure_station.id",
                },
              },
            },
          },
        },
        {
          $group: {
            _id: {
              station1: "$routeKey.station1",
              station1Id: "$routeKey.station1Id",
              station2: "$routeKey.station2",
              station2Id: "$routeKey.station2Id",
            },
            minPrice: { $min: "$pricing.price" },
            avgPrice: { $avg: "$pricing.price" },
            maxPrice: { $max: "$pricing.price" },
            // Collecter seulement les listes uniques
            carriers: { $addToSet: "$carrier" },
            classes: { $addToSet: "$pricing.travel_class" },
            discountCards: { $addToSet: "$pricing.discount_card" },
            // Garder les informations sur les deux sens
            departureStation: { $first: "$departure_station.name" },
            departureStationId: { $first: "$departure_station.id" },
            arrivalStation: { $first: "$arrival_station.name" },
            arrivalStationId: { $first: "$arrival_station.id" },
          },
        },
        {
          $project: {
            _id: 0,
            departureStation: "$departureStation",
            departureStationId: "$departureStationId",
            arrivalStation: "$arrivalStation",
            arrivalStationId: "$arrivalStationId",
            minPrice: 1,
            avgPrice: 1,
            maxPrice: 1,
            carriers: 1,
            classes: 1,
            discountCards: 1,
          },
        },
      ],
      { allowDiskUse: true }
    );

    // Mettre en cache les résultats
    pricingCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    res.json(data);
  } catch (error) {
    console.error("Erreur lors de l'agrégation des données:", error);
    res.status(500).json({ error: "Erreur lors de l'agrégation des données." });
  }
});

app.get(
  "/api/trains/details/:departureStation/:arrivalStation",
  async (req: Request, res: Response) => {
    try {
      const { departureStation, arrivalStation } = req.params;

      const data = await Train.aggregate<DetailedPricingResult>([
        {
          $match: {
            "departure_station.name": departureStation,
            "arrival_station.name": arrivalStation,
          },
        },
        {
          $addFields: {
            daysBeforeDeparture: {
              $ceil: {
                $divide: [
                  { $subtract: ["$departure_date", new Date()] },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            departureStation: "$departure_station.name",
            departureStationId: "$mappedDepartureStationId",
            arrivalStation: "$arrival_station.name",
            arrivalStationId: "$mappedArrivalStationId",
            travelClass: "$pricing.travel_class",
            discountCard: "$pricing.discount_card",
            trainName: "$train_name",
            carrier: "$carrier",
            minPrice: "$pricing.price",
            avgPrice: "$pricing.price",
            maxPrice: "$pricing.price",
            departureDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$departure_date" },
            },
            departureTime: {
              $dateToString: { format: "%H:%M", date: "$departure_date" },
            },
            arrivalTime: {
              $dateToString: { format: "%H:%M", date: "$arrival_date" },
            },
            is_sellable: "$pricing.is_sellable",
            unsellable_reason: "$pricing.unsellable_reason",
            daysBeforeDeparture: 1,
          },
        },
      ]);

      res.json(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des détails:", error);
      res
        .status(500)
        .json({ error: "Erreur lors de la récupération des détails." });
    }
  }
);

app.listen(port, () => {
  console.log(`Serveur écoutant sur http://localhost:${port}`);
});
