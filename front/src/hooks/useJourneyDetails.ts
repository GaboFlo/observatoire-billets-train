import { DetailedPricingResult, GroupedJourney } from "@/types/journey";
import { useEffect, useState } from "react";

export const useJourneyDetails = (
  departureStation: string,
  arrivalStation: string
) => {
  const [journey, setJourney] = useState<GroupedJourney | null>(null);
  const [detailedOffers, setDetailedOffers] = useState<DetailedPricingResult[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJourneyDetails = async () => {
      try {
        setLoading(true);

        console.log("Appel à l'API details pour les détails");
        const response = await fetch(
          `http://localhost:3000/api/trains/details/${encodeURIComponent(
            departureStation
          )}/${encodeURIComponent(arrivalStation)}`
        );
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des données");
        }
        const data: DetailedPricingResult[] = await response.json();

        if (data.length === 0) {
          setError("Trajet non trouvé");
          return;
        }

        // Créer un objet GroupedJourney à partir des données détaillées
        const firstOffer = data[0];
        const carriers = [...new Set(data.map((offer) => offer.carrier))];
        const classes = [...new Set(data.map((offer) => offer.travelClass))];
        const discountCards = [
          ...new Set(data.map((offer) => offer.discountCard)),
        ];

        const allPrices = data.map((offer) => offer.minPrice);
        const minPrice = Math.min(...allPrices);
        const maxPrice = Math.max(...allPrices);
        const avgPrice = Math.round(
          allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length
        );

        const journeyData: GroupedJourney = {
          id: `${firstOffer.departureStationId}-${firstOffer.arrivalStationId}`,
          name: `${firstOffer.departureStation} → ${firstOffer.arrivalStation}`,
          departureStation: firstOffer.departureStation,
          departureStationId: firstOffer.departureStationId,
          arrivalStation: firstOffer.arrivalStation,
          arrivalStationId: firstOffer.arrivalStationId,
          carriers,
          classes,
          discountCards,
          offers: data as any[], // Conversion temporaire pour compatibilité
          minPrice,
          maxPrice,
          avgPrice,
        };

        setJourney(journeyData);
        setDetailedOffers(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setLoading(false);
      }
    };

    if (departureStation && arrivalStation) {
      fetchJourneyDetails();
    }
  }, [departureStation, arrivalStation]);

  return { journey, detailedOffers, loading, error };
};
