"use client"

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
import burnHistory from '../data/burn_history.json'

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

interface BurnRateChartProps {
    formatDate: (date: string) => string
    formatFullDate: (date: string) => string
    formatLava: (amount: number) => string
    formatLavaMillions: (amount: number) => string
}

export function BurnRateChart({ formatDate, formatFullDate, formatLava, formatLavaMillions }: BurnRateChartProps) {
    // Get the data in chronological order for the chart
    const chartData = burnHistory.blocks
        .slice()
        .reverse()  // Keep reverse for chart visualization
        .map(block => ({
            date: block.day,
            amount: block.supply,
            height: block.block,
            diff: block.supply_diff || 0,
            cumulativeBurn: 0
        }))

    // Calculate cumulative burn
    let totalBurn = 0
    chartData.forEach(item => {
        if (item.diff > 0) {
            totalBurn += item.diff
        }
        item.cumulativeBurn = totalBurn
    })

    const initialSupply = Math.max(...chartData.map(item => item.amount))

    const chartConfig = {
        labels: chartData.map(item => formatDate(item.date)),
        datasets: [
            {
                type: 'bar' as const,
                label: 'Remaining Supply',
                data: chartData.map(item => item.amount),
                backgroundColor: 'rgba(255, 107, 107, 0.8)',
                borderColor: '#FF6B6B',
                borderWidth: 1,
                stack: 'stack0',
            },
            {
                type: 'bar' as const,
                label: 'Burned Amount',
                data: chartData.map(item => item.cumulativeBurn),
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
                    title: (context) => formatFullDate(chartData[context[0].dataIndex].date),
                    label: (context: any) => {
                        const dataPoint = chartData[context.dataIndex]
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
                        if (index >= 0 && index < chartData.length) {
                            return formatDate(chartData[index].date)
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

    return (
        <div className="h-[800px]">
            <Bar data={chartConfig} options={options} />
        </div>
    )
} 