import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import { getRouteData, RouteData } from "../services/routeService";
import { AggregatedPricingResult, GroupedJourney } from "../types/journey";

interface TrainMapProps {
  journeys: GroupedJourney[];
  onRouteSelect?: (selectedJourneyIds: string[]) => void;
}

interface GeoJSONFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[][][] | number[][];
  };
  properties: Record<string, unknown>;
}

interface RouteLine {
  id: string;
  journeyId: string;
  name: string;
  coordinates: [number, number][];
  color: string;
  price: number;
  avgPrice: number;
  departureStationId: number;
  departureStation: string;
  arrivalStationId: number;
  arrivalStation: string;
  properties?: Record<string, unknown>;
}

// Icônes personnalisées pour les marqueurs
const createCustomIcon = (color: string) =>
  new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="${color}" stroke="white" stroke-width="2"/>
    </svg>
  `)}`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });

const TrainMap: React.FC<TrainMapProps> = ({ journeys, onRouteSelect }) => {
  const [routeData, setRouteData] = useState<{ [key: string]: RouteData }>({});
  const [selectedRouteKey, setSelectedRouteKey] = useState<string | null>(null);

  // Utiliser directement les journeys passées en props (déjà filtrées)
  const filteredJourneys = journeys;

  useEffect(() => {
    const loadRoutes = async () => {
      // Créer un Set des routes uniques à charger (éviter les doublons aller/retour)
      const routesToLoad = new Set<string>();

      filteredJourneys.forEach((journey) => {
        const key = `${journey.departureStationId}-${journey.arrivalStationId}`;
        const reverseKey = `${journey.arrivalStationId}-${journey.departureStationId}`;

        // Si ni la route directe ni la route inverse ne sont chargées, ajouter la route directe
        if (!routeData[key] && !routeData[reverseKey]) {
          routesToLoad.add(key);
        }
      });

      const promises = Array.from(routesToLoad).map(async (routeKey) => {
        const [depId, arrId] = routeKey.split("-").map(Number);

        try {
          const data = await getRouteData(depId, arrId);
          setRouteData((prev) => ({ ...prev, [routeKey]: data }));
        } catch (error) {
          console.error(
            `Erreur lors de la récupération de la route ${routeKey}:`,
            error
          );
        }
      });

      await Promise.all(promises);
    };

    loadRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredJourneys]);

  // Calcul sécurisé des prix min/max
  const priceStats = useMemo(() => {
    const validJourneys = filteredJourneys.filter(
      (j) => typeof j.avgPrice === "number" && !isNaN(j.avgPrice)
    );

    if (validJourneys.length === 0) {
      return { minPrice: 0, maxPrice: 0 };
    }

    const prices = validJourneys.map((j: GroupedJourney) => j.avgPrice);
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  }, [filteredJourneys]); // Dépendance simplifiée

  const getColor = React.useCallback(
    (price: number) => {
      if (priceStats.maxPrice === priceStats.minPrice) {
        return "rgb(100, 100, 100)"; // Gris si tous les prix sont identiques
      }

      const normalizedPrice =
        (price - priceStats.minPrice) /
        (priceStats.maxPrice - priceStats.minPrice);
      const red = Math.round(255 * normalizedPrice);
      const blue = Math.round(255 * (1 - normalizedPrice));
      return `rgb(${red}, 100, ${blue})`;
    },
    [priceStats.maxPrice, priceStats.minPrice]
  );

  const routeLines = useMemo(() => {
    const lines: RouteLine[] = [];

    filteredJourneys.forEach((journey) => {
      const key = `${journey.departureStationId}-${journey.arrivalStationId}`;
      const reverseKey = `${journey.arrivalStationId}-${journey.departureStationId}`;

      // Chercher la route dans les deux sens
      let route = routeData[key];
      let isReversed = false;

      if (!route && routeData[reverseKey]) {
        route = routeData[reverseKey];
        isReversed = true;
      }

      if (route) {
        let features: GeoJSONFeature[] = [];

        if (route.type === "FeatureCollection" && route.features) {
          features = route.features;
        } else if (route.type === "Feature") {
          features = [route as GeoJSONFeature];
        }

        features.forEach((feature, featureIndex) => {
          if (feature?.geometry?.coordinates) {
            let coordinates: [number, number][] = [];

            // Gérer différents types de géométrie
            if (feature.geometry.type === "LineString") {
              coordinates = (feature.geometry.coordinates as number[][]).map(
                (coord: number[]) => [coord[1], coord[0]]
              );
            } else if (feature.geometry.type === "Polygon") {
              coordinates =
                (feature.geometry.coordinates as number[][][])[0]?.map(
                  (coord: number[]) => [coord[1], coord[0]]
                ) || [];
            } else if (feature.geometry.type === "MultiLineString") {
              coordinates =
                (feature.geometry.coordinates as number[][][])[0]?.map(
                  (coord: number[]) => [coord[1], coord[0]]
                ) || [];
            }

            // Inverser les coordonnées si c'est un trajet retour
            if (isReversed) {
              coordinates = coordinates.reverse();
            }

            if (coordinates.length > 0) {
              lines.push({
                id: `${journey.id}-${featureIndex}`,
                journeyId: journey.id,
                name: journey.name,
                coordinates,
                color: getColor(journey.avgPrice),
                price: journey.avgPrice,
                avgPrice: journey.avgPrice,
                departureStationId: journey.departureStationId,
                departureStation: journey.departureStation,
                arrivalStationId: journey.arrivalStationId,
                arrivalStation: journey.arrivalStation,
                properties: feature.properties,
              });
            }
          }
        });
      }
    });

    return lines;
  }, [filteredJourneys, getColor, routeData]);

  const handleRouteClick = (routeKey: string, journeyIds: string[]) => {
    if (selectedRouteKey === routeKey) {
      // Désélectionner si déjà sélectionné
      setSelectedRouteKey(null);
      onRouteSelect?.([]);
    } else {
      // Sélectionner la nouvelle route
      setSelectedRouteKey(routeKey);
      onRouteSelect?.(journeyIds);
    }
  };

  // Calculer le centre de la carte basé sur les routes disponibles
  const mapCenter = useMemo(() => {
    // Centre entre Londres et Barcelone pour couvrir toute l'Europe de l'Ouest
    return [47.0, 2.0]; // Centre approximatif entre Londres (51.5, -0.1) et Barcelone (41.4, 2.2)
  }, []); // Dépendances vides pour éviter les recalcules

  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <div className="relative h-full w-full">
        <MapContainer
          center={mapCenter as [number, number]}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {routeLines.map((line: RouteLine) => {
            const routeKey = `${line.departureStationId}-${line.arrivalStationId}`;
            const isSelected = selectedRouteKey === routeKey;
            const journeyIds = filteredJourneys
              .filter(
                (j: GroupedJourney) =>
                  (j.departureStationId === line.departureStationId &&
                    j.arrivalStationId === line.arrivalStationId) ||
                  (j.departureStationId === line.arrivalStationId &&
                    j.arrivalStationId === line.departureStationId)
              )
              .map((j: GroupedJourney) => j.id);

            return (
              <React.Fragment key={line.id}>
                <Polyline
                  positions={line.coordinates}
                  color={isSelected ? "#ff6b35" : line.color}
                  weight={isSelected ? 5 : 3}
                  opacity={isSelected ? 1 : 0.8}
                  eventHandlers={{
                    click: () => handleRouteClick(routeKey, journeyIds),
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <Popup>
                    <div className="p-2">
                      {/* Statistiques par sens */}
                      {(() => {
                        // Fonction pour calculer les prix filtrés (même logique que JourneysTab)
                        const calculateFilteredPrices = (
                          journey: GroupedJourney
                        ) => {
                          if (journey.offers.length === 0) {
                            return { minPrice: 0, avgPrice: 0, maxPrice: 0 };
                          }

                          const allPrices = [
                            ...journey.offers.map(
                              (o: AggregatedPricingResult) => o.minPrice
                            ),
                            ...journey.offers.map(
                              (o: AggregatedPricingResult) => o.avgPrice
                            ),
                            ...journey.offers.map(
                              (o: AggregatedPricingResult) => o.maxPrice
                            ),
                          ];

                          const minPrice = Math.min(...allPrices);
                          const maxPrice = Math.max(...allPrices);
                          const avgPrice =
                            allPrices.reduce((sum, price) => sum + price, 0) /
                            allPrices.length;

                          return {
                            minPrice,
                            maxPrice,
                            avgPrice: Math.round(avgPrice),
                          };
                        };

                        // Trouver les journeys correspondant à chaque sens
                        const forwardJourneys = filteredJourneys.filter(
                          (j) =>
                            j.departureStationId === line.departureStationId &&
                            j.arrivalStationId === line.arrivalStationId
                        );
                        const reverseJourneys = filteredJourneys.filter(
                          (j) =>
                            j.departureStationId === line.arrivalStationId &&
                            j.arrivalStationId === line.departureStationId
                        );

                        return (
                          <>
                            {forwardJourneys.length > 0 && (
                              <div className="mb-3">
                                <div className="text-xs text-gray-600 mb-1">
                                  {line.departureStation} →{" "}
                                  {line.arrivalStation}
                                </div>
                                {(() => {
                                  const prices = calculateFilteredPrices(
                                    forwardJourneys[0]
                                  );
                                  return (
                                    <>
                                      <div className="text-sm font-semibold text-blue-600">
                                        Prix moyen : {prices.avgPrice}€
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Prix min : {prices.minPrice}€ | Prix max
                                        : {prices.maxPrice}€
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            )}

                            {reverseJourneys.length > 0 && (
                              <div>
                                <div className="text-xs text-gray-600 mb-1">
                                  {line.arrivalStation} →{" "}
                                  {line.departureStation}
                                </div>
                                {(() => {
                                  const prices = calculateFilteredPrices(
                                    reverseJourneys[0]
                                  );
                                  return (
                                    <>
                                      <div className="text-sm font-semibold text-blue-600">
                                        Prix moyen : {prices.avgPrice}€
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Prix min : {prices.minPrice}€ | Prix max
                                        : {prices.maxPrice}€
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                          </>
                        );
                      })()}

                      {line.properties &&
                        typeof line.properties === "object" && (
                          <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                            {"name" in line.properties &&
                              typeof (line.properties as { name?: unknown })
                                .name === "string" && (
                                <div>
                                  Route:{" "}
                                  {(line.properties as { name: string }).name}
                                </div>
                              )}
                            {"distance" in line.properties &&
                              typeof (line.properties as { distance?: unknown })
                                .distance === "number" && (
                                <div>
                                  Distance:{" "}
                                  {Math.round(
                                    (line.properties as { distance: number })
                                      .distance
                                  )}
                                  km
                                </div>
                              )}
                          </div>
                        )}
                    </div>
                  </Popup>
                </Polyline>

                {/* Marqueurs sur les gares (début et fin) */}
                {line.coordinates.length > 0 && (
                  <Marker
                    position={line.coordinates[0]}
                    icon={createCustomIcon("#6b7280")}
                  >
                    <Popup>
                      <div className="p-2">
                        <div className="text-xs text-gray-600">
                          {line.departureStation}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {line.coordinates.length > 1 && (
                  <Marker
                    position={line.coordinates[line.coordinates.length - 1]}
                    icon={createCustomIcon("#6b7280")}
                  >
                    <Popup>
                      <div className="p-2">
                        <div className="text-xs text-gray-600">
                          {line.arrivalStation}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default TrainMap;
