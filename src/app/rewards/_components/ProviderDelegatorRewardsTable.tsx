'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@burn/components/tables/SortableTable"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@burn/components/tables/SortatableTableTooltipBase"
import providerDelegatorRewardsData from '../data/provider_delegator_rewards.json'
import { ProviderDelegatorRewardsData } from './types'

export default function ProviderDelegatorRewardsTable() {
    const data = providerDelegatorRewardsData as ProviderDelegatorRewardsData

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Provider Address</TableHead>
                        <TableHead>Total USD Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.provider_delegators
                        .sort((a, b) => b.delegator_rewards.total_usd - a.delegator_rewards.total_usd)
                        .map((provider) => (
                            <TableRow key={provider.provider}>
                                <TableCell>{provider.provider}</TableCell>
                                <TableCell>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                ${provider.delegator_rewards.total_usd.toLocaleString()}
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <div className="space-y-2">
                                                    {provider.delegator_rewards.tokens.map((token, i) => (
                                                        <div key={i} className="flex justify-between gap-4">
                                                            <span>
                                                                {token.amount} {token.denom}
                                                            </span>
                                                            <span className="text-muted-foreground">
                                                                {token.value_usd}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    )
} 