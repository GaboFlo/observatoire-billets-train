import { AggregatedPricingResult } from "@/types/journey";

interface PricingCache {
  data: AggregatedPricingResult[];
  timestamp: number;
}

const CACHE_DURATION = 30 * 1000;
let pricingCache: PricingCache | null = null;

export const isCacheValid = (): boolean => {
  if (!pricingCache) return false;
  const now = Date.now();
  return (now - pricingCache.timestamp) < CACHE_DURATION;
};

const getCachedData = (): AggregatedPricingResult[] | null => {
  if (isCacheValid()) {
    return pricingCache!.data;
  }
  return null;
};

const setCachedData = (data: AggregatedPricingResult[]) => {
  pricingCache = {
    data,
    timestamp: Date.now()
  };
}; 