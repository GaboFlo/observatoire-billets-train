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
import { truncatePrice } from "../lib/utils";
import { getRouteData, RouteData } from "../services/routeService";
import { GroupedJourney } from "../types/journey";
import { translateStation } from "../utils/translations";

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

  // Utiliser directement les journeys passées en props (déjà filtrées par l'API)
  const filteredJourneys = journeys;

  useEffect(() => {
    const loadRoutes = async () => {
      // Créer un Set des routes uniques à charger (éviter les doublons aller/retour)
      const routesToLoad = new Set<string>();

      for (const journey of filteredJourneys) {
        const key = `${journey.departureStationId}-${journey.arrivalStationId}`;
        const reverseKey = `${journey.arrivalStationId}-${journey.departureStationId}`;

        if (!routeData[key] && !routeData[reverseKey]) {
          routesToLoad.add(key);
        }
      }

      const promises = Array.from(routesToLoad).map(async (routeKey) => {
        const [depId, arrId] = routeKey.split("-").map(Number);

        try {
          const data = await getRouteData(depId.toString(), arrId.toString());
          if (data) {
            setRouteData((prev) => ({ ...prev, [routeKey]: data }));
          }
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

  // Calcul sécurisé des prix min/max basé sur les données filtrées
  const priceStats = useMemo(() => {
    const validJourneys = filteredJourneys.filter(
      (j) => typeof j.avgPrice === "number" && !Number.isNaN(j.avgPrice)
    );

    if (validJourneys.length === 0) {
      return { minPrice: 0, maxPrice: 0 };
    }

    const prices = validJourneys.map((j: GroupedJourney) => j.avgPrice);
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  }, [filteredJourneys]);

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

    for (const journey of filteredJourneys) {
      const key = `${journey.departureStationId}-${journey.arrivalStationId}`;
      const reverseKey = `${journey.arrivalStationId}-${journey.departureStationId}`;

      let route = routeData[key];
      let isReversed = false;

      if (!route && routeData[reverseKey]) {
        route = routeData[reverseKey];
        isReversed = true;
      }

      if (route) {
        let features: GeoJSONFeature[] = [];

        if (route.type === "FeatureCollection" && "features" in route) {
          features = (route as { features: GeoJSONFeature[] }).features;
        } else if (route.type === "Feature") {
          features = [route as GeoJSONFeature];
        }

        for (const [featureIndex, feature] of features.entries()) {
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
        }
      }
    }

    return lines;
  }, [filteredJourneys, getColor, routeData]);

  const handleRouteClick = (routeKey: string, journeyIds: string[]) => {
    if (selectedRouteKey === routeKey) {
      setSelectedRouteKey(null);
      onRouteSelect?.([]);
    } else {
      setSelectedRouteKey(routeKey);
      onRouteSelect?.(journeyIds);
    }
  };

  const getStationPriceRange = React.useCallback(
    (stationId: number): { minPrice: number; maxPrice: number } | null => {
      const stationJourneys = filteredJourneys.filter(
        (j) =>
          j.departureStationId === stationId || j.arrivalStationId === stationId
      );

      if (stationJourneys.length === 0) {
        return null;
      }

      const allMinPrices = stationJourneys
        .map((j) => j.minPrice)
        .filter((price) => typeof price === "number" && !Number.isNaN(price));
      const allMaxPrices = stationJourneys
        .map((j) => j.maxPrice)
        .filter((price) => typeof price === "number" && !Number.isNaN(price));

      if (allMinPrices.length === 0 || allMaxPrices.length === 0) {
        return null;
      }

      return {
        minPrice: Math.min(...allMinPrices),
        maxPrice: Math.max(...allMaxPrices),
      };
    },
    [filteredJourneys]
  );

  const uniqueStations = useMemo(() => {
    const stationMap = new Map<
      number,
      {
        id: number;
        name: string;
        position: [number, number];
      }
    >();

    for (const line of routeLines) {
      if (line.coordinates.length > 0) {
        const depKey = line.departureStationId;
        if (!stationMap.has(depKey)) {
          stationMap.set(depKey, {
            id: depKey,
            name: line.departureStation,
            position: line.coordinates[0],
          });
        }
      }

      if (line.coordinates.length > 1) {
        const arrKey = line.arrivalStationId;
        if (!stationMap.has(arrKey)) {
          stationMap.set(arrKey, {
            id: arrKey,
            name: line.arrivalStation,
            position: line.coordinates.at(-1) || line.coordinates[0],
          });
        }
      }
    }

    return Array.from(stationMap.values());
  }, [routeLines]);

  const mapCenter = useMemo(() => {
    return [47, 2];
  }, []);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <div className="relative h-full w-full">
        <MapContainer
          center={mapCenter as [number, number]}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
          zoomControl={true}
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
                  weight={isSelected ? 8 : 6}
                  opacity={0}
                  eventHandlers={{
                    click: () => handleRouteClick(routeKey, journeyIds),
                  }}
                  style={{ cursor: "pointer" }}
                />
                <Polyline
                  positions={line.coordinates}
                  color={isSelected ? "#ff6b35" : line.color}
                  weight={isSelected ? 7 : 5}
                  opacity={isSelected ? 1 : 0.8}
                  eventHandlers={{
                    click: () => handleRouteClick(routeKey, journeyIds),
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <Popup>
                    <div className="p-2">
                      {(() => {
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
                                <div className="text-sm font-semibold text-gray-900 mb-2">
                                  {translateStation(line.departureStation)} ⟷{" "}
                                  {translateStation(line.arrivalStation)}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">De</span>
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                    {truncatePrice(forwardJourneys[0].minPrice)}
                                    €
                                  </span>
                                  <span className="text-sm">à</span>
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                                    {truncatePrice(forwardJourneys[0].maxPrice)}
                                    €
                                  </span>
                                </div>
                              </div>
                            )}

                            {reverseJourneys.length > 0 && (
                              <div>
                                <div className="text-sm font-semibold text-gray-900 mb-2">
                                  {translateStation(line.arrivalStation)} ⟷{" "}
                                  {translateStation(line.departureStation)}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">De</span>
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                    {truncatePrice(reverseJourneys[0].minPrice)}
                                    €
                                  </span>
                                  <span className="text-sm">à</span>
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                                    {truncatePrice(reverseJourneys[0].maxPrice)}
                                    €
                                  </span>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </Popup>
                </Polyline>
              </React.Fragment>
            );
          })}

          {uniqueStations.map((station) => (
            <Marker
              key={station.id}
              position={station.position}
              icon={createCustomIcon("#6b7280")}
            >
              {station.id !== 4916 && (
                <Popup>
                  <div className="p-2">
                    <div className="text-sm font-semibold text-gray-900 mb-2">
                      {translateStation(station.name)}
                    </div>
                    {(() => {
                      const priceRange = getStationPriceRange(station.id);
                      if (priceRange === null) {
                        return null;
                      }
                      return (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">De</span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                            {truncatePrice(priceRange.minPrice)}€
                          </span>
                          <span className="text-sm">à</span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                            {truncatePrice(priceRange.maxPrice)}€
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </Popup>
              )}
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default TrainMap;
