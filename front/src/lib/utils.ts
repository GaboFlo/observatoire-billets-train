import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fonction pour tronquer les prix à l'unité (supprimer les décimales)
export function truncatePrice(price: number): number {
  return Math.floor(price);
}

export function buildJourneyUrl(
  departureStation: string,
  arrivalStation: string,
  departureStationId: number,
  arrivalStationId: number
): string {
  return `/journey/${departureStation}-${departureStationId}/${arrivalStation}-${arrivalStationId}/`;
}

export function parseStationWithId(
  stationWithId: string
): { station: string; id: number } | null {
  const lastDashIndex = stationWithId.lastIndexOf("-");
  if (lastDashIndex === -1) {
    return null;
  }
  const station = stationWithId.substring(0, lastDashIndex);
  const idStr = stationWithId.substring(lastDashIndex + 1);
  const id = Number.parseInt(idStr, 10);
  if (Number.isNaN(id)) {
    return null;
  }
  return { station, id };
}
