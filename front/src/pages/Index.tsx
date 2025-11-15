import { useEffect } from "react";
import ErrorDisplay from "../components/ErrorDisplay";
import Footer from "../components/Footer";
import JourneysTab from "../components/JourneysTab";
import LoadingAnimation from "../components/LoadingAnimation";
import PageHeader from "../components/PageHeader";
import { DEFAULT_FILTERS } from "../hooks/useGlobalFilters";
import { useJourneyData } from "../hooks/useJourneyData";
import { useSEO } from "../hooks/useSEO";

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

  useSEO({
    title: "Observatoire des billets de train",
    description:
      "Analysez et visualisez les prix des billets de train grandes distances. Comparez les tarifs SNCF, TGV, OUIGO, Trenitalia et Eurostar sur différentes routes à origine ou destination de Paris. Statistiques détaillées, graphiques d'évolution des prix et filtres avancés.",
    keywords:
      "billets train, prix SNCF, tarifs TGV, observatoire prix train, comparaison prix train, billets OUIGO, Trenitalia,  Eurostar, statistiques prix train, analyse tarifs ferroviaires",
    ogTitle: "Observatoire des billets de train",
    ogDescription:
      "Analysez et visualisez les prix des billets de train grandes distances. Comparez les tarifs SNCF, TGV, OUIGO, Trenitalia et Eurostar sur différentes routes avec statistiques détaillées et graphiques d'évolution.",
    ogUrl: typeof window !== "undefined" ? window.location.href : "",
    canonicalUrl: typeof window !== "undefined" ? window.location.origin : "",
  });

  useEffect(() => {
    if (allJourneys.length === 0 && journeys.length === 0) {
      fetchJourneys({
        ...DEFAULT_FILTERS,
        flexibilities: [],
        selectedDates: [],
      });
    }
  }, [fetchJourneys, allJourneys.length, journeys.length]);

  if (loading && journeys.length === 0 && allJourneys.length === 0) {
    return <LoadingAnimation />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Barre de chargement discrète pour tous les chargements */}
      {(loading || filterLoading) && (
        <LoadingAnimation isFilterLoading={true} />
      )}

      <div className="w-full pt-6 pb-4">
        <div className="max-w-7xl mx-auto px-4">
          <PageHeader />
        </div>
      </div>

      <div className="w-full px-4 pb-8">
        <JourneysTab
          journeys={journeys}
          allJourneys={allJourneys}
          analysisDates={analysisDates}
          selectedDates={selectedDates}
          onDateSelect={handleDateSelect}
          applyFilters={applyFilters}
          currentFilters={currentFilters}
          filterLoading={filterLoading}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
