"use client"

import { CalendarDays, Blocks, Flame, CandlestickChart, TrendingUp, Percent } from 'lucide-react'
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell
} from "@burn/components/tables/SortableTable"
import { calculateBurnData, getTableData } from '../data/burnDataCalculator'

interface BurnRateTableProps {
    formatDate: (date: string) => string
    formatLava: (amount: number) => string
}

export function BurnRateTable({ formatDate, formatLava }: BurnRateTableProps) {
    const formatBlockNumber = (num: number) => {
        return num.toLocaleString()
    }

    const formatPercentage = (num: number) => {
        return `${num.toFixed(4)}%`
    }

    const data = getTableData()

    const columns = [
        {
            header: (
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    <span>Date</span>
                </div>
            ),
            accessorKey: "date",
            cell: (props: any) => formatDate(props.getValue())
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
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <Percent className="h-5 w-5" />
                    <span>Burn Rate</span>
                </div>
            ),
            accessorKey: "burnRate",
            cell: (props: any) => formatPercentage(props.getValue())
        },
        {
            header: (
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Rate Change</span>
                </div>
            ),
            accessorKey: "burnRateChange",
            cell: (props: any) => (
                <span className={props.getValue() > 0 ? "text-green-500" : "text-red-500"}>
                    {props.getValue() !== 0 ? formatPercentage(props.getValue()) : '-'}
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