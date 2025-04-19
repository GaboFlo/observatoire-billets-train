
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { globalStats, journeys, priceFactors } from "@/data/mockData";
import StatCard from "@/components/StatCard";
import PriceChart from "@/components/PriceChart";
import PriceTable from "@/components/PriceTable";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { CalendarDays, ChartBar, ChartLine, TrendingDown, TrendingUp } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Format updated date
  const lastUpdated = new Date(globalStats.dataUpdatedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Find top price increases and decreases
  const topIncreases = [...journeys]
    .filter(journey => journey.trend === "up")
    .sort((a, b) => b.priceChangePercentage - a.priceChangePercentage)
    .slice(0, 2);

  const topDecreases = [...journeys]
    .filter(journey => journey.trend === "down")
    .sort((a, b) => a.priceChangePercentage - b.priceChangePercentage)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container px-4 py-8 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tendances des Prix de Billets de Train
          </h1>
          <p className="text-gray-500">
            Analyse statistique basée sur les données collectées jusqu'au {lastUpdated}
          </p>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vue Globale</TabsTrigger>
            <TabsTrigger value="journeys">Trajets</TabsTrigger>
            <TabsTrigger value="factors">Facteurs de Prix</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Variation Moyenne des Prix"
                value={`${globalStats.averagePriceChange > 0 ? '+' : ''}${globalStats.averagePriceChange}%`}
                trend={globalStats.averagePriceChange > 0 ? "up" : "down"}
                trendValue="Sur 30 jours"
                icon={<ChartLine className="h-4 w-4" />}
              />
              <StatCard
                title="Trajet le Plus Fréquenté"
                value={globalStats.busiesRoute}
                description="Basé sur le nombre de voyageurs"
                icon={<ChartBar className="h-4 w-4" />}
              />
              <StatCard
                title="Trajet le Plus Cher"
                value={globalStats.mostExpensiveRoute}
                description="Prix moyen le plus élevé"
                icon={<TrendingUp className="h-4 w-4" />}
              />
              <StatCard
                title="Trajet le Moins Cher"
                value={globalStats.cheapestRoute}
                description="Prix moyen le plus bas"
                icon={<TrendingDown className="h-4 w-4" />}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Hausses de Prix Significatives</CardTitle>
                  <CardDescription>Trajets avec les plus fortes augmentations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topIncreases.map((journey) => (
                      <div key={journey.id} className="flex items-center justify-between border-b pb-3">
                        <div>
                          <p className="font-medium">{journey.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Prix moyen: {journey.averagePrice}€
                          </p>
                        </div>
                        <div className="flex items-center text-red-500">
                          <TrendingUp className="mr-1 h-4 w-4" />
                          <span>+{journey.priceChangePercentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" asChild className="w-full">
                    <Link to={`/journey/${topIncreases[0]?.id}`}>
                      Voir les Détails
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Baisses de Prix Significatives</CardTitle>
                  <CardDescription>Trajets avec les plus fortes diminutions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topDecreases.map((journey) => (
                      <div key={journey.id} className="flex items-center justify-between border-b pb-3">
                        <div>
                          <p className="font-medium">{journey.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Prix moyen: {journey.averagePrice}€
                          </p>
                        </div>
                        <div className="flex items-center text-emerald-500">
                          <TrendingDown className="mr-1 h-4 w-4" />
                          <span>{journey.priceChangePercentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" asChild className="w-full">
                    <Link to={`/journey/${topDecreases[0]?.id}`}>
                      Voir les Détails
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <PriceChart
              data={journeys[0].prices}
              title="Évolution des Prix (Paris - Lyon)"
              description="Tendance sur les 90 derniers jours"
            />
          </TabsContent>

          <TabsContent value="journeys" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {journeys.map((journey) => (
                <Card key={journey.id}>
                  <CardHeader>
                    <CardTitle>{journey.name}</CardTitle>
                    <CardDescription>{journey.origin} → {journey.destination}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <div>
                          <p className="text-muted-foreground">Prix Min</p>
                          <p className="font-medium text-lg">{journey.lowestPrice}€</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Prix Moyen</p>
                          <p className="font-medium text-lg">{journey.averagePrice}€</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Prix Max</p>
                          <p className="font-medium text-lg">{journey.highestPrice}€</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <p className="text-sm text-muted-foreground mr-2">
                          Variation sur 30 jours:
                        </p>
                        <div className="flex items-center">
                          {journey.trend === "up" ? (
                            <TrendingUp className="mr-1 h-4 w-4 text-red-500" />
                          ) : journey.trend === "down" ? (
                            <TrendingDown className="mr-1 h-4 w-4 text-emerald-500" />
                          ) : (
                            <CalendarDays className="mr-1 h-4 w-4 text-gray-500" />
                          )}
                          <span
                            className={
                              journey.trend === "up"
                                ? "text-red-500"
                                : journey.trend === "down"
                                ? "text-emerald-500"
                                : "text-gray-500"
                            }
                          >
                            {journey.trend === "up" ? "+" : ""}
                            {journey.priceChangePercentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" asChild className="w-full">
                      <Link to={`/journey/${journey.id}`}>
                        Voir les Détails
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="factors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Facteurs Influençant les Prix</CardTitle>
                <CardDescription>
                  Analyse des principaux éléments déterminant les tarifs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {priceFactors.map((factor, index) => (
                    <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-lg">{factor.name}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          factor.impact === 'High' 
                            ? 'bg-red-100 text-red-800' 
                            : factor.impact === 'Medium' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {factor.impact === 'High' 
                            ? 'Impact Fort' 
                            : factor.impact === 'Medium' 
                            ? 'Impact Moyen' 
                            : 'Impact Faible'}
                        </span>
                      </div>
                      <p className="text-gray-600">{factor.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
