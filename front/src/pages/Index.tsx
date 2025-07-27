import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalysisTab from "@/components/AnalysisTab";
import ErrorDisplay from "@/components/ErrorDisplay";
import JourneysTab from "@/components/JourneysTab";
import LoadingAnimation from "@/components/LoadingAnimation";
import PageHeader from "@/components/PageHeader";
import TranslationStats from "@/components/TranslationStats";
import { useJourneyData } from "@/hooks/useJourneyData";

const isDevelopment = process.env.NODE_ENV === 'development';

const Index = () => {
  const {
    activeTab,
    setActiveTab,
    journeys,
    loading,
    error,
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
            {isDevelopment && (
              <TabsTrigger value="translations">Traductions</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="journeys" className="space-y-4">
            <JourneysTab journeys={journeys} />
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
