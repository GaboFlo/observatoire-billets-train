import { AggregatedPricingResult } from "@/types/journey";

// Cache pour les données de pricing
interface PricingCache {
  data: AggregatedPricingResult[];
  timestamp: number;
}

const CACHE_DURATION = 30 * 1000; // 30 secondes en millisecondes
let pricingCache: PricingCache | null = null;

export const isCacheValid = (): boolean => {
  if (!pricingCache) return false;
  const now = Date.now();
  return (now - pricingCache.timestamp) < CACHE_DURATION;
};

export const getCachedData = (): AggregatedPricingResult[] | null => {
  if (isCacheValid()) {
    return pricingCache!.data;
  }
  return null;
};

export const setCachedData = (data: AggregatedPricingResult[]) => {
  pricingCache = {
    data,
    timestamp: Date.now()
  };
}; 