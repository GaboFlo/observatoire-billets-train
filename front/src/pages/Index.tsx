import ErrorDisplay from "../components/ErrorDisplay";
import JourneysTab from "../components/JourneysTab";
import LoadingAnimation from "../components/LoadingAnimation";
import PageHeader from "../components/PageHeader";
import { useJourneyData } from "../hooks/useJourneyData";

const Index = () => {
  const {
    journeys,
    loading,
    error,
    analysisDates,
    selectedDate,
    handleDateSelect,
  } = useJourneyData();

  if (loading) {
    return <LoadingAnimation />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        <PageHeader />

        <div className="space-y-6">
          <JourneysTab
            journeys={journeys}
            analysisDates={analysisDates}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
