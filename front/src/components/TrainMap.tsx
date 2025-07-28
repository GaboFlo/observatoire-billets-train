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
import { GroupedJourney } from "../types/journey";

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

interface RouteData {
  type: string;
  features?: GeoJSONFeature[];
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
  arrivalStationId: number;
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
  const [loading, setLoading] = useState(false);
  const [selectedRouteKey, setSelectedRouteKey] = useState<string | null>(null);

  // Utiliser directement les journeys passées en props (déjà filtrées)
  const filteredJourneys = journeys;

  useEffect(() => {
    const fetchRouteData = async (journey: GroupedJourney) => {
      const key = `${journey.departureStationId}-${journey.arrivalStationId}`;

      if (routeData[key]) return;

      try {
        const response = await fetch(
          `http://localhost:3000/api/trains/routes?dep=${journey.departureStationId}&arr=${journey.arrivalStationId}`
        );

        if (response.ok) {
          const data = await response.json();

          setRouteData((prev) => ({ ...prev, [key]: data }));
        } else {
          console.error(`Erreur HTTP ${response.status} pour la route ${key}`);
        }
      } catch (error) {
        console.error(
          `Erreur lors de la récupération de la route pour ${journey.name}:`,
          error
        );
      }
    };

    const loadRoutes = async () => {
      setLoading(true);
      const promises = filteredJourneys.map((journey: GroupedJourney) =>
        fetchRouteData(journey)
      );
      await Promise.all(promises);
      setLoading(false);
    };

    loadRoutes();
  }, [filteredJourneys, routeData]);

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
      const route = routeData[key];

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
                arrivalStationId: journey.arrivalStationId,
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
    <div className="w-full h-[446px] rounded-lg overflow-hidden border border-gray-200">
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Carte des trajets</h3>
        </div>
        {loading && (
          <div className="mt-2 text-sm text-gray-600">
            Chargement des routes...
          </div>
        )}
      </div>

      <div className="relative h-[350px]">
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
                      <div className="font-medium text-sm">{line.name}</div>
                      <div className="text-sm font-semibold text-blue-600">
                        Prix moyen: {Math.round(line.avgPrice)}€
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Prix min: {Math.round(priceStats.minPrice)}€ | Prix max:{" "}
                        {Math.round(priceStats.maxPrice)}€
                      </div>
                      {line.properties &&
                        typeof line.properties === "object" && (
                          <div className="text-xs text-gray-500">
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
                        <div className="font-medium text-sm">Gare</div>
                        <div className="text-xs text-gray-600">
                          {line.departureStationId}
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
                        <div className="font-medium text-sm">Gare</div>
                        <div className="text-xs text-gray-600">
                          {line.arrivalStationId}
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
