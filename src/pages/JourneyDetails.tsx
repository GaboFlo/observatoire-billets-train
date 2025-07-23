
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import PriceChart from "@/components/PriceChart";
import PriceTable from "@/components/PriceTable";
import StatCard from "@/components/StatCard";
import { ArrowLeft, Calendar, ChartBar, ChartLine, TrendingDown, TrendingUp, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

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

const JourneyDetails = () => {
  const { journeyId } = useParams<{ journeyId: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  const [pricingData, setPricingData] = useState<AggregatedPricingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedDiscount, setSelectedDiscount] = useState<string>("all");

  // Fetch pricing data from API
  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/trains/pricing');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des données');
        }
        const data = await response.json();
        setPricingData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchPricingData();
  }, []);

  // Parse journey ID (format: "origin-destination")
  const [origin, destination] = (journeyId || '').split('-');
  
  // Filter data for this specific journey
  const journeyData = pricingData.filter(item => 
    item.departureStation.toLowerCase().includes(origin?.toLowerCase() || '') &&
    item.arrivalStation.toLowerCase().includes(destination?.toLowerCase() || '')
  );

  // Apply additional filters
  const filteredData = journeyData.filter(item => {
    if (selectedCarrier !== "all" && item.carrier !== selectedCarrier) return false;
    if (selectedClass !== "all" && item.travelClass !== selectedClass) return false;
    if (selectedDiscount !== "all" && item.discountCard !== selectedDiscount) return false;
    return true;
  });

  // Get unique values for filters
  const carriers = [...new Set(journeyData.map(item => item.carrier))];
  const classes = [...new Set(journeyData.map(item => item.travelClass))];
  const discounts = [...new Set(journeyData.map(item => item.discountCard))];

  // Calculate statistics
  const avgPrice = filteredData.length > 0 ? 
    filteredData.reduce((sum, item) => sum + item.avgPrice, 0) / filteredData.length : 0;
  const minPrice = filteredData.length > 0 ? 
    Math.min(...filteredData.map(item => item.minPrice)) : 0;
  const maxPrice = filteredData.length > 0 ? 
    Math.max(...filteredData.map(item => item.maxPrice)) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container px-4 py-16 mx-auto text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container px-4 py-16 mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Erreur de chargement
          </h1>
          <p className="text-gray-500 mb-8">{error}</p>
          <Button asChild>
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (journeyData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container px-4 py-16 mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Trajet non trouvé
          </h1>
          <p className="text-gray-500 mb-8">
            Aucune donnée disponible pour ce trajet.
          </p>
          <Button asChild>
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
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
              {origin} → {destination}
            </h1>
            <p className="text-gray-500">
              {filteredData.length} résultat(s) trouvé(s)
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Transporteur</label>
            <Select value={selectedCarrier} onValueChange={setSelectedCarrier}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les transporteurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les transporteurs</SelectItem>
                {carriers.map(carrier => (
                  <SelectItem key={carrier} value={carrier}>{carrier}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Classe</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les classes</SelectItem>
                {classes.map(travelClass => (
                  <SelectItem key={travelClass} value={travelClass}>{travelClass}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Carte de réduction</label>
            <Select value={selectedDiscount} onValueChange={setSelectedDiscount}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les cartes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les cartes</SelectItem>
                {discounts.map(discount => (
                  <SelectItem key={discount} value={discount}>{discount}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="details">Détails par offre</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Prix Moyen"
                value={`${avgPrice.toFixed(2)}€`}
                description="Moyenne des prix sélectionnés"
                icon={<ChartLine className="h-4 w-4" />}
              />
              <StatCard
                title="Prix Minimum"
                value={`${minPrice}€`}
                description="Le tarif le plus bas"
                icon={<TrendingDown className="h-4 w-4" />}
              />
              <StatCard
                title="Prix Maximum"
                value={`${maxPrice}€`}
                description="Le tarif le plus élevé"
                icon={<TrendingUp className="h-4 w-4" />}
              />
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4">
              {filteredData.map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{item.trainName}</CardTitle>
                        <CardDescription>{item.carrier} • {item.travelClass} • {item.discountCard}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{item.avgPrice}€</div>
                        <div className="text-sm text-muted-foreground">Prix moyen</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Min:</span>
                        <span className="ml-2 font-medium">{item.minPrice}€</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Moy:</span>
                        <span className="ml-2 font-medium">{item.avgPrice}€</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max:</span>
                        <span className="ml-2 font-medium">{item.maxPrice}€</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default JourneyDetails;
