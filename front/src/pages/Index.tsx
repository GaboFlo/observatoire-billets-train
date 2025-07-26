import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalysisTab from "@/components/AnalysisTab";
import ErrorDisplay from "@/components/ErrorDisplay";
import JourneysTab from "@/components/JourneysTab";
import LoadingAnimation from "@/components/LoadingAnimation";
import PageHeader from "@/components/PageHeader";
import { useJourneyData } from "@/hooks/useJourneyData";

const Index = () => {
  const {
    activeTab,
    setActiveTab,
    journeys,
    loading,
    error,
    journeyFilters,
    handleClassFilter,
    handleCarrierFilter,
    handleDiscountCardFilter,
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
            <TabsTrigger value="analysis">Analyses détaillées</TabsTrigger>
          </TabsList>

          <TabsContent value="journeys" className="space-y-4">
            <JourneysTab
              journeys={journeys}
              journeyFilters={journeyFilters}
              onClassFilter={handleClassFilter}
              onCarrierFilter={handleCarrierFilter}
              onDiscountCardFilter={handleDiscountCardFilter}
            />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <AnalysisTab journeys={journeys} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
