'use client'

import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions
} from 'chart.js'
import { CalendarDays, Blocks, Flame, CandlestickChart } from 'lucide-react'
import burnHistory from './data/burn_history.json'
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell
} from "@burn/components/tables/SortableTable"

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

export default function BurnRatePage() {
    const formatLava = (amount: number) => {
        return amount.toLocaleString(undefined, {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3
        })
    }

    const formatLavaMillions = (amount: number) => {
        return `${(amount / 1_000_000).toLocaleString(undefined, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        })}M`
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const year = date.getFullYear()
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const month = months[date.getMonth()]
        return `${year} ${month}`
    }

    const formatFullDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const year = date.getFullYear()
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December']
        const month = months[date.getMonth()]
        const day = date.getDate()
        return `${month} ${day}, ${year}`
    }

    const data = burnHistory.blocks
        .slice() // Create a copy before reversing
        .reverse() // Show oldest first
        .map(block => ({
            date: block.day,
            amount: block.supply,
            height: block.block,
            diff: block.supply_diff || 0
        }))

    const chartData = {
        labels: data.map(item => formatDate(item.date)),
        datasets: [
            {
                label: 'LAVA Supply',
                data: data.map(item => item.amount),
                borderColor: '#FF6B6B',
                backgroundColor: 'rgba(255, 107, 107, 0.15)',
                borderWidth: 3,
                pointRadius: 8,
                pointHoverRadius: 10,
                pointBackgroundColor: '#FF6B6B',
                pointBorderColor: '#1a1a1a',
                pointHoverBackgroundColor: '#1a1a1a',
                pointHoverBorderColor: '#FF6B6B',
                tension: 0.4,
                fill: true,
                showLine: true
            }
        ]
    }

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                titleFont: {
                    size: 16,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 14
                },
                padding: 15,
                callbacks: {
                    title: (context) => formatFullDate(data[context[0].dataIndex].date),
                    label: (context: any) => {
                        const dataPoint = data[context.dataIndex]
                        return [
                            `Supply: ${formatLava(dataPoint.amount)} LAVA`,
                            `Block: ${dataPoint.height}`,
                            dataPoint.diff > 0 ? `Burned: ${formatLava(dataPoint.diff)} LAVA` : ''
                        ].filter(Boolean)
                    }
                }
            }
        },
        scales: {
            y: {
                min: 983_000_000, // Adjusted based on current data
                max: 999_000_000, // Added max to better show the range
                title: {
                    display: true,
                    text: 'LAVA Amount (Millions)',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#ffffff'
                },
                ticks: {
                    callback: (value) => formatLavaMillions(value as number),
                    font: {
                        size: 14
                    },
                    color: '#ffffff'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Date',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#ffffff'
                },
                ticks: {
                    callback: function (this: any, tickValue: string | number, index: number) {
                        if (index >= 0 && index < data.length) {
                            return formatDate(data[index].date)
                        }
                        return ''
                    },
                    maxRotation: 45,
                    minRotation: 45,
                    font: {
                        size: 14
                    },
                    color: '#ffffff'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        }
    }

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
            cell: (props: any) => props.getValue()
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
        <div className="p-8 w-full min-h-screen">
            <div className="max-w-[1600px] mx-auto">
                <h1 className="text-4xl font-bold mb-10 text-center text-white">LAVA Token Burn History</h1>
                <div className="mb-12">
                    <div className="h-[800px]">
                        <Line data={chartData} options={options} />
                    </div>
                </div>

                <div className="mt-12">
                    <h2 className="text-3xl font-bold mb-8 text-white">Detailed History</h2>
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
                </div>
            </div>
        </div>
    )
}