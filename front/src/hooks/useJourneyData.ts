import { useEffect, useState } from "react";
import { AggregatedPricingResult, GroupedJourney } from "@/types/journey";
import { getCachedData, setCachedData } from "./usePricingCache";
import { useJourneyFilters } from "./useJourneyFilters";
import { 
  processPricingData, 
  createDefaultFilters, 
  analyzeMissingTranslations 
} from "@/utils/journeyDataProcessor";

export const useJourneyData = () => {
  const [activeTab, setActiveTab] = useState("journeys");
  const [journeys, setJourneys] = useState<GroupedJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const {
    journeyFilters,
    setJourneyFilters,
    handleClassFilter,
    handleSelectedClasses,
    handleExcludedClasses,
    handleCarrierFilter,
    handleSelectedCarriers,
    handleExcludedCarriers,
    handleDiscountCardFilter,
    handleSelectedDiscountCards,
    handleExcludedDiscountCards,
  } = useJourneyFilters();

  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        setLoading(true);
        
        // Vérifier le cache en premier
        const cachedData = getCachedData();
        if (cachedData) {
          console.log("Utilisation des données en cache");
          processData(cachedData);
          return;
        }

        console.log("Appel à l'API pricing");
        const response = await fetch("http://localhost:3000/api/trains/pricing");
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des données");
        }
        const data: AggregatedPricingResult[] = await response.json();
        
        // Mettre en cache les nouvelles données
        setCachedData(data);
        
        processData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    const processData = (data: AggregatedPricingResult[]) => {
      const groupedJourneys = processPricingData(data);
      setJourneys(groupedJourneys);
      
      const defaultFilters = createDefaultFilters(groupedJourneys);
      setJourneyFilters(defaultFilters);
      
      analyzeMissingTranslations(groupedJourneys);
    };

    fetchPricingData();
  }, [setJourneyFilters]);

  return {
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
  };
}; 