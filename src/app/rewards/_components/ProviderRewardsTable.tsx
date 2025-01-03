'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@burn/components/tables/SortableTable"
import TokenTooltip from "./TokenTooltip"
import providerRewardsData from '../data/provider_rewards.json'
import { ProviderRewardsData } from './types'

export default function ProviderRewardsTable() {
    const data = providerRewardsData as ProviderRewardsData

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Provider Address</TableHead>
                        <TableHead>Block Height</TableHead>
                        <TableHead>Total USD Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.providers
                        .sort((a, b) => b.rewards.total_usd - a.rewards.total_usd)
                        .map((provider) => (
                            <TableRow key={provider.address}>
                                <TableCell>{provider.address}</TableCell>
                                <TableCell>{provider.block_height}</TableCell>
                                <TableCell>
                                    <TokenTooltip
                                        totalUsd={provider.rewards.total_usd}
                                        tokens={provider.rewards.tokens}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    )
} 