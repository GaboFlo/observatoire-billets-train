// Import dynamique des fichiers de routes
const routeFiles = {
  "4916-10498": () => import("../data/routes/4916-10498.json"),
  "4916-1193": () => import("../data/routes/4916-1193.json"),
  "4916-1339": () => import("../data/routes/4916-1339.json"),
  "4916-153": () => import("../data/routes/4916-153.json"),
  "4916-4652": () => import("../data/routes/4916-4652.json"),
  "4916-4687": () => import("../data/routes/4916-4687.json"),
  "4916-4718": () => import("../data/routes/4916-4718.json"),
  "4916-4791": () => import("../data/routes/4916-4791.json"),
  "4916-5085": () => import("../data/routes/4916-5085.json"),
  "4916-5097": () => import("../data/routes/4916-5097.json"),
  "4916-5306": () => import("../data/routes/4916-5306.json"),
  "4916-5892": () => import("../data/routes/4916-5892.json"),
  "4916-6617": () => import("../data/routes/4916-6617.json"),
  "4916-828": () => import("../data/routes/4916-828.json"),
  "4916-8490": () => import("../data/routes/4916-8490.json"),
};

export interface RouteData {
  type: string;
  properties: {
    dep: string;
    arr: string;
    distance: number;
  };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

export const getRouteData = async (
  dep: string,
  arr: string
): Promise<RouteData | null> => {
  try {
    // Essayer d'abord le trajet direct
    const routeKey = `${dep}-${arr}`;
    if (routeFiles[routeKey as keyof typeof routeFiles]) {
      const routeData = await routeFiles[routeKey as keyof typeof routeFiles]();
      const data = routeData.default;
      return {
        type: data.type,
        geometry: data.geometry,
        properties: {
          dep: dep,
          arr: arr,
          distance: 0,
        },
      };
    }

    // Si pas trouvé, essayer le trajet inverse
    const routeKeyReverse = `${arr}-${dep}`;
    if (routeFiles[routeKeyReverse as keyof typeof routeFiles]) {
      const routeData = await routeFiles[
        routeKeyReverse as keyof typeof routeFiles
      ]();
      // Inverser les coordonnées pour le trajet retour
      const data = routeData.default;
      const reversedRouteData = {
        type: data.type,
        properties: {
          dep: arr,
          arr: dep,
          distance: 0,
        },
        geometry: {
          ...data.geometry,
          coordinates: data.geometry.coordinates.map((ring: number[][]) =>
            ring.slice().reverse()
          ),
        },
      };
      return reversedRouteData;
    }

    console.log(`Route non trouvée: ${routeKey} ou ${routeKeyReverse}`);
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de la route:", error);
    return null;
  }
};
