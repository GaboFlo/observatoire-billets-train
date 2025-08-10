import {
  ArrowLeft,
  ChartBar,
  ChartLine,
  Train,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import GlobalFiltersReusable from "../components/GlobalFiltersReusable";
import JourneyKPIs from "../components/JourneyKPIs";
import LoadingAnimation from "../components/LoadingAnimation";
import PriceEvolutionChart from "../components/PriceEvolutionChart";
import StatCard from "../components/StatCard";
import TrainDetailsTable from "../components/TrainDetailsTable";
import { Badge } from "../components/ui/badge";
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
import { useJourneyDetailsFilters } from "../hooks/useJourneyDetailsFilters";

const JourneyDetails = () => {
  const { departureStation, arrivalStation } = useParams<{
    departureStation: string;
    arrivalStation: string;
  }>();
  const [activeTab, setActiveTab] = useState("overview");
  const { journey, detailedOffers, loading, error } = useJourneyDetails(
    departureStation || "",
    arrivalStation || ""
  );

  const {
    filters,
    filteredOffers,
    handleCarrierFilter,
    handleClassFilter,
    handleDiscountCardFilter,
    handleTrainSelect,
    clearFilters,
    clearTrainFilter,
  } = useJourneyDetailsFilters(detailedOffers);

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
            <TabsTrigger value="trains">Trains</TabsTrigger>
            <TabsTrigger value="evolution">Évolution des prix</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <JourneyKPIs offers={filteredOffers} />

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

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
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
                        <Badge key={carrier} variant="outline">
                          {carrier}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Classes de voyage</h4>
                    <div className="flex flex-wrap gap-2">
                      {journey.classes.map((travelClass: string) => (
                        <Badge key={travelClass} variant="outline">
                          {travelClass}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Cartes de réduction</h4>
                    <div className="flex flex-wrap gap-2">
                      {journey.discountCards.map((card: string) => (
                        <Badge key={card} variant="outline">
                          {card}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trains" className="space-y-6">
            <GlobalFiltersReusable
              offers={detailedOffers}
              filters={filters}
              onCarrierFilter={handleCarrierFilter}
              onClassFilter={handleClassFilter}
              onDiscountCardFilter={handleDiscountCardFilter}
              clearFilters={clearFilters}
            />

            {(filters.selectedTrainName || filters.selectedDepartureDate) && (
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Train className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-sm text-blue-800">
                        <span className="font-semibold">
                          Train sélectionné :
                        </span>{" "}
                        {filters.selectedTrainName && (
                          <span>{filters.selectedTrainName}</span>
                        )}
                        {filters.selectedDepartureDate && (
                          <span>
                            {" "}
                            -{" "}
                            {new Date(
                              filters.selectedDepartureDate
                            ).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearTrainFilter}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                    >
                      Voir tous les trains
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <TrainDetailsTable
              offers={filteredOffers}
              onTrainSelect={handleTrainSelect}
            />
          </TabsContent>

          <TabsContent value="evolution" className="space-y-6">
            <GlobalFiltersReusable
              offers={detailedOffers}
              filters={filters}
              onCarrierFilter={handleCarrierFilter}
              onClassFilter={handleClassFilter}
              onDiscountCardFilter={handleDiscountCardFilter}
              clearFilters={clearFilters}
            />

            <PriceEvolutionChart offers={filteredOffers} />
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
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

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
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
