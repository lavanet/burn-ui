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
import { calculateBurnData } from '../data/burnDataCalculator'

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
    const data = calculateBurnData()
    const initialSupply = Math.max(...data.map(item => item.amount))

    // Calculate average burn rate for predictions
    const recentBurns = data.slice(-3) // Last 3 months
    const avgMonthlyBurn = recentBurns.reduce((acc, item) => acc + item.diff, 0) / recentBurns.length

    // Generate 6 months of predictions with proper dates
    const lastDataPoint = data[data.length - 1]
    const predictions = Array.from({ length: 6 }).map((_, index) => {
        const predictedDate = new Date(lastDataPoint.date)
        predictedDate.setMonth(predictedDate.getMonth() + index + 1)
        return {
            date: predictedDate.toISOString(),
            amount: lastDataPoint.amount - (avgMonthlyBurn * (index + 1)),
            predicted: true
        }
    })

    const chartData = {
        labels: [...data.map(item => formatDate(item.date)), ...predictions.map(p => formatDate(p.date))],
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
            },
            {
                type: 'bar' as const,
                label: 'Predicted Supply',
                data: [...Array(data.length).fill(null), ...predictions.map(p => p.amount)],
                backgroundColor: 'rgba(255, 107, 107, 0.3)',
                borderColor: '#FF6B6B',
                borderWidth: 1,
                stack: 'stack0',
            },
            {
                type: 'line' as const,
                label: 'Burn Rate',
                data: data.map(item => item.burnRate),
                borderColor: '#FFA726',
                backgroundColor: '#FFA726',
                borderWidth: 2,
                yAxisID: 'y1',
                tension: 0.4
            }
        ]
    }

    const formatMicroLava = (amount: number) => {
        return `${(amount * 1_000_000).toLocaleString()} µLAVA`
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
                    title: (context) => {
                        const index = context[0].dataIndex
                        const isPrediction = index >= data.length
                        const date = isPrediction ? predictions[index - data.length].date : data[index].date
                        return `${formatFullDate(date)}${isPrediction ? ' (Predicted)' : ''}`
                    },
                    label: (context: any) => {
                        const index = context.dataIndex
                        const isPrediction = index >= data.length

                        if (isPrediction && context.dataset.label === 'Predicted Supply') {
                            const predictedAmount = predictions[index - data.length].amount
                            return [
                                `Predicted Supply: ${formatLava(predictedAmount)} LAVA`,
                                `Predicted Date: ${formatFullDate(predictions[index - data.length].date)}`,
                                `Predicted Burn: ${formatLava(avgMonthlyBurn)} LAVA`
                            ]
                        }

                        const dataPoint = data[index]
                        if (!dataPoint) return []

                        if (context.dataset.label === 'Burned Amount') {
                            return [
                                `Total Burned: ${formatLava(dataPoint.cumulativeBurn)} LAVA`,
                                `Burn Rate: ${dataPoint.burnRate.toFixed(4)}%`,
                                dataPoint.diff > 0 ? `Daily Burn: ${formatLava(dataPoint.diff)} LAVA` : ''
                            ].filter(Boolean)
                        }

                        if (context.dataset.label === 'Remaining Supply') {
                            return [
                                `Remaining: ${formatLava(dataPoint.amount)} LAVA`,
                                `Block: ${dataPoint.height.toLocaleString()}`
                            ]
                        }

                        if (context.dataset.label === 'Burn Rate') {
                            return `${dataPoint.burnRate.toFixed(4)}%`
                        }

                        return []
                    }
                }
            }
        },
        scales: {
            y: {
                stacked: true,
                min: 500_000_000,
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
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Burn Rate %',
                    color: '#ffffff'
                },
                ticks: {
                    color: '#ffffff'
                },
                grid: {
                    drawOnChartArea: false
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
                        if (index >= data.length) {
                            return formatDate(predictions[index - data.length].date)
                        }
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

    return (
        <div className="h-[800px]">
            <Bar data={chartData} options={options} />
        </div>
    )
} 