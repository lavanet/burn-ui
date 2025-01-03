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
import validatorRewardsData from '../data/validator_rewards.json'
import { ValidatorRewardsData } from './types'

export default function ValidatorRewardsTable() {
    const data = validatorRewardsData as ValidatorRewardsData

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Validator Address</TableHead>
                        <TableHead>Total USD Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.validators
                        .sort((a, b) => b.rewards.total_usd - a.rewards.total_usd)
                        .map((validator) => (
                            <TableRow key={validator.address}>
                                <TableCell>{validator.address}</TableCell>
                                <TableCell>
                                    <TokenTooltip
                                        totalUsd={validator.rewards.total_usd}
                                        tokens={validator.rewards.tokens}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    )
} 