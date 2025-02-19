import burnHistory from './burn_history.json'

export interface BurnData {
    date: string
    amount: number
    height: number
    diff: number
    cumulativeBurn: number
    burnRate: number
    burnRateChange: number
}

export function calculateBurnData(): BurnData[] {
    const data = burnHistory.blocks
        .slice()
        .map(block => ({
            date: block.day,
            amount: block.supply,
            height: block.block,
            diff: block.supply_diff || 0,
            cumulativeBurn: 0,
            burnRate: 0,
            burnRateChange: 0
        }))
        .sort((a, b) => a.height - b.height)

    const initialSupply = Math.max(...data.map(item => item.amount))
    let totalBurn = 0
    let previousBurnRate = 0

    data.forEach((item, index) => {
        if (item.diff > 0) {
            totalBurn += item.diff
        }
        item.cumulativeBurn = totalBurn

        // Calculate burn rate as percentage of initial supply
        item.burnRate = (totalBurn / initialSupply) * 100

        // Calculate burn rate change (percentage points)
        if (index > 0) {
            item.burnRateChange = item.burnRate - previousBurnRate
        }
        previousBurnRate = item.burnRate
    })

    return data
}

// Add a new function to get data in reverse order for the table
export function getTableData(): BurnData[] {
    return calculateBurnData().slice().reverse()
} 