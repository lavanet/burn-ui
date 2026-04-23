export const INFO_BASE_URL = process.env.NEXT_PUBLIC_INFO_BASE_URL || 'https://api-info.lavanet.xyz';

export const INFO_ENDPOINTS = {
    // GET /supply/total — plain text number, total LAVA supply
    supplyTotal: '/supply/total',
    // GET /supply/circulating — plain text number, circulating LAVA
    supplyCirculating: '/supply/circulating',
    // GET /burn-rate — monthly supply snapshots with supply_diff
    burnRate: '/burn-rate',
} as const;
