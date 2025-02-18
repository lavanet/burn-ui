"use client"

import { CalendarDays, Blocks, Flame, CandlestickChart } from 'lucide-react'
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell
} from "@burn/components/tables/SortableTable"
import burnHistory from '../data/burn_history.json'

interface BurnRateTableProps {
    formatDate: (date: string) => string
    formatLava: (amount: number) => string
}

export function BurnRateTable({ formatDate, formatLava }: BurnRateTableProps) {
    const formatBlockNumber = (num: number) => {
        return num.toLocaleString()
    }

    const data = burnHistory.blocks
        .slice()
        .map(block => ({
            date: block.day,
            amount: block.supply,
            height: block.block,
            diff: block.supply_diff || 0,
            cumulativeBurn: 0,
            sortKey: `${block.block.toString().padStart(10, '0')}`
        }))
        .sort((a, b) => b.height - a.height)

    let totalBurn = 0
    data.forEach(item => {
        if (item.diff > 0) {
            totalBurn += item.diff
        }
        item.cumulativeBurn = totalBurn
    })

    const columns = [
        {
            header: (
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    <span>Date</span>
                </div>
            ),
            accessorKey: "sortKey",
            cell: (props: any) => formatDate(data.find(item => item.sortKey === props.getValue())?.date || "")
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <Blocks className="h-5 w-5" />
                    <span>Block</span>
                </div>
            ),
            accessorKey: "height",
            cell: (props: any) => formatBlockNumber(props.getValue())
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <CandlestickChart className="h-5 w-5" />
                    <span>Supply</span>
                </div>
            ),
            accessorKey: "amount",
            cell: (props: any) => `${formatLava(props.getValue())} LAVA`
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5" />
                    <span>Burned</span>
                </div>
            ),
            accessorKey: "diff",
            cell: (props: any) => (
                <span className="text-red-600">
                    {props.getValue() ? `${formatLava(props.getValue())} LAVA` : '-'}
                </span>
            )
        }
    ]

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {columns.map((column) => (
                        <TableHead key={column.accessorKey}>
                            {column.header}
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((row, i) => (
                    <TableRow key={i}>
                        {columns.map((column) => (
                            <TableCell key={column.accessorKey}>
                                {column.cell({ getValue: () => row[column.accessorKey as keyof typeof row] })}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
} 