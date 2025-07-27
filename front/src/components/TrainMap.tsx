import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, Marker } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GroupedJourney } from '@/types/journey';

interface TrainMapProps {
  journeys: GroupedJourney[];
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

const TrainMap: React.FC<TrainMapProps> = ({ journeys }) => {
  const [routeDirection, setRouteDirection] = useState<'paris-regions' | 'regions-paris'>('paris-regions');
  const [routeData, setRouteData] = useState<{ [key: string]: RouteData }>({});
  const [loading, setLoading] = useState(false);

  const filteredJourneys = useMemo(() => {
    if (routeDirection === 'paris-regions') {
      return journeys.filter(journey => 
        journey.departureStation.toLowerCase().includes('paris')
      );
    } else {
      return journeys.filter(journey => 
        journey.arrivalStation.toLowerCase().includes('paris')
      );
    }
  }, [journeys, routeDirection]);

  const fetchRouteData = async (journey: GroupedJourney) => {
    const key = `${journey.departureStationId}-${journey.arrivalStationId}`;
    
    if (routeData[key]) return;

    try {
      console.log(`Récupération de la route pour ${journey.name} (${journey.departureStationId} → ${journey.arrivalStationId})`);
      
      const response = await fetch(
        `http://localhost:3000/api/trains/routes?dep=${journey.departureStationId}&arr=${journey.arrivalStationId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Route récupérée pour ${journey.name}:`, data);
        console.log(`Nombre de features:`, data.features?.length);
        if (data.features && data.features.length > 0) {
          console.log(`Première feature:`, data.features[0]);
          console.log(`Type de géométrie:`, data.features[0].geometry?.type);
          console.log(`Nombre de coordonnées:`, data.features[0].geometry?.coordinates?.length);
          console.log(`Premières coordonnées:`, data.features[0].geometry?.coordinates?.slice(0, 3));
        }
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
    
    console.log('Génération des lignes de route...');
    console.log('RouteData:', routeData);
    
    filteredJourneys.forEach(journey => {
      const key = `${journey.departureStationId}-${journey.arrivalStationId}`;
      const route = routeData[key];
      
      console.log(`Traitement de ${journey.name}, route:`, route);
      
      if (route) {
        // L'API retourne soit un FeatureCollection soit un Feature direct
        let features = [];
        
        if (route.type === 'FeatureCollection' && route.features) {
          features = route.features;
        } else if (route.type === 'Feature') {
          features = [route];
        }
        
        console.log(`Features trouvées:`, features.length);
        
        features.forEach((feature, featureIndex) => {
          console.log(`Feature ${featureIndex}:`, feature);
          
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
              console.log(`Coordonnées converties pour ${journey.name}:`, coordinates.slice(0, 3));
              
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
            } else {
              console.warn(`Aucune coordonnée valide pour ${journey.name}, feature ${featureIndex}`);
            }
          } else {
            console.warn(`Feature ${featureIndex} invalide pour ${journey.name}:`, feature);
          }
        });
      } else {
        console.warn(`Pas de route trouvée pour ${journey.name}`);
      }
    });

    console.log(`Nombre total de lignes générées:`, lines.length);
    return lines;
  }, [filteredJourneys, routeData]);

  const minPrice = Math.min(...filteredJourneys.map(j => j.avgPrice));
  const maxPrice = Math.max(...filteredJourneys.map(j => j.avgPrice));

  const getColor = (price: number) => {
    const normalizedPrice = (price - minPrice) / (maxPrice - minPrice);
    const red = Math.round(255 * normalizedPrice);
    const blue = Math.round(255 * (1 - normalizedPrice));
    return `rgb(${red}, 100, ${blue})`;
  };

  // Calculer le centre de la carte basé sur les routes disponibles
  const mapCenter = useMemo(() => {
    if (routeLines.length === 0) {
      return [48.8566, 2.3522]; // Paris par défaut
    }

    const allCoords = routeLines.flatMap(line => line.coordinates);
    const lats = allCoords.map(coord => coord[0]);
    const lngs = allCoords.map(coord => coord[1]);
    
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    
    return [centerLat, centerLng];
  }, [routeLines]);

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200">
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Carte des trajets</h3>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Direction:</label>
            <select
              value={routeDirection}
              onChange={(e) => setRouteDirection(e.target.value as 'paris-regions' | 'regions-paris')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="paris-regions">Paris → Régions</option>
              <option value="regions-paris">Régions → Paris</option>
            </select>
          </div>
        </div>
        {loading && (
          <div className="mt-2 text-sm text-gray-600">
            Chargement des routes...
          </div>
        )}
        <div className="mt-2 text-xs text-gray-500">
          {routeLines.length} segments de route chargés
        </div>
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
          
          {routeLines.map((line) => (
            <React.Fragment key={line.id}>
              <Polyline
                positions={line.coordinates}
                color={getColor(line.avgPrice)}
                weight={3}
                opacity={0.8}
              >
                <Popup>
                  <div className="p-2">
                    <div className="font-medium text-sm">{line.name}</div>
                    <div className="text-sm font-semibold text-blue-600">
                      Prix moyen: {Math.round(line.avgPrice)}€
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Prix min: {Math.round(minPrice)}€ | Prix max: {Math.round(maxPrice)}€
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
              
              {/* Marqueur de départ */}
              {line.coordinates.length > 0 && (
                <Marker
                  position={line.coordinates[0]}
                  icon={createCustomIcon('#3b82f6')}
                >
                  <Popup>
                    <div className="p-2">
                      <div className="font-medium text-sm">Départ</div>
                      <div className="text-xs text-gray-600">{line.departureStation}</div>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* Marqueur d'arrivée */}
              {line.coordinates.length > 1 && (
                <Marker
                  position={line.coordinates[line.coordinates.length - 1]}
                  icon={createCustomIcon('#ef4444')}
                >
                  <Popup>
                    <div className="p-2">
                      <div className="font-medium text-sm">Arrivée</div>
                      <div className="text-xs text-gray-600">{line.arrivalStation}</div>
                    </div>
                  </Popup>
                </Marker>
              )}
            </React.Fragment>
          ))}
        </MapContainer>

        {/* Légende */}
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-[1000]">
          <div className="text-sm font-medium mb-2">Prix moyen</div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-2 bg-blue-500 rounded"></div>
            <span className="text-xs">{Math.round(minPrice)}€</span>
            <div className="w-4 h-2 bg-red-500 rounded"></div>
            <span className="text-xs">{Math.round(maxPrice)}€</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <div>🔵 Départ</div>
            <div>🔴 Arrivée</div>
            <div>Cliquez sur une ligne pour les détails</div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-[1000]">
          <div className="text-sm font-medium mb-1">Statistiques</div>
          <div className="text-xs text-gray-600">
            {routeLines.length} segments affichés
          </div>
          <div className="text-xs text-gray-600">
            {filteredJourneys.length} trajets
          </div>
          <div className="text-xs text-gray-600">
            Prix moyen: {Math.round(filteredJourneys.reduce((sum, j) => sum + j.avgPrice, 0) / filteredJourneys.length)}€
          </div>
        </div>


      </div>
    </div>
  );
};

export default TrainMap; 