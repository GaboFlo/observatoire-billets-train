import {
  ArrowLeft,
  ChartBar,
  ChartLine,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import LoadingAnimation from "../components/LoadingAnimation";
import StatCard from "../components/StatCard";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useJourneyDetails } from "../hooks/useJourneyDetails";

const JourneyDetails = () => {
  const { journeyId } = useParams<{ journeyId: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  const { journey, loading, error } = useJourneyDetails(journeyId || "");

  if (loading) {
    return <LoadingAnimation />;
  }

  if (error || !journey) {
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

  // Calculer la variation (pour l'instant, on utilise une valeur fixe car nous n'avons pas d'historique temporel)
  const monthlyChange = 0; // À remplacer par un calcul réel quand l'historique sera disponible

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
            <TabsTrigger value="details">Détails</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Prix Moyen"
                value={`${journey.avgPrice}€`}
                description="Prix moyen des offres disponibles"
                icon={ChartLine}
                color="blue"
              />
              <StatCard
                title="Prix Minimum"
                value={`${journey.minPrice}€`}
                description="Le tarif le plus bas observé"
                icon={TrendingDown}
                color="green"
              />
              <StatCard
                title="Prix Maximum"
                value={`${journey.maxPrice}€`}
                description="Le tarif le plus élevé observé"
                icon={TrendingUp}
                color="orange"
              />
              <StatCard
                title="Variation Mensuelle"
                value={`${monthlyChange > 0 ? "+" : ""}${monthlyChange.toFixed(
                  1
                )}%`}
                description="Par rapport au mois précédent"
                icon={ChartBar}
                color="purple"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Offres Disponibles</CardTitle>
                <CardDescription>
                  {journey.offers.length} offre
                  {journey.offers.length > 1 ? "s" : ""} disponible
                  {journey.offers.length > 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Compagnies</h4>
                    <div className="flex flex-wrap gap-2">
                      {journey.carriers.map((carrier: string) => (
                        <span
                          key={carrier}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                        >
                          {carrier}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Classes de voyage</h4>
                    <div className="flex flex-wrap gap-2">
                      {journey.classes.map((travelClass: string) => (
                        <span
                          key={travelClass}
                          className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
                        >
                          {travelClass}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Cartes de réduction</h4>
                    <div className="flex flex-wrap gap-2">
                      {journey.discountCards.map((card: string) => (
                        <span
                          key={card}
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm"
                        >
                          {card}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informations du Trajet</CardTitle>
                  <CardDescription>Détails sur ce trajet</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-muted-foreground">
                        Station de départ
                      </span>
                      <span className="font-medium">
                        {journey.departureStation}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-muted-foreground">
                        Station d'arrivée
                      </span>
                      <span className="font-medium">
                        {journey.arrivalStation}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-muted-foreground">
                        ID du trajet
                      </span>
                      <span className="font-medium">{journey.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Nombre d'offres
                      </span>
                      <span className="font-medium">
                        {journey.offers.length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Statistiques de Prix</CardTitle>
                  <CardDescription>
                    Analyse des prix pour ce trajet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-muted-foreground">
                        Prix minimum
                      </span>
                      <span className="font-medium">{journey.minPrice}€</span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-muted-foreground">Prix moyen</span>
                      <span className="font-medium">{journey.avgPrice}€</span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-muted-foreground">
                        Prix maximum
                      </span>
                      <span className="font-medium">{journey.maxPrice}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Écart de prix
                      </span>
                      <span className="font-medium">
                        {journey.maxPrice - journey.minPrice}€
                      </span>
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
