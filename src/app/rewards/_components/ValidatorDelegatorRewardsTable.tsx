'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@burn/components/tables/SortableTable"

import validatorDelegatorRewardsData from '../data/validator_delegator_rewards.json'
import { ValidatorDelegatorRewardsData } from './types'
import TokenTooltip from "./TokenTooltip"

export default function ValidatorDelegatorRewardsTable() {
    const data = validatorDelegatorRewardsData as ValidatorDelegatorRewardsData

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Validator Address</TableHead>
                        <TableHead>Delegator Count</TableHead>
                        <TableHead>Total USD Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.validators
                        .sort((a, b) => b.total_usd - a.total_usd)
                        .map((validator) => (
                            <TableRow key={validator.validator_address}>
                                <TableCell>{validator.validator_address}</TableCell>
                                <TableCell>{validator.delegator_count}</TableCell>
                                <TableCell>
                                    <TokenTooltip
                                        totalUsd={validator.total_usd}
                                        tokens={validator.total_rewards}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    )
} 