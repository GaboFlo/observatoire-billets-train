
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { CalendarDays, TrendingDown, TrendingUp, Train } from "lucide-react";

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

interface GroupedJourney {
  id: string;
  name: string;
  departureStation: string;
  arrivalStation: string;
  carriers: string[];
  classes: string[];
  discountCards: string[];
  offers: AggregatedPricingResult[];
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("journeys");
  const [journeys, setJourneys] = useState<GroupedJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/trains/pricing');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des données');
        }
        const data: AggregatedPricingResult[] = await response.json();
        
        // Grouper les données par trajet (departure + arrival)
        const journeyMap = new Map<string, AggregatedPricingResult[]>();
        
        data.forEach((item) => {
          const key = `${item.departureStation}-${item.arrivalStation}`;
          if (!journeyMap.has(key)) {
            journeyMap.set(key, []);
          }
          journeyMap.get(key)!.push(item);
        });

        // Créer les objets GroupedJourney
        const groupedJourneys: GroupedJourney[] = Array.from(journeyMap.entries()).map(([key, offers]) => {
          const [departure, arrival] = key.split('-');
          const carriers = [...new Set(offers.map(o => o.carrier))];
          const classes = [...new Set(offers.map(o => o.travelClass))];
          const discountCards = [...new Set(offers.map(o => o.discountCard))];
          
          const allPrices = [
            ...offers.map(o => o.minPrice),
            ...offers.map(o => o.avgPrice),
            ...offers.map(o => o.maxPrice),
          ];
          
          const minPrice = Math.min(...allPrices);
          const maxPrice = Math.max(...allPrices);
          const avgPrice = allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;

          return {
            id: key,
            name: `${departure} - ${arrival}`,
            departureStation: departure,
            arrivalStation: arrival,
            carriers,
            classes,
            discountCards,
            offers,
            minPrice,
            maxPrice,
            avgPrice: Math.round(avgPrice),
          };
        });

        setJourneys(groupedJourneys);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchPricingData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container px-4 py-8 mx-auto">
          <div className="text-center">
            <p>Chargement des données...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container px-4 py-8 mx-auto">
          <div className="text-center text-red-500">
            <p>Erreur: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container px-4 py-8 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tendances des Prix de Billets de Train
          </h1>
          <p className="text-gray-500">
            Analyse des prix en fonction du nombre de jours avant le départ
          </p>
        </div>

        <Tabs defaultValue="journeys" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="journeys">Trajets</TabsTrigger>
            <TabsTrigger value="analysis">Analyse par Jour de Départ</TabsTrigger>
          </TabsList>
          
          <TabsContent value="journeys" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {journeys.map((journey) => (
                <Card key={journey.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Train className="h-5 w-5" />
                      {journey.name}
                    </CardTitle>
                    <CardDescription>{journey.departureStation} → {journey.arrivalStation}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <div>
                          <p className="text-muted-foreground">Prix Min</p>
                          <p className="font-medium text-lg">{journey.minPrice}€</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Prix Moyen</p>
                          <p className="font-medium text-lg">{journey.avgPrice}€</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Prix Max</p>
                          <p className="font-medium text-lg">{journey.maxPrice}€</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Compagnies:</p>
                          <div className="flex flex-wrap gap-1">
                            {journey.carriers.map((carrier) => (
                              <Badge key={carrier} variant="secondary" className="text-xs">
                                {carrier}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Classes:</p>
                          <div className="flex flex-wrap gap-1">
                            {journey.classes.map((travelClass) => (
                              <Badge key={travelClass} variant="outline" className="text-xs">
                                {travelClass}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Cartes de réduction:</p>
                          <div className="flex flex-wrap gap-1">
                            {journey.discountCards.slice(0, 3).map((card) => (
                              <Badge key={card} variant="default" className="text-xs">
                                {card}
                              </Badge>
                            ))}
                            {journey.discountCards.length > 3 && (
                              <Badge variant="default" className="text-xs">
                                +{journey.discountCards.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {journey.offers.length} offre{journey.offers.length > 1 ? 's' : ''} disponible{journey.offers.length > 1 ? 's' : ''}
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
                  Sélectionnez un trajet pour voir l'évolution des prix selon J-X
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
                            {journey.departureStation} → {journey.arrivalStation}
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
