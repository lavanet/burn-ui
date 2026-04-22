import type { BurnRateBlock, BurnRateResponse } from '@burn/fetching/info/types'

export interface BurnData {
    date: string
    amount: number
    height: number
    diff: number
    cumulativeBurn: number
    burnRate: number
    burnRateChange: number
}

const ULAVA_PER_LAVA = BigInt(1_000_000)

// Convert a ulava base-unit string to a LAVA number. `supply` can grow
// large (1B LAVA ~= 1e15 ulava) but still fits comfortably in a JS
// Number once divided by 1e6 (1e9 LAVA is well under Number.MAX_SAFE).
function ulavaToLava(ulava: string | null | undefined): number {
    if (ulava == null) return 0
    return Number(BigInt(ulava) / ULAVA_PER_LAVA)
}

// Derive a row's display date (YYYY-MM-DD). Prefer the explicit `date`
// field; fall back to slicing `time` if `date` is missing on an older
// info response.
function burnRowDate(block: BurnRateBlock): string {
    if (block.date && block.date.length > 0) return block.date
    if (block.time && block.time.length >= 10) return block.time.slice(0, 10)
    return ''
}

// Map the info /burn-rate response into the `BurnData[]` shape the
// chart and table already know how to render. The walking math is
// identical to the pre-migration calculator: sort ASC by block height,
// walk forward, and treat negative supply_diff (mints) as zero for the
// cumulative burn total.
export function calculateBurnData(response: BurnRateResponse | null | undefined): BurnData[] {
    if (!response || !Array.isArray(response.blocks) || response.blocks.length === 0) {
        return []
    }

    const data: BurnData[] = response.blocks
        .map((block) => ({
            date: burnRowDate(block),
            amount: ulavaToLava(block.supply),
            height: block.block,
            diff: ulavaToLava(block.supply_diff),
            cumulativeBurn: 0,
            burnRate: 0,
            burnRateChange: 0,
        }))
        .sort((a, b) => a.height - b.height)

    const initialSupply = Math.max(...data.map((item) => item.amount))
    let totalBurn = 0
    let previousBurnRate = 0

    data.forEach((item, index) => {
        if (item.diff > 0) {
            totalBurn += item.diff
        }
        item.cumulativeBurn = totalBurn

        item.burnRate = initialSupply > 0 ? (totalBurn / initialSupply) * 100 : 0

        if (index > 0) {
            item.burnRateChange = item.burnRate - previousBurnRate
        }
        previousBurnRate = item.burnRate
    })

    return data
}

// Reverse view for the detailed-history table (newest first).
export function getTableData(response: BurnRateResponse | null | undefined): BurnData[] {
    return calculateBurnData(response).slice().reverse()
}
