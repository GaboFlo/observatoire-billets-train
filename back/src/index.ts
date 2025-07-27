import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import mongoose, { Document, Schema } from "mongoose";
import { env } from "./env-loader";
import fs from "fs";
import path from "path";

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

// Mapping des IDs de stations Paris vers les IDs spécifiques selon la destination
const parisStationMapping: { [key: string]: { departureId: number; arrivalId: number } } = {
  // Paris (4916) → Ville avec gare Paris spécifique
  "4916-828": { departureId: 4920, arrivalId: 828 },      // Paris → Bordeaux (Montparnasse)
  "4916-4718": { departureId: 4924, arrivalId: 4676 },    // Paris → Lyon (Gare de Lyon)
  "4916-4791": { departureId: 4924, arrivalId: 4791 },    // Paris → Marseille (Gare de Lyon)
  "4916-5097": { departureId: 4920, arrivalId: 5097 },    // Paris → Rennes (Montparnasse)
  "4916-153": { departureId: 4919, arrivalId: 153 },      // Paris → Strasbourg (Gare de Lyon)
  "4916-4652": { departureId: 4922, arrivalId: 4652 },    // Paris → Lille (Paris Nord)
  "4916-5892": { departureId: 4922, arrivalId: 5892 },    // Paris → London (Paris Nord)
  "4916-4687": { departureId: 4920, arrivalId: 4687 },    // Paris → La-Rochelle (Montparnasse)
  "4916-1193": { departureId: 4917, arrivalId: 8925 },    // Paris → Clermont-Ferrand (Gare de Lyon)
  "4916-10498": { departureId: 4924, arrivalId: 10498 },  // Paris → Besançon (Gare de Lyon)
  "4916-1339": { departureId: 4924, arrivalId: 1339 },    // Paris → Chambéry (Gare de Lyon)
  "4916-6617": { departureId: 4924, arrivalId: 6625 },    // Paris → Barcelone (Gare de Lyon)
  
  // Ville → Paris (4916) avec gare Paris spécifique
  "828-4916": { departureId: 828, arrivalId: 4920 },      // Bordeaux → Paris (Montparnasse)
  "4718-4916": { departureId: 4676, arrivalId: 4924 },    // Lyon → Paris (Gare de Lyon)
  "4791-4916": { departureId: 4791, arrivalId: 4924 },    // Marseille → Paris (Gare de Lyon)
  "5097-4916": { departureId: 5097, arrivalId: 4920 },    // Rennes → Paris (Montparnasse)
  "153-4916": { departureId: 153, arrivalId: 4919 },      // Strasbourg → Paris (Gare de Lyon)
  "4652-4916": { departureId: 4652, arrivalId: 4922 },    // Lille → Paris (Paris Nord)
  "5892-4916": { departureId: 5892, arrivalId: 4922 },    // London → Paris (Paris Nord)
  "4687-4916": { departureId: 4687, arrivalId: 4920 },    // La-Rochelle → Paris (Montparnasse)
  "1193-4916": { departureId: 8925, arrivalId: 4917 },    // Clermont-Ferrand → Paris (Gare de Lyon)
  "10498-4916": { departureId: 10498, arrivalId: 4924 },  // Besançon → Paris (Gare de Lyon)
  "1339-4916": { departureId: 1339, arrivalId: 4924 },    // Chambéry → Paris (Gare de Lyon)
  "6617-4916":{departureId:6625, arrivalId:4924},    // Barcelone → Paris (Gare de Lyon)
};

// Coordonnées géographiques pour le fallback (stations problématiques)
const stationCoordinates: { [key: string]: { lat: number; lng: number } } = {
  // Gares Paris
  "4920": { lat: 48.838255, lng: 2.315691 },  // Paris (Bordeaux)
  "4919": { lat: 48.87744, lng: 2.359728 },  // Paris (Strasbourg)
  "4917": { lat: 48.837373, lng: 2.384444 },  // Paris Gare de Lyon (Clermont-Ferrand)
  
  // Villes avec problèmes
  "828": { lat: 44.825513, lng: -0.555597 },   // Bordeaux St-Jean
  "153": { lat: 48.585125, lng: 7.734254 },    // Strasbourg
  "8925": { lat: 45.778581, lng: 3.10082 }    // Clermont-Ferrand
};

app.get("/api/trains/routes", async (req: Request, res: Response) => {
  const { dep, arr } = req.query;
  
  if (!dep || !arr) {
    return res.status(400).json({ error: "Les paramètres dep et arr sont requis" });
  }

  try {
    // Vérifier s'il y a un mapping spécifique pour ce trajet
    const depStr = dep as string;
    const arrStr = arr as string;
    const routeKey = `${depStr}-${arrStr}`;
    
    const mappedRoute = parisStationMapping[routeKey];
    
    let finalDep = depStr;
    let finalArr = arrStr;
    
    if (mappedRoute) {
      finalDep = mappedRoute.departureId.toString();
      finalArr = mappedRoute.arrivalId.toString();
      console.log(`Mapping appliqué: ${depStr}-${arrStr} → ${finalDep}-${finalArr}`);
    }
    
    // Chercher la route dans les fichiers individuels (aller ou retour)
    const routeKeyFinal = `${finalDep}-${finalArr}`;
    const routeKeyReverse = `${finalArr}-${finalDep}`;
    
    let routeData = null;
    let isReversed = false;
    
    // Essayer d'abord le trajet direct
    const routeFilePath = path.join(__dirname, 'routes', `${routeKeyFinal}.json`);
    if (fs.existsSync(routeFilePath)) {
      routeData = JSON.parse(fs.readFileSync(routeFilePath, 'utf8'));
    }
    
    // Si pas trouvé, essayer le trajet inverse
    if (!routeData) {
      const reverseRouteFilePath = path.join(__dirname, 'routes', `${routeKeyReverse}.json`);
      if (fs.existsSync(reverseRouteFilePath)) {
        routeData = JSON.parse(fs.readFileSync(reverseRouteFilePath, 'utf8'));
        isReversed = true;
      }
    }
    
    if (routeData) {
      console.log(`Route trouvée dans le fichier statique: ${isReversed ? routeKeyReverse : routeKeyFinal}${isReversed ? ' (inversée)' : ''}`);
      
      // Si c'est un trajet retour, inverser les coordonnées
      if (isReversed) {
        const reversedRouteData = {
          ...routeData,
          geometry: {
            ...routeData.geometry,
            coordinates: routeData.geometry.coordinates.map((ring: number[][]) =>
              ring.slice().reverse()
            )
          }
        };
        res.json(reversedRouteData);
        return;
      }
      
      res.json(routeData);
      return;
    }
    
    console.log(`Route non trouvée dans le fichier statique: ${routeKeyFinal} ou ${routeKeyReverse}`);
    return res.status(404).json({ 
      error: "Route non trouvée",
      message: `Route non disponible pour dep=${finalDep}, arr=${finalArr}`,
      originalRequest: { dep: depStr, arr: arrStr },
      mappedRequest: { dep: finalDep, arr: finalArr }
    });
    
  } catch (error) {
    console.error("Erreur lors de la récupération de la route:", error);
    return res.status(500).json({ 
      error: "Erreur interne",
      message: "Erreur lors de la récupération de la route",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
});



app.listen(port, () => {
  console.log(`Serveur écoutant sur http://localhost:${port}`);
});
