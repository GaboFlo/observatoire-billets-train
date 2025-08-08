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
  travelClass: string;
  discountCard: string;
  trainName: string;
  carrier: string;
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
  departureDate: string; // Ajouter la date de départ
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

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

mongoose.set("debug", true);

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

      // Mapper les IDs de stations si nécessaire
      if (trainObj.departure_station.id === 5085) {
        trainObj.departure_station.id = 4687;
      }
      if (trainObj.arrival_station.id === 5085) {
        trainObj.arrival_station.id = 4687;
      }

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
const mapStationId = (stationId: number): number => {
  // Station 5085 doit être traitée comme station 4687
  if (stationId === 5085) {
    return 4687;
  }
  return stationId;
};

app.get("/api/trains/pricing", async (req: Request, res: Response) => {
  try {
    const { excludedCarriers, excludedClasses, excludedDiscountCards } =
      req.query;

    // Construire le match de base
    const baseMatch: any = {
      "pricing.flexibility": "semiflexi",
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

    const data = await Train.aggregate<AggregatedPricingResult>([
      {
        $match: baseMatch,
      },
      {
        $addFields: {
          mappedDepartureStationId: {
            $cond: {
              if: { $eq: ["$departure_station.id", 5085] },
              then: 4687,
              else: "$departure_station.id",
            },
          },
          mappedArrivalStationId: {
            $cond: {
              if: { $eq: ["$arrival_station.id", 5085] },
              then: 4687,
              else: "$arrival_station.id",
            },
          },
        },
      },
      {
        $group: {
          _id: {
            departureStation: "$departure_station.name",
            departureStationId: "$mappedDepartureStationId",
            arrivalStation: "$arrival_station.name",
            arrivalStationId: "$mappedArrivalStationId",
            travelClass: "$pricing.travel_class",
            discountCard: "$pricing.discount_card",
            trainName: "$train_name",
            carrier: "$carrier",
            departureDate: "$departure_date", // Ajouter la date de départ au groupe
          },
          minPrice: { $min: "$pricing.price" },
          avgPrice: { $avg: "$pricing.price" },
          maxPrice: { $max: "$pricing.price" },
        },
      },
      {
        $project: {
          _id: 0,
          departureStation: "$_id.departureStation",
          departureStationId: "$_id.departureStationId",
          arrivalStation: "$_id.arrivalStation",
          arrivalStationId: "$_id.arrivalStationId",
          travelClass: "$_id.travelClass",
          discountCard: "$_id.discountCard",
          trainName: "$_id.trainName",
          carrier: "$_id.carrier",
          minPrice: 1,
          avgPrice: 1,
          maxPrice: 1,
          departureDate: "$_id.departureDate", // Inclure la date de départ dans le projet
        },
      },
    ]);

    res.json(data);
  } catch (error) {
    console.error("Erreur lors de l'agrégation des données:", error);
    res.status(500).json({ error: "Erreur lors de l'agrégation des données." });
  }
});

app.get("/api/trains/dates", async (req: Request, res: Response) => {
  try {
    // Récupérer les dates distinctes de départ (sans les heures)
    const dates = await Train.aggregate([
      {
        $addFields: {
          // Extraire seulement la date (sans l'heure) en format YYYY-MM-DD
          dateOnly: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$departure_date",
            },
          },
        },
      },
      {
        $group: {
          _id: "$dateOnly",
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
        },
      },
      {
        $sort: {
          date: -1, // Trier par date décroissante (plus récent en premier)
        },
      },
    ]);

    // Extraire les dates du résultat
    const formattedDates = dates.map((item) => item.date);

    res.json(formattedDates);
  } catch (error) {
    console.error("Erreur lors de la récupération des dates:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des dates." });
  }
});

app.listen(port, () => {
  console.log(`Serveur écoutant sur http://localhost:${port}`);
});
