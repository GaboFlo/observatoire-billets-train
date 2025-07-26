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
  arrivalStation: string;
  travelClass: string;
  discountCard: string;
  trainName: string;
  carrier: string;
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
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
    res.json(data);
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des données." });
  }
});

app.get("/api/trains/pricing", async (req: Request, res: Response) => {
  try {
    const data = await Train.aggregate<AggregatedPricingResult>([
      {
        $match: {
          "pricing.flexibility": "semiflexi",
        },
      },
      {
        $group: {
          _id: {
            departureStation: "$departure_station.name",
            departureStationId: "$departure_station.id",
            arrivalStation: "$arrival_station.name",
            arrivalStationId: "$arrival_station.id",
            travelClass: "$pricing.travel_class",
            discountCard: "$pricing.discount_card",
            trainName: "$train_name",
            carrier: "$carrier",
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
        },
      },
    ]);

    res.json(data);
  } catch (error) {
    console.error("Erreur lors de l'agrégation des données:", error);
    res.status(500).json({ error: "Erreur lors de l'agrégation des données." });
  }
});

app.listen(port, () => {
  console.log(`Serveur écoutant sur http://localhost:${port}`);
});
