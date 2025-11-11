import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import mongoose, { Document, Schema } from "mongoose";
import { env } from "./env-loader";
import { buildBaseMatch } from "./filterUtils";

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
  daysBeforeDeparture: number;
  train_number: number;
  train_name: string;
  carrier: string;
  departure_station: Station;
  arrival_station: Station;
  pricing: Pricing;
  is_error: boolean;
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
  flexibilities: string[];
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

interface ChartDataResult {
  price: number;
  is_sellable: boolean;
  daysBeforeDeparture: number;
  discountCard?: string;
}

interface ChartStatsResult {
  chartData: ChartDataResult[];
  stats: {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
  };
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
  is_error: { type: Boolean, required: false, default: false },
  departure_date: { type: Date, required: true },
  arrival_date: { type: Date, required: true },
  daysBeforeDeparture: { type: Number, required: true },
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

// Cache pour l'endpoint journey-details
interface JourneyDetailsCacheEntry {
  data: DetailedPricingResult[];
  timestamp: number;
}

const pricingCache = new Map<string, CacheEntry>();
const journeyDetailsCache = new Map<string, JourneyDetailsCacheEntry>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const generateCacheKey = (filters: {
  carriers: string[];
  classes: string[];
  discountCards: string[];
  flexibilities: string[];
  selectedDates: string[];
  departureStationId?: number;
  arrivalStationId?: number;
  trainNumber?: number;
}): string => {
  return JSON.stringify({
    carriers: filters.carriers.toSorted(),
    classes: filters.classes.toSorted(),
    discountCards: filters.discountCards.toSorted(),
    flexibilities: filters.flexibilities.toSorted(),
    selectedDates: filters.selectedDates.toSorted(),
    departureStationId: filters.departureStationId,
    arrivalStationId: filters.arrivalStationId,
    trainNumber: filters.trainNumber,
  });
};

const isCacheValid = (entry: CacheEntry): boolean => {
  return Date.now() - entry.timestamp < CACHE_TTL;
};

const isJourneyDetailsCacheValid = (
  entry: JourneyDetailsCacheEntry
): boolean => {
  return Date.now() - entry.timestamp < CACHE_TTL;
};

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

mongoose.set("debug", env.MONGO.DEBUG);

mongoose
  .connect(env.MONGO.URL, {
    serverSelectionTimeoutMS: env.MONGO.SERVER_SELECTION_TIMEOUT,
    socketTimeoutMS: env.MONGO.SOCKET_TIMEOUT,
    dbName: env.MONGO.DB_NAME,
  })
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch((err) => console.error("❌ Erreur de connexion à MongoDB:", err));

app.post("/api/trains/pricing", async (req: Request, res: Response) => {
  try {
    const {
      carriers = [],
      classes = [],
      discountCards = [],
      flexibilities = [],
      selectedDates = [],
      trainNumber,
      departureStationId,
      arrivalStationId,
    } = req.body;

    // Vérifier le cache
    const cacheKey = generateCacheKey({
      carriers,
      classes,
      discountCards,
      flexibilities,
      selectedDates,
      trainNumber,
      departureStationId,
      arrivalStationId,
    });

    const cachedEntry = pricingCache.get(cacheKey);
    if (cachedEntry && isCacheValid(cachedEntry)) {
      console.log("Cache hit pour /api/trains/pricing");
      return res.json(cachedEntry.data);
    }

    const baseMatch = buildBaseMatch({
      carriers,
      classes,
      discountCards,
      flexibilities,
      selectedDates,
      trainNumber,
      departureStationId,
      arrivalStationId,
    });

    const data = await Train.aggregate<AggregatedPricingResult>(
      [
        {
          $match: baseMatch,
        },
        {
          $addFields: {
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
            avgPriceJ7: {
              $avg: {
                $cond: [
                  { $eq: ["$daysBeforeDeparture", 7] },
                  "$pricing.price",
                  null,
                ],
              },
            },
            avgPriceJ1ToJ7: {
              $avg: {
                $cond: [
                  {
                    $and: [
                      { $gte: ["$daysBeforeDeparture", 1] },
                      { $lte: ["$daysBeforeDeparture", 7] },
                    ],
                  },
                  "$pricing.price",
                  null,
                ],
              },
            },
            maxPrice: { $max: "$pricing.price" },
            carriers: { $addToSet: "$carrier" },
            classes: { $addToSet: "$pricing.travel_class" },
            discountCards: { $addToSet: "$pricing.discount_card" },
            flexibilities: { $addToSet: "$pricing.flexibility" },
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
            avgPrice: {
              $ifNull: ["$avgPriceJ7", "$avgPriceJ1ToJ7", "$avgPrice"],
            },
            maxPrice: 1,
            carriers: 1,
            classes: 1,
            discountCards: 1,
            flexibilities: 1,
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

// Route POST pour les détails avec filtres (cohérent avec la page d'accueil)
app.post(
  "/api/trains/details/:departureStation/:arrivalStation",
  async (req: Request, res: Response) => {
    try {
      const { departureStation, arrivalStation } = req.params;
      const {
        carriers = [],
        classes = [],
        discountCards = [],
        selectedDate = null,
      } = req.body;

      // Construire les conditions de match avec les filtres
      const matchConditions: Record<string, unknown> = {
        "departure_station.name": departureStation,
        "arrival_station.name": arrivalStation,
      };

      // Ajouter les filtres si ils sont fournis (inclusifs)
      if (carriers && carriers.length > 0) {
        matchConditions.carrier = { $in: carriers };
      }

      if (classes && classes.length > 0) {
        matchConditions["pricing.travel_class"] = { $in: classes };
      }

      if (discountCards && discountCards.length > 0) {
        matchConditions["pricing.discount_card"] = {
          $in: discountCards,
        };
      }

      if (selectedDate) {
        const startDate = new Date(selectedDate);
        const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        matchConditions.departure_date = {
          $gte: startDate,
          $lt: endDate,
        };
      }

      const data = await Train.aggregate<DetailedPricingResult>([
        {
          $match: matchConditions,
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
      console.error(
        "Erreur lors de la récupération des détails avec filtres:",
        error
      );
      res.status(500).json({
        error: "Erreur lors de la récupération des détails avec filtres.",
      });
    }
  }
);

// Nouveaux endpoints pour la logique de sélection en cascade

// 1. Endpoint pour récupérer les dates disponibles
app.post("/api/trains/available-dates", async (req: Request, res: Response) => {
  try {
    const { departureStationId, arrivalStationId } = req.body;

    if (!departureStationId || !arrivalStationId) {
      return res
        .status(400)
        .json({ error: "departureStationId et arrivalStationId sont requis" });
    }

    const data = await Train.aggregate([
      {
        $match: {
          "departure_station.id": departureStationId,
          "arrival_station.id": arrivalStationId,
          "pricing.unsellable_reason": null,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$departure_date" },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
        },
      },
    ]);

    const dates = data.map((item) => item.date);
    res.json(dates);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des dates disponibles:",
      error
    );
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des dates disponibles." });
  }
});

// 2. Endpoint pour récupérer les trains pour une date spécifique
app.post("/api/trains/trains-for-date", async (req: Request, res: Response) => {
  try {
    const { departureStationId, arrivalStationId, date } = req.body;

    if (!departureStationId || !arrivalStationId || !date) {
      return res.status(400).json({
        error: "departureStationId, arrivalStationId et date sont requis",
      });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const data = await Train.aggregate([
      {
        $match: {
          "departure_station.id": departureStationId,
          "arrival_station.id": arrivalStationId,
          departure_date: {
            $gte: startDate,
            $lte: endDate,
          },
          "pricing.unsellable_reason": null,
        },
      },
      {
        $group: {
          _id: {
            trainNumber: "$train_number",
            departureTime: {
              $dateToString: { format: "%H:%M", date: "$departure_date" },
            },
            arrivalTime: {
              $dateToString: { format: "%H:%M", date: "$arrival_date" },
            },
            carrier: "$carrier",
          },
        },
      },
      {
        $project: {
          _id: 0,
          trainNumber: { $toString: "$_id.trainNumber" },
          departureTime: "$_id.departureTime",
          arrivalTime: "$_id.arrivalTime",
          carrier: "$_id.carrier",
        },
      },
      {
        $sort: { departureTime: 1 },
      },
    ]);

    res.json(data);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des trains pour la date:",
      error
    );
    res.status(500).json({
      error: "Erreur lors de la récupération des trains pour la date.",
    });
  }
});

// Endpoint pour l'analyse des statistiques avec filtres
app.post("/api/trains/statistics", async (req: Request, res: Response) => {
  try {
    const {
      carriers = [],
      classes = [],
      discountCards = [],
      flexibilities = [],
      selectedDates = [],
      trainNumber,
      departureStationId,
      arrivalStationId,
    } = req.body;

    // Vérifier le cache
    const cacheKey = generateCacheKey({
      carriers,
      classes,
      discountCards,
      flexibilities,
      selectedDates,
      trainNumber,
      departureStationId,
      arrivalStationId,
    });

    const cachedEntry = journeyDetailsCache.get(cacheKey);
    if (cachedEntry && isJourneyDetailsCacheValid(cachedEntry)) {
      console.log("Cache hit pour /api/trains/statistics");
      return res.json(cachedEntry.data);
    }

    const baseMatch = buildBaseMatch({
      carriers,
      classes,
      discountCards,
      flexibilities,
      selectedDates,
      trainNumber,
      departureStationId,
      arrivalStationId,
    });

    const data = await Train.aggregate<DetailedPricingResult>([
      {
        $match: baseMatch,
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
          departureStationId: "$departure_station.id",
          arrivalStation: "$arrival_station.name",
          arrivalStationId: "$arrival_station.id",
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

    // Mettre en cache les résultats
    journeyDetailsCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    res.json(data);
  } catch (error) {
    console.error("Erreur lors de l'analyse des statistiques :", error);
    res
      .status(500)
      .json({ error: "Erreur lors de l'analyse des statistiques." });
  }
});

// Endpoint spécialisé pour les données de graphiques
app.post("/api/trains/chart-data", async (req: Request, res: Response) => {
  try {
    const {
      carriers = [],
      classes = [],
      discountCards = [],
      flexibilities = [],
      selectedDates = [],
      trainNumber,
      departureStationId,
      arrivalStationId,
    } = req.body;

    // Vérifier le cache
    const cacheKey = generateCacheKey({
      carriers,
      classes,
      discountCards,
      flexibilities,
      selectedDates,
      trainNumber,
      departureStationId,
      arrivalStationId,
    });

    const cachedEntry = journeyDetailsCache.get(cacheKey);
    if (cachedEntry && isJourneyDetailsCacheValid(cachedEntry)) {
      console.log("Cache hit pour /api/trains/chart-data");
      // Convertir les données détaillées en format graphique
      const chartData = cachedEntry.data.map((item) => ({
        price: item.minPrice,
        is_sellable: item.is_sellable,
        daysBeforeDeparture: item.daysBeforeDeparture,
        discountCard: item.discountCard ?? "NONE",
      }));

      // Calculer les statistiques depuis le cache
      const validPrices = chartData
        .map((item) => item.price)
        .filter(
          (price) =>
            typeof price === "number" && !Number.isNaN(price) && price >= 0
        );

      const stats =
        validPrices.length > 0
          ? {
              minPrice: validPrices.reduce(
                (min, price) => Math.min(min, price),
                validPrices[0]
              ),
              maxPrice: validPrices.reduce(
                (max, price) => Math.max(max, price),
                validPrices[0]
              ),
              avgPrice:
                validPrices.reduce((sum, price) => sum + price, 0) /
                validPrices.length,
            }
          : {
              minPrice: 0,
              maxPrice: 0,
              avgPrice: 0,
            };

      const result: ChartStatsResult = {
        chartData,
        stats,
      };

      return res.json(result);
    }

    const baseMatch = buildBaseMatch({
      carriers,
      classes,
      discountCards,
      flexibilities,
      selectedDates,
      trainNumber,
      departureStationId,
      arrivalStationId,
    });

    const data = await Train.aggregate<ChartDataResult>([
      {
        $match: baseMatch,
      },
      {
        $project: {
          _id: 0,
          price: "$pricing.price",
          is_sellable: "$pricing.is_sellable",
          daysBeforeDeparture: 1,
          discountCard: "$pricing.discount_card",
        },
      },
      {
        $group: {
          _id: {
            daysBeforeDeparture: "$daysBeforeDeparture",
            discountCard: "$discountCard",
          },
          prices: { $push: "$price" },
          is_sellable: { $push: "$is_sellable" },
        },
      },
      {
        $project: {
          _id: 0,
          daysBeforeDeparture: "$_id.daysBeforeDeparture",
          discountCard: "$_id.discountCard",
          validPrices: {
            $filter: {
              input: "$prices",
              as: "p",
              cond: {
                $and: [
                  { $ne: ["$$p", null] },
                  { $ne: ["$$p", NaN] },
                  { $gte: ["$$p", 0] },
                ],
              },
            },
          },
          is_sellable: { $anyElementTrue: "$is_sellable" },
        },
      },
      {
        $project: {
          _id: 0,
          daysBeforeDeparture: 1,
          discountCard: 1,
          price: {
            $cond: {
              if: { $gt: [{ $size: "$validPrices" }, 0] },
              then: { $avg: "$validPrices" },
              else: 0,
            },
          },
          is_sellable: 1,
        },
      },
    ]);

    const validPrices = data
      .map((item) => item.price)
      .filter(
        (price) =>
          typeof price === "number" && !Number.isNaN(price) && price >= 0
      );

    const stats =
      validPrices.length > 0
        ? {
            minPrice: validPrices.reduce(
              (min, price) => Math.min(min, price),
              validPrices[0]
            ),
            maxPrice: validPrices.reduce(
              (max, price) => Math.max(max, price),
              validPrices[0]
            ),
            avgPrice:
              validPrices.reduce((sum, price) => sum + price, 0) /
              validPrices.length,
          }
        : {
            minPrice: 0,
            maxPrice: 0,
            avgPrice: 0,
          };

    const result: ChartStatsResult = {
      chartData: data,
      stats,
    };

    // Mettre en cache les résultats (en format détaillé pour compatibilité)
    const detailedData = data.map((item) => ({
      departureStation: "",
      departureStationId: 0,
      arrivalStation: "",
      arrivalStationId: 0,
      travelClass: "",
      discountCard: item.discountCard || "NONE",
      trainName: "",
      carrier: "",
      minPrice: item.price,
      avgPrice: item.price,
      maxPrice: item.price,
      departureDate: "",
      departureTime: "",
      arrivalTime: "",
      is_sellable: item.is_sellable,
      unsellable_reason: null,
      daysBeforeDeparture: item.daysBeforeDeparture,
    }));

    journeyDetailsCache.set(cacheKey, {
      data: detailedData,
      timestamp: Date.now(),
    });

    res.json(result);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données de graphique:",
      error
    );
    res.status(500).json({
      error: "Erreur lors de la récupération des données de graphique.",
    });
  }
});

app.listen(port, () => {
  console.log(`Serveur écoutant sur http://localhost:${port}`);
});
