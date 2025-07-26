import { useEffect, useState } from "react";
import { AggregatedPricingResult, GroupedJourney } from "@/types/journey";
import { getCachedData, setCachedData } from "./usePricingCache";
import { processJourneyDetails } from "@/utils/journeyDataProcessor";

export const useJourneyDetails = (journeyId: string) => {
  const [journey, setJourney] = useState<GroupedJourney | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJourneyDetails = async () => {
      try {
        setLoading(true);
        
        // Vérifier le cache en premier
        const cachedData = getCachedData();
        if (cachedData) {
          console.log("Utilisation des données en cache pour les détails");
          const journeyData = processJourneyDetails(cachedData, journeyId);
          if (journeyData) {
            setJourney(journeyData);
          } else {
            setError("Trajet non trouvé");
          }
          return;
        }

        console.log("Appel à l'API pricing pour les détails");
        const response = await fetch("http://localhost:3000/api/trains/pricing");
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des données");
        }
        const data: AggregatedPricingResult[] = await response.json();
        
        // Mettre en cache les nouvelles données
        setCachedData(data);
        
        const journeyData = processJourneyDetails(data, journeyId);
        if (journeyData) {
          setJourney(journeyData);
        } else {
          setError("Trajet non trouvé");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    if (journeyId) {
      fetchJourneyDetails();
    }
  }, [journeyId]);

  return { journey, loading, error };
}; 