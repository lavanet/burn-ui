'use client'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@burn/components/ui/card"
import validatorDelegatorRewardsData from '../data/validator_delegator_rewards.json'
import { ValidatorDelegatorRewardsData } from './types'
import { FormatDate } from "@burn/lib/formatting"

export default function ValidatorDelegatorRewardsDisplay() {
    const data = validatorDelegatorRewardsData as ValidatorDelegatorRewardsData

    return (
        <Card>
            <CardHeader>
                <CardTitle>Validator Delegator Rewards</CardTitle>
                <CardDescription>
                    Last updated: {FormatDate(data.timestamp)}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <h3 className="text-lg font-semibold">Total Validators</h3>
                            <p>{data.total_validators}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Total Delegations</h3>
                            <p>{data.total_delegators}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Total USD Value</h3>
                            <p>${data.total_usd.toLocaleString()}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Top Validators by Delegator Rewards</h3>
                        <div className="space-y-2">
                            {data.validators
                                .sort((a, b) => b.total_usd - a.total_usd)
                                .slice(0, 5)
                                .map((validator) => (
                                    <div key={validator.validator_address} className="flex justify-between items-center">
                                        <div>
                                            <span>{validator.validator_address}</span>
                                            <span className="text-sm text-gray-500 ml-2">
                                                ({validator.delegator_count} delegators)
                                            </span>
                                        </div>
                                        <span>${validator.total_usd.toLocaleString()}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 