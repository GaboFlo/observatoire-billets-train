import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalysisTab from "@/components/AnalysisTab";
import ErrorDisplay from "@/components/ErrorDisplay";
import JourneysTab from "@/components/JourneysTab";
import LoadingAnimation from "@/components/LoadingAnimation";
import PageHeader from "@/components/PageHeader";
import TranslationStats from "@/components/TranslationStats";
import TrainMap from "@/components/TrainMap";
import { useJourneyData } from "@/hooks/useJourneyData";

const isDevelopment = process.env.NODE_ENV === 'development';

const Index = () => {
  const {
    activeTab,
    setActiveTab,
    journeys,
    loading,
    error,
    journeyFilters,
    handleClassFilter,
    handleSelectedClasses,
    handleExcludedClasses,
    handleCarrierFilter,
    handleSelectedCarriers,
    handleExcludedCarriers,
    handleDiscountCardFilter,
    handleSelectedDiscountCards,
    handleExcludedDiscountCards,
  } = useJourneyData();

  if (loading) {
    return <LoadingAnimation />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto">
        <PageHeader />

        <Tabs
          defaultValue="journeys"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="journeys">Trajets</TabsTrigger>
            <TabsTrigger value="map">Carte</TabsTrigger>
            <TabsTrigger value="analysis">Analyses détaillées</TabsTrigger>
            {isDevelopment && (
              <TabsTrigger value="translations">Traductions</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="journeys" className="space-y-4">
            <JourneysTab
              journeys={journeys}
              journeyFilters={journeyFilters}
              onClassFilter={(journeyId, travelClass) => handleClassFilter(journeyId, travelClass)}
              onSelectedClasses={(journeyId, travelClass) => handleSelectedClasses(journeyId, travelClass)}
              onExcludedClasses={(journeyId, travelClass) => handleExcludedClasses(journeyId, travelClass)}
              onCarrierFilter={(journeyId, carrier) => handleCarrierFilter(journeyId, carrier)}
              onSelectedCarriers={(journeyId, carrier) => handleSelectedCarriers(journeyId, carrier)}
              onExcludedCarriers={(journeyId, carrier) => handleExcludedCarriers(journeyId, carrier)}
              onDiscountCardFilter={(journeyId, discountCard) => handleDiscountCardFilter(journeyId, discountCard)}
              onSelectedDiscountCards={(journeyId, discountCard) => handleSelectedDiscountCards(journeyId, discountCard)}
              onExcludedDiscountCards={(journeyId, discountCard) => handleExcludedDiscountCards(journeyId, discountCard)}
            />
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <TrainMap journeys={journeys} />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <AnalysisTab journeys={journeys} />
          </TabsContent>

          {isDevelopment && (
            <TabsContent value="translations" className="space-y-4">
              <TranslationStats journeys={journeys} showMissing={true} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
