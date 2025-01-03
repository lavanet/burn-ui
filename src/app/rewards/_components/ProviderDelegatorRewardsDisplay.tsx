'use client'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@burn/components/ui/card"
import providerDelegatorRewardsData from '../data/provider_delegator_rewards.json'
import { ProviderDelegatorRewardsData } from './types'
import { FormatDate } from "@burn/lib/formatting"

export default function ProviderDelegatorRewardsDisplay() {
    const data = providerDelegatorRewardsData as ProviderDelegatorRewardsData

    // Calculate total USD value
    const totalUsd = data.provider_delegators.reduce((sum, item) =>
        sum + item.delegator_rewards.total_usd, 0
    )

    return (
        <Card>
            <CardHeader>
                <CardTitle>Provider Delegator Rewards</CardTitle>
                <CardDescription>
                    Last updated: {FormatDate(data.timestamp)}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-lg font-semibold">Total Providers with Delegator Rewards</h3>
                            <p>{data.provider_delegators.length}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Total USD Value</h3>
                            <p>${totalUsd.toLocaleString()}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Top Providers by Delegator Rewards</h3>
                        <div className="space-y-2">
                            {data.provider_delegators
                                .sort((a, b) => b.delegator_rewards.total_usd - a.delegator_rewards.total_usd)
                                .slice(0, 5)
                                .map((provider) => (
                                    <div key={provider.provider} className="flex justify-between items-center">
                                        <span>{provider.provider}</span>
                                        <span>${provider.delegator_rewards.total_usd.toLocaleString()}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 