'use client'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@burn/components/ui/card"
import validatorRewardsData from '../data/validator_rewards.json'
import { ValidatorRewardsData } from './types'
import { FormatDate } from '@burn/lib/formatting'

export default function ValidatorRewardsDisplay() {
    const data = validatorRewardsData as ValidatorRewardsData

    return (
        <Card>
            <CardHeader>
                <CardTitle>Validator Rewards</CardTitle>
                <CardDescription>
                    Last updated: {FormatDate(data.timestamp)}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-lg font-semibold">Total Validators</h3>
                            <p>{data.total_validators}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Validators with Rewards</h3>
                            <p>{data.validators_with_rewards}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Total USD Value</h3>
                        <p>${data.total_usd.toLocaleString()}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Top Validators by Rewards</h3>
                        <div className="space-y-2">
                            {data.validators
                                .sort((a, b) => b.rewards.total_usd - a.rewards.total_usd)
                                .slice(0, 5)
                                .map((validator) => (
                                    <div key={validator.address} className="flex justify-between items-center">
                                        <span>{validator.address}</span>
                                        <span>${validator.rewards.total_usd.toLocaleString()}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 