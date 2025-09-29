import { useEffect } from "react";
import ErrorDisplay from "../components/ErrorDisplay";
import JourneysTab from "../components/JourneysTab";
import LoadingAnimation from "../components/LoadingAnimation";
import PageHeader from "../components/PageHeader";
import { DEFAULT_FILTERS } from "../hooks/useGlobalFilters";
import { useJourneyData } from "../hooks/useJourneyData";

const Index = () => {
  const {
    journeys,
    allJourneys,
    loading,
    filterLoading,
    error,
    analysisDates,
    selectedDates,
    handleDateSelect,
    fetchJourneys,
    applyFilters,
    currentFilters,
  } = useJourneyData();

  // Charger les données initiales au démarrage
  useEffect(() => {
    fetchJourneys({
      ...DEFAULT_FILTERS,
      selectedDates: [], // Toutes les dates disponibles
    });
  }, [fetchJourneys]);

  if (loading && journeys.length === 0) {
    return <LoadingAnimation />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Barre de chargement discrète pour tous les chargements */}
      {(loading || filterLoading) && (
        <LoadingAnimation isFilterLoading={true} />
      )}

      <div className="container px-4 py-8 mx-auto max-w-7xl">
        <PageHeader />

        <div className="space-y-6">
          <JourneysTab
            journeys={journeys}
            allJourneys={allJourneys}
            analysisDates={analysisDates}
            selectedDates={selectedDates}
            onDateSelect={handleDateSelect}
            applyFilters={applyFilters}
            currentFilters={currentFilters}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
