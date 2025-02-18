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
        .slice()
        .reverse()
        .map(block => ({
            date: block.day,
            amount: block.supply,
            height: block.block,
            diff: block.supply_diff || 0,
            cumulativeBurn: 0
        }))

    let totalBurn = 0
    data.forEach(item => {
        if (item.diff > 0) {
            totalBurn += item.diff
        }
        item.cumulativeBurn = totalBurn
    })

    const chartData = {
        labels: data.map(item => formatDate(item.date)),
        datasets: [
            {
                label: 'Total LAVA Supply',
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
                showLine: true,
                yAxisID: 'y'
            },
            {
                label: 'Cumulative Burn',
                data: data.map(item => item.cumulativeBurn),
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.15)',
                borderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#4CAF50',
                pointBorderColor: '#1a1a1a',
                pointHoverBackgroundColor: '#1a1a1a',
                pointHoverBorderColor: '#4CAF50',
                tension: 0.4,
                fill: true,
                showLine: true,
                yAxisID: 'y1'
            }
        ]
    }

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#ffffff',
                    font: {
                        size: 14
                    }
                }
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
                        if (context.dataset.label === 'Cumulative Burn') {
                            return `Total Burned: ${formatLava(dataPoint.cumulativeBurn)} LAVA`
                        }
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
                type: 'linear',
                display: true,
                position: 'left',
                min: 983_000_000,
                max: 999_000_000,
                title: {
                    display: true,
                    text: 'Total LAVA Supply',
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
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Cumulative Burn (LAVA)',
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
                    drawOnChartArea: false
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
            cell: (props: any) => formatDate(props.getValue()),
            sortingFn: (a: any, b: any) => {
                const dateA = new Date(a.date).getTime()
                const dateB = new Date(b.date).getTime()
                return dateA - dateB
            }
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