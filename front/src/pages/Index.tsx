import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { journeys } from "@/data/mockData";
import { CalendarDays, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Index = () => {
  const [activeTab, setActiveTab] = useState("journeys");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tendances des Prix de Billets de Train
          </h1>
          <p className="text-gray-500">
            Analyse des prix en fonction du nombre de jours avant le départ
          </p>
        </div>

        <Tabs
          defaultValue="journeys"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="journeys">Trajets</TabsTrigger>
            <TabsTrigger value="analysis">
              Analyse par Jour de Départ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="journeys" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {journeys.map((journey) => (
                <Card key={journey.id}>
                  <CardHeader>
                    <CardTitle>{journey.name}</CardTitle>
                    <CardDescription>
                      {journey.origin} → {journey.destination}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <div>
                          <p className="text-muted-foreground">Prix Min</p>
                          <p className="font-medium text-lg">
                            {journey.lowestPrice}€
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Prix Moyen</p>
                          <p className="font-medium text-lg">
                            {journey.averagePrice}€
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Prix Max</p>
                          <p className="font-medium text-lg">
                            {journey.highestPrice}€
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <p className="text-sm text-muted-foreground mr-2">
                          Variation récente:
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
                        Analyser par J-X
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analyse des Prix par Jour de Départ</CardTitle>
                <CardDescription>
                  Prix moyen en fonction du nombre de jours avant le départ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Sélectionnez un trajet pour voir l'évolution des prix selon
                  J-X
                </p>
                <div className="space-y-4">
                  {journeys.map((journey) => (
                    <Button
                      key={journey.id}
                      variant="outline"
                      asChild
                      className="w-full justify-start"
                    >
                      <Link to={`/journey/${journey.id}`}>
                        <div className="text-left">
                          <p className="font-medium">{journey.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {journey.origin} → {journey.destination}
                          </p>
                        </div>
                      </Link>
                    </Button>
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
