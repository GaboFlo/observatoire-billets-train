import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fonction pour tronquer les prix à l'unité (supprimer les décimales)
export function truncatePrice(price: number): number {
  return Math.floor(price);
}
