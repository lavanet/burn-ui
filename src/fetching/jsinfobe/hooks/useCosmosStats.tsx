'use client';

import { useJsinfobeFetch } from './useJsinfobeFetch';

interface CosmosStats {
  burn_rate: string;
  total_burned: string;
  timestamp: string;
  error?: string;
}

export function useCosmosStats() {
  return useJsinfobeFetch<CosmosStats>('/api/cosmos/stats');
} 