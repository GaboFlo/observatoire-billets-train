import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, Marker } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GroupedJourney } from '@/types/journey';

interface TrainMapProps {
  journeys: GroupedJourney[];
  onRouteSelect?: (selectedJourneyIds: string[]) => void;
}

interface RouteData {
  type: string;
  features: Array<{
    type: string;
    geometry: {
      type: string;
      coordinates: number[][];
    };
    properties: any;
  }>;
}

// Icônes personnalisées pour les marqueurs
const createCustomIcon = (color: string) => new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="${color}" stroke="white" stroke-width="2"/>
    </svg>
  `)}`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

const TrainMap: React.FC<TrainMapProps> = ({ journeys, onRouteSelect }) => {
  const [routeData, setRouteData] = useState<{ [key: string]: RouteData }>({});
  const [loading, setLoading] = useState(false);
  const [selectedRouteKey, setSelectedRouteKey] = useState<string | null>(null);

  const filteredJourneys = useMemo(() => {
    // Afficher tous les trajets sans distinction aller/retour
    return journeys;
  }, [journeys]);

  const fetchRouteData = async (journey: GroupedJourney) => {
    const key = `${journey.departureStationId}-${journey.arrivalStationId}`;
    
    if (routeData[key]) return;

    try {     
      const response = await fetch(
        `http://localhost:3000/api/trains/routes?dep=${journey.departureStationId}&arr=${journey.arrivalStationId}`
      );
      
      if (response.ok) {
        const data = await response.json();
 
        setRouteData(prev => ({ ...prev, [key]: data }));
      } else {
        console.error(`Erreur HTTP ${response.status} pour la route ${key}`);
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération de la route pour ${journey.name}:`, error);
    }
  };

  useEffect(() => {
    const loadRoutes = async () => {
      setLoading(true);
      const promises = filteredJourneys.map(journey => fetchRouteData(journey));
      await Promise.all(promises);
      setLoading(false);
    };

    loadRoutes();
  }, [filteredJourneys]);

  const routeLines = useMemo(() => {
    const lines: any[] = [];
    
    filteredJourneys.forEach(journey => {
      const key = `${journey.departureStationId}-${journey.arrivalStationId}`;
      const route = routeData[key];
      
      if (route) {
        // L'API retourne soit un FeatureCollection soit un Feature direct
        let features = [];
        
        if (route.type === 'FeatureCollection' && route.features) {
          features = route.features;
        } else if (route.type === 'Feature') {
          features = [route];
        }
        
        features.forEach((feature, featureIndex) => {
          if (feature.geometry && feature.geometry.coordinates) {
            let coordinates = [];
            
            // Gérer différents types de géométrie
            if (feature.geometry.type === 'LineString') {
              // LineString: [[lng, lat], [lng, lat], ...]
              coordinates = feature.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            } else if (feature.geometry.type === 'Polygon') {
              // Polygon: [[[lng, lat], [lng, lat], ...]] - prendre le premier ring
              coordinates = feature.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
            } else if (feature.geometry.type === 'MultiLineString') {
              // MultiLineString: [[[lng, lat], [lng, lat], ...], ...] - prendre la première ligne
              coordinates = feature.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
            }
            
            if (coordinates.length > 0) {            
              lines.push({
                id: `${journey.id}-${featureIndex}`,
                journeyId: journey.id,
                name: journey.name,
                coordinates: coordinates,
                avgPrice: journey.avgPrice,
                departureStation: journey.departureStation,
                arrivalStation: journey.arrivalStation,
                departureStationId: journey.departureStationId,
                arrivalStationId: journey.arrivalStationId,
                properties: feature.properties,
                featureIndex: featureIndex,
                geometryType: feature.geometry.type
              });
            }
          }
        });
      } 
    });

    return lines;
  }, [filteredJourneys.length, Object.keys(routeData).length]); // Dépendances simplifiées

  // Calcul sécurisé des prix min/max
  const priceStats = useMemo(() => {
    const validJourneys = filteredJourneys.filter(j => typeof j.avgPrice === 'number' && !isNaN(j.avgPrice));
    
    if (validJourneys.length === 0) {
      return { minPrice: 0, maxPrice: 100 };
    }
    
    const prices = validJourneys.map(j => j.avgPrice);
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices)
    };
  }, [filteredJourneys.length]); // Dépendance simplifiée

  const getColor = (price: number) => {
    if (priceStats.maxPrice === priceStats.minPrice) {
      return 'rgb(100, 100, 100)'; // Gris si tous les prix sont identiques
    }
    
    const normalizedPrice = (price - priceStats.minPrice) / (priceStats.maxPrice - priceStats.minPrice);
    const red = Math.round(255 * normalizedPrice);
    const blue = Math.round(255 * (1 - normalizedPrice));
    return `rgb(${red}, 100, ${blue})`;
  };

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
    // Utiliser un centre fixe pour éviter les problèmes de récursion
    return [48.8566, 2.3522]; // Paris par défaut
  }, []); // Dépendances vides pour éviter les recalculs

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200">
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
      
      <div className="relative h-80">
        <MapContainer
          center={mapCenter as [number, number]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {routeLines.map((line) => {
            const routeKey = `${line.departureStationId}-${line.arrivalStationId}`;
            const isSelected = selectedRouteKey === routeKey;
            const journeyIds = filteredJourneys
              .filter(j => 
                (j.departureStationId === line.departureStationId && j.arrivalStationId === line.arrivalStationId) ||
                (j.departureStationId === line.arrivalStationId && j.arrivalStationId === line.departureStationId)
              )
              .map(j => j.id);

            return (
              <React.Fragment key={line.id}>
                <Polyline
                  positions={line.coordinates}
                  color={isSelected ? '#ff6b35' : getColor(line.avgPrice)}
                  weight={isSelected ? 5 : 3}
                  opacity={isSelected ? 1 : 0.8}
                  eventHandlers={{
                    click: () => handleRouteClick(routeKey, journeyIds)
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <Popup>
                    <div className="p-2">
                      <div className="font-medium text-sm">{line.name}</div>
                      <div className="text-sm font-semibold text-blue-600">
                        Prix moyen: {Math.round(line.avgPrice)}€
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Prix min: {Math.round(priceStats.minPrice)}€ | Prix max: {Math.round(priceStats.maxPrice)}€
                      </div>
                      {line.properties && (
                        <div className="text-xs text-gray-500">
                          {line.properties.name && <div>Route: {line.properties.name}</div>}
                          {line.properties.distance && <div>Distance: {Math.round(line.properties.distance)}km</div>}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Polyline>
                
                {/* Marqueurs sur les gares (début et fin) */}
                {line.coordinates.length > 0 && (
                  <Marker
                    position={line.coordinates[0]}
                    icon={createCustomIcon('#6b7280')}
                  >
                    <Popup>
                      <div className="p-2">
                        <div className="font-medium text-sm">Gare</div>
                        <div className="text-xs text-gray-600">{line.departureStation}</div>
                      </div>
                    </Popup>
                  </Marker>
                )}
                
                {line.coordinates.length > 1 && (
                  <Marker
                    position={line.coordinates[line.coordinates.length - 1]}
                    icon={createCustomIcon('#6b7280')}
                  >
                    <Popup>
                      <div className="p-2">
                        <div className="font-medium text-sm">Gare</div>
                        <div className="text-xs text-gray-600">{line.arrivalStation}</div>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>

        {/* Légende */}
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-[1000]">
          <div className="text-sm font-medium mb-2">Prix moyen</div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-2 bg-blue-500 rounded"></div>
            <span className="text-xs">{Math.round(priceStats.minPrice)}€</span>
            <div className="w-4 h-2 bg-red-500 rounded"></div>
            <span className="text-xs">{Math.round(priceStats.maxPrice)}€</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <div>Cliquez sur une ligne pour les détails</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainMap; 