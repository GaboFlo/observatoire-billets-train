import { useMemo } from "react";
import { useJourneyData } from "../hooks/useJourneyData";

const PageHeader = () => {
  const { journeys } = useJourneyData();

  const stats = useMemo(() => {
    if (!journeys || journeys.length === 0) {
      return {
        totalJourneys: 0,
      };
    }

    return {
      totalJourneys: journeys.length,
    };
  }, [journeys]);

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-6">
          <img src="/logo.png" alt="Logo TGV" className="w-16 h-16" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Observatoire des billets de train
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6">
          Analyse des prix des billets de train grandes distances sur certaines
          dates et lignes
        </p>
      </div>
    </div>
  );
};

export default PageHeader;
