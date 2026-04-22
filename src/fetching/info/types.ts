// Shared TypeScript types for the info REST API responses consumed by
// burn-ui. Keep this module dependency-free so both server- and
// client-side code can import it.

// One row returned by GET /burn-rate. `supply` and `supply_diff` are
// base-unit strings (ulava, BigInt-scale). `supply_diff` is null on the
// oldest row because there is no previous row to diff against. `time`
// may be omitted; callers should fall back to `date`.
export interface BurnRateBlock {
    block: number;
    date: string;
    time?: string;
    supply: string;
    supply_diff: string | null;
}

// Latest chain-tip snapshot attached to /burn-rate. Always present in a
// well-formed response — even when `blocks` is empty.
export interface BurnRateLatest {
    block: number;
    time: string;
    supply: string;
}

// Top-level shape of GET /burn-rate. `blocks` is ordered DESC by date
// (newest first); burn-ui sorts ASC before walking.
export interface BurnRateResponse {
    blocks: BurnRateBlock[];
    latest: BurnRateLatest;
    generated_at: string;
}
