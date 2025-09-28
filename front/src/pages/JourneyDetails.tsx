import {
  ArrowLeft,
  Calendar,
  ChartBar,
  ChartLine,
  Train,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import GlobalFiltersReusableWithDates from "../components/GlobalFiltersReusableWithDates";
import JourneyKPIs from "../components/JourneyKPIs";
import LoadingAnimation from "../components/LoadingAnimation";
import PriceEvolutionChart from "../components/PriceEvolutionChart";
import StatCard from "../components/StatCard";
import TrainDetailsTable from "../components/TrainDetailsTable";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useJourneyDetails } from "../hooks/useJourneyDetails";
import { useJourneyDetailsFilters } from "../hooks/useJourneyDetailsFilters";

const JourneyDetails = () => {
  const {
    departureStation,
    arrivalStation,
    departureStationId,
    arrivalStationId,
  } = useParams<{
    departureStation: string;
    arrivalStation: string;
    departureStationId: string;
    arrivalStationId: string;
  }>();
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  const {
    journey,
    detailedOffers,
    loading,
    filterLoading,
    error,
    analysisDates,
    applyFilters,
    currentFilters,
  } = useJourneyDetails(
    departureStation || "",
    arrivalStation || "",
    selectedDates,
    departureStationId ? parseInt(departureStationId) : undefined,
    arrivalStationId ? parseInt(arrivalStationId) : undefined
  );

  const { filters, filteredOffers, handleTrainSelect, clearTrainFilter } =
    useJourneyDetailsFilters(detailedOffers);

  // Fonctions de gestion des filtres avec appels API
  const handleCarrierFilterAPI = (carrier: string) => {
    const newExcludedCarriers = currentFilters.excludedCarriers.includes(
      carrier
    )
      ? currentFilters.excludedCarriers.filter((c) => c !== carrier)
      : [...currentFilters.excludedCarriers, carrier];

    applyFilters({ excludedCarriers: newExcludedCarriers });
  };

  const handleClassFilterAPI = (travelClass: string) => {
    const newExcludedClasses = currentFilters.excludedClasses.includes(
      travelClass
    )
      ? currentFilters.excludedClasses.filter((c) => c !== travelClass)
      : [...currentFilters.excludedClasses, travelClass];

    applyFilters({ excludedClasses: newExcludedClasses });
  };

  const handleDiscountCardFilterAPI = (discountCard: string) => {
    const newExcludedDiscountCards =
      currentFilters.excludedDiscountCards.includes(discountCard)
        ? currentFilters.excludedDiscountCards.filter((c) => c !== discountCard)
        : [...currentFilters.excludedDiscountCards, discountCard];

    applyFilters({ excludedDiscountCards: newExcludedDiscountCards });
  };

  const handleDateSelectAPI = (dates: string[]) => {
    setSelectedDates(dates);
    applyFilters({ selectedDates: dates });
  };

  const clearAllFiltersAPI = () => {
    setSelectedDates([]);
    applyFilters({
      excludedCarriers: [],
      excludedClasses: [],
      excludedDiscountCards: [],
      selectedDates: [],
    });
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  // Afficher l'indicateur de chargement des filtres
  if (filterLoading) {
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
                {journey?.name || "Chargement..."}
              </h1>
            </div>
          </div>
          <LoadingAnimation isFilterLoading={true} />
        </div>
      </div>
    );
  }

  // Afficher un message si aucune date n'est sélectionnée
  if (
    selectedDates.length === 0 &&
    detailedOffers.length === 0 &&
    !loading &&
    !error
  ) {
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
                {departureStation} ⟷ {arrivalStation}
              </h1>
              <p className="text-gray-500">
                Sélectionnez une date pour voir les trains disponibles
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Filtres globaux */}
            <GlobalFiltersReusableWithDates
              offers={detailedOffers}
              filters={currentFilters}
              onCarrierFilter={handleCarrierFilterAPI}
              onClassFilter={handleClassFilterAPI}
              onDiscountCardFilter={handleDiscountCardFilterAPI}
              clearFilters={clearAllFiltersAPI}
              analysisDates={analysisDates}
              selectedDates={selectedDates}
              onDateSelect={handleDateSelectAPI}
            />

            {/* Message informatif */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    Sélectionnez une date
                  </h3>
                  <p className="text-blue-700">
                    Choisissez une date dans le calendrier ci-dessus pour voir
                    les trains disponibles
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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

        <div className="space-y-6">
          {/* Filtres globaux */}
          <GlobalFiltersReusableWithDates
            offers={detailedOffers}
            filters={currentFilters}
            onCarrierFilter={handleCarrierFilterAPI}
            onClassFilter={handleClassFilterAPI}
            onDiscountCardFilter={handleDiscountCardFilterAPI}
            clearFilters={clearAllFiltersAPI}
            analysisDates={analysisDates}
            selectedDates={selectedDates}
            onDateSelect={handleDateSelectAPI}
          />

          {/* Train sélectionné */}
          {(filters.selectedTrainName || filters.selectedDepartureDate) && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Train className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-sm text-blue-800">
                      <span className="font-semibold">Train sélectionné :</span>{" "}
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

          {/* KPIs et statistiques */}
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

          {/* KPIs détaillés */}
          <JourneyKPIs offers={filteredOffers} />

          {/* Graphique d'évolution des prix */}
          <PriceEvolutionChart offers={filteredOffers} />

          {/* Tableau des trains */}
          <TrainDetailsTable
            offers={filteredOffers}
            onTrainSelect={handleTrainSelect}
          />

          {/* Informations détaillées */}
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
                    <span className="text-muted-foreground">ID du trajet</span>
                    <span className="font-medium">{journey.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Nombre d'offres
                    </span>
                    <span className="font-medium">{journey.offers.length}</span>
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
                    <span className="text-muted-foreground">Prix minimum</span>
                    <span className="font-medium">{journey.minPrice}€</span>
                  </div>
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-muted-foreground">Prix moyen</span>
                    <span className="font-medium">{journey.avgPrice}€</span>
                  </div>
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-muted-foreground">Prix maximum</span>
                    <span className="font-medium">{journey.maxPrice}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Écart de prix</span>
                    <span className="font-medium">
                      {journey.maxPrice - journey.minPrice}€
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyDetails;
