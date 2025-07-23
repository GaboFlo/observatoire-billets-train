import PriceChart from "@/components/PriceChart";
import PriceTable from "@/components/PriceTable";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { journeys } from "@/data/mockData";
import {
  ArrowLeft,
  ChartBar,
  ChartLine,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

const JourneyDetails = () => {
  const { journeyId } = useParams<{ journeyId: string }>();
  const [activeTab, setActiveTab] = useState("overview");

  // Find the journey data based on the ID
  const journey = journeys.find((j) => j.id === journeyId);

  // If journey is not found, show error
  if (!journey) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container px-4 py-16 mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Trajet non trouvé
          </h1>
          <p className="text-gray-500 mb-8">
            Le trajet que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Button asChild>
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Calculate monthly averages
  const lastThreeMonths = journey.prices.slice(-90);
  const lastMonth = lastThreeMonths.slice(-30);
  const previousMonth = lastThreeMonths.slice(-60, -30);

  const lastMonthAvg =
    lastMonth.reduce((sum, item) => sum + item.price, 0) / lastMonth.length;
  const previousMonthAvg =
    previousMonth.reduce((sum, item) => sum + item.price, 0) /
    previousMonth.length;
  const monthlyChange =
    ((lastMonthAvg - previousMonthAvg) / previousMonthAvg) * 100;

  // Get best day to buy (lowest price in the last 30 days)
  const bestDayToBuy = [...lastMonth].sort((a, b) => a.price - b.price)[0];
  const bestDay = new Date(bestDayToBuy.date).toLocaleDateString("fr-FR", {
    weekday: "long",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex items-center mb-8">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {journey.name}
            </h1>
            <p className="text-gray-500">
              Trajet {journey.origin} → {journey.destination}
            </p>
          </div>
        </div>

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Prix Moyen"
                value={`${journey.averagePrice}€`}
                description="Sur les 90 derniers jours"
                icon={<ChartLine className="h-4 w-4" />}
              />
              <StatCard
                title="Prix Minimum"
                value={`${journey.lowestPrice}€`}
                description="Le tarif le plus bas observé"
                icon={<TrendingDown className="h-4 w-4" />}
              />
              <StatCard
                title="Prix Maximum"
                value={`${journey.highestPrice}€`}
                description="Le tarif le plus élevé observé"
                icon={<TrendingUp className="h-4 w-4" />}
              />
              <StatCard
                title="Variation Mensuelle"
                value={`${monthlyChange > 0 ? "+" : ""}${monthlyChange.toFixed(
                  1
                )}%`}
                trend={monthlyChange > 0 ? "up" : "down"}
                trendValue="Par rapport au mois précédent"
                icon={<ChartBar className="h-4 w-4" />}
              />
            </div>

            <PriceChart
              data={journey.prices.slice(-30)}
              title="Évolution Récente des Prix"
              description="30 derniers jours"
              showFilters={true}
            />

            <PriceTable
              data={journey.prices}
              title="Historique des Prix Récents"
              description="Données factuelles par trajet"
              limit={10}
              showFilters={true}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <PriceChart
              data={journey.prices}
              title="Historique Complet des Prix"
              description="Analyse factuelle sur 90 jours"
              showFilters={true}
            />

            <PriceTable
              data={journey.prices}
              title="Tableau Historique des Prix"
              description="Données complètes par trajet"
              showFilters={true}
            />
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Analyse des Prix</CardTitle>
                  <CardDescription>
                    Informations détaillées sur ce trajet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-muted-foreground">Distance</span>
                      <span className="font-medium">
                        {journey.id === "paris-lyon"
                          ? "465 km"
                          : journey.id === "paris-marseille"
                          ? "773 km"
                          : journey.id === "lyon-nice"
                          ? "472 km"
                          : journey.id === "paris-nantes"
                          ? "385 km"
                          : journey.id === "bordeaux-lille"
                          ? "803 km"
                          : journey.id === "strasbourg-toulouse"
                          ? "945 km"
                          : "Non disponible"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-muted-foreground">
                        Durée moyenne
                      </span>
                      <span className="font-medium">
                        {journey.id === "paris-lyon"
                          ? "2h"
                          : journey.id === "paris-marseille"
                          ? "3h30"
                          : journey.id === "lyon-nice"
                          ? "4h30"
                          : journey.id === "paris-nantes"
                          ? "2h10"
                          : journey.id === "bordeaux-lille"
                          ? "5h"
                          : journey.id === "strasbourg-toulouse"
                          ? "7h30"
                          : "Non disponible"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-muted-foreground">Prix par km</span>
                      <span className="font-medium">
                        {journey.id === "paris-lyon"
                          ? "0,11€"
                          : journey.id === "paris-marseille"
                          ? "0,09€"
                          : journey.id === "lyon-nice"
                          ? "0,12€"
                          : journey.id === "paris-nantes"
                          ? "0,11€"
                          : journey.id === "bordeaux-lille"
                          ? "0,09€"
                          : journey.id === "strasbourg-toulouse"
                          ? "0,09€"
                          : "Non disponible"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-muted-foreground">
                        Période d'affluence
                      </span>
                      <span className="font-medium">
                        {journey.id === "paris-lyon"
                          ? "Ven-Dim"
                          : journey.id === "paris-marseille"
                          ? "Ven-Dim"
                          : journey.id === "lyon-nice"
                          ? "Sam-Dim"
                          : journey.id === "paris-nantes"
                          ? "Ven-Dim"
                          : journey.id === "bordeaux-lille"
                          ? "Ven-Sam"
                          : journey.id === "strasbourg-toulouse"
                          ? "Ven-Sam"
                          : "Non disponible"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Trains par jour
                      </span>
                      <span className="font-medium">
                        {journey.id === "paris-lyon"
                          ? "25-30"
                          : journey.id === "paris-marseille"
                          ? "15-20"
                          : journey.id === "lyon-nice"
                          ? "8-12"
                          : journey.id === "paris-nantes"
                          ? "15-20"
                          : journey.id === "bordeaux-lille"
                          ? "6-10"
                          : journey.id === "strasbourg-toulouse"
                          ? "4-8"
                          : "Non disponible"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conseils pour ce Trajet</CardTitle>
                  <CardDescription>
                    Recommandations pour obtenir les meilleurs tarifs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-train-50 p-4 text-sm">
                      <p className="font-medium mb-2">Réservez à l'avance</p>
                      <p className="text-gray-600">
                        Les billets pour ce trajet sont généralement disponibles
                        3 mois à l'avance. Les meilleurs prix sont souvent
                        trouvés 40-60 jours avant le départ.
                      </p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-4 text-sm">
                      <p className="font-medium mb-2">Horaires flexibles?</p>
                      <p className="text-gray-600">
                        Les trains en milieu de journée (11h-15h) et les
                        premiers/derniers trains de la journée sont souvent
                        moins chers pour ce trajet.
                      </p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-4 text-sm">
                      <p className="font-medium mb-2">Cartes de réduction</p>
                      <p className="text-gray-600">
                        Une carte de réduction peut être rentabilisée en
                        {journey.id === "paris-lyon"
                          ? " 2-3 allers-retours"
                          : journey.id === "paris-marseille"
                          ? " 1-2 allers-retours"
                          : journey.id === "lyon-nice"
                          ? " 2-3 allers-retours"
                          : journey.id === "paris-nantes"
                          ? " 2-3 allers-retours"
                          : journey.id === "bordeaux-lille"
                          ? " 1-2 allers-retours"
                          : journey.id === "strasbourg-toulouse"
                          ? " 1 aller-retour"
                          : " quelques trajets"}{" "}
                        sur cette ligne.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default JourneyDetails;
