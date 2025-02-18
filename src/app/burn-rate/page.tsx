'use client'

import { Bar } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
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
    BarElement,
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

    const parseYearMonth = (dateStr: string) => {
        const [year, month] = dateStr.split('-').map(Number)
        return { year, month }
    }

    const sortByYearAndMonth = (a: string, b: string) => {
        const dateA = parseYearMonth(a)
        const dateB = parseYearMonth(b)

        if (dateA.year === dateB.year) {
            return dateA.month - dateB.month  // Changed: ascending month order within same year
        }
        return dateB.year - dateA.year  // Keep descending year order
    }

    const data = burnHistory.blocks
        .slice()
        .map(block => ({
            date: block.day,
            amount: block.supply,
            height: block.block,
            diff: block.supply_diff || 0,
            cumulativeBurn: 0
        }))
        .sort((a, b) => sortByYearAndMonth(a.date, b.date))

    let totalBurn = 0
    data.forEach(item => {
        if (item.diff > 0) {
            totalBurn += item.diff
        }
        item.cumulativeBurn = totalBurn
    })

    const initialSupply = Math.max(...data.map(item => item.amount))

    const chartData = {
        labels: data.map(item => formatDate(item.date)),
        datasets: [
            {
                type: 'bar' as const,
                label: 'Remaining Supply',
                data: data.map(item => item.amount),
                backgroundColor: 'rgba(255, 107, 107, 0.8)',
                borderColor: '#FF6B6B',
                borderWidth: 1,
                stack: 'stack0',
            },
            {
                type: 'bar' as const,
                label: 'Burned Amount',
                data: data.map(item => item.cumulativeBurn),
                backgroundColor: 'rgba(76, 175, 80, 0.8)',
                borderColor: '#4CAF50',
                borderWidth: 1,
                stack: 'stack0',
            }
        ]
    }

    const options: ChartOptions<'bar'> = {
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
                        const percentage = ((dataPoint.cumulativeBurn / initialSupply) * 100).toFixed(4)

                        if (context.dataset.label === 'Burned Amount') {
                            return [
                                `Total Burned: ${formatLava(dataPoint.cumulativeBurn)} LAVA`,
                                `Burn Rate: ${percentage}%`,
                                dataPoint.diff > 0 ? `Daily Burn: ${formatLava(dataPoint.diff)} LAVA` : ''
                            ].filter(Boolean)
                        }
                        return [
                            `Remaining: ${formatLava(dataPoint.amount)} LAVA`,
                            `Block: ${dataPoint.height}`
                        ]
                    }
                }
            }
        },
        scales: {
            y: {
                stacked: true,
                min: 983_000_000,
                max: initialSupply,
                title: {
                    display: true,
                    text: 'LAVA Supply',
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
                stacked: true,
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
            sortingFn: (rowA: any, rowB: any) => {
                return sortByYearAndMonth(rowA.original.date, rowB.original.date)
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
                        <Bar data={chartData} options={options} />
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