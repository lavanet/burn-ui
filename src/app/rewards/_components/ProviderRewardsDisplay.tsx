'use client'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@burn/components/ui/card"
import providerRewardsData from '../data/provider_rewards.json'
import { ProviderRewardsData } from './types'
import { FormatDate, FormatDollarValue } from '@burn/lib/formatting'

export default function ProviderRewardsDisplay() {
    const data = providerRewardsData as ProviderRewardsData

    // Calculate total rewards across all providers
    const totalRewards = data.providers.reduce((sum, provider) =>
        sum + provider.rewards.total_usd, 0
    )

    return (
        <Card>
            <CardHeader>
                <CardTitle>Provider Rewards</CardTitle>
                <CardDescription>
                    Last updated: {FormatDate(data.timestamp)}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <h3 className="text-lg font-semibold">Total Providers</h3>
                            <p>{data.total_providers}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Providers with Rewards</h3>
                            <p>{data.providers_with_rewards}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Total USD Value</h3>
                            <p className="text-xl font-bold text-primary">
                                {FormatDollarValue(totalRewards)}
                            </p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Top Providers by Rewards</h3>
                        <div className="space-y-2">
                            {data.providers
                                .sort((a, b) => b.rewards.total_usd - a.rewards.total_usd)
                                .slice(0, 5)
                                .map((provider) => (
                                    <div key={provider.address} className="flex justify-between items-center">
                                        <span>{provider.address}</span>
                                        <span>{FormatDollarValue(provider.rewards.total_usd)}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 