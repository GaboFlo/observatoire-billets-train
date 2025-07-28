import ErrorDisplay from "../components/ErrorDisplay";
import JourneysTab from "../components/JourneysTab";
import LoadingAnimation from "../components/LoadingAnimation";
import PageHeader from "../components/PageHeader";
import { useJourneyData } from "../hooks/useJourneyData";

const Index = () => {
  const { journeys, loading, error } = useJourneyData();

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

        <div className="space-y-4">
          <JourneysTab journeys={journeys} />
        </div>
      </div>
    </div>
  );
};

export default Index;
