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