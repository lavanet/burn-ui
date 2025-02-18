'use client'

import burnHistory from './data/burn_history.json'
import { BurnRateChart } from './_components/BurnRateChart'
import { BurnRateTable } from './_components/BurnRateTable'
import { formatDate, formatFullDate } from '@burn/lib/dateFormatting'
import { formatLava, formatLavaMillions } from '@burn/lib/numberFormatting'

export default function BurnRatePage() {
    return (
        <div className="p-8 w-full min-h-screen">
            <div className="max-w-[1600px] mx-auto">
                <h1 className="text-4xl font-bold mb-10 text-center text-white">LAVA Token Burn History</h1>
                <div className="mb-12">
                    <BurnRateChart
                        formatDate={formatDate}
                        formatFullDate={formatFullDate}
                        formatLava={formatLava}
                        formatLavaMillions={formatLavaMillions}
                    />
                </div>

                <div className="mt-12">
                    <h2 className="text-3xl font-bold mb-8 text-white">Detailed History</h2>
                    <BurnRateTable
                        formatDate={formatDate}
                        formatLava={formatLava}
                    />
                </div>
            </div>
        </div>
    )
}