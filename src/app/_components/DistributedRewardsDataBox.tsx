"use client"

import { usePoolsFetch } from '@burn/fetching/jsinfobe/hooks/usePoolsFetch'
import { FormatNumber } from '@burn/lib/formatting'
import { DataBox } from '@burn/components/databox'
import { CircleDollarSign } from "lucide-react"

export default function DistributedRewardsDataBox() {
    const { totalPastRewards, isLoading } = usePoolsFetch()

    const formatRewardsToK = (value: number) => {
        const inK = Math.round(value / 1000)
        return `$${inK}K USD`
    }

    return (
        <DataBox
            title="Already distributed"
            value={isLoading ? "$464K USD" : formatRewardsToK(totalPastRewards)}
            tooltip={`Total distributed rewards: $${FormatNumber(totalPastRewards)} USD`}
            icon={<CircleDollarSign className="h-4 w-4" />}
            subtext="Updated daily"
        />
    )
} 