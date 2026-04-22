'use client'

import { BurnRateChart } from './_components/BurnRateChart'
import { BurnRateTable } from './_components/BurnRateTable'
import { calculateBurnData, getTableData } from './data/burnDataCalculator'
import { useInfoFetch } from '@burn/fetching/info/hooks/useInfoFetch'
import { INFO_ENDPOINTS } from '@burn/fetching/info/consts'
import type { BurnRateResponse } from '@burn/fetching/info/types'
import LoadingIndicator from '@burn/components/modern/LoadingIndicator'
import { ErrorDisplay } from '@burn/components/modern/ErrorDisplay'
import { formatDate, formatFullDate } from '@burn/lib/dateFormatting'
import { formatLava, formatLavaMillions } from '@burn/lib/numberFormatting'

export default function BurnRatePage() {
    const { data, isLoading, error } = useInfoFetch<BurnRateResponse>(INFO_ENDPOINTS.burnRate)

    const chartData = calculateBurnData(data)
    const tableData = getTableData(data)
    const hasHistory = chartData.length > 0

    return (
        <div className="p-8 w-full min-h-screen">
            <div className="max-w-[1600px] mx-auto">
                <h1 className="text-4xl font-bold mb-10 text-center text-white">LAVA Token Burn History</h1>
                {/* <div className="mb-12">
                    {hasHistory && (
                        <BurnRateChart
                            data={chartData}
                            formatDate={formatDate}
                            formatFullDate={formatFullDate}
                            formatLava={formatLava}
                            formatLavaMillions={formatLavaMillions}
                        />
                    )}
                </div> */}

                <div className="mt-12">
                    <h2 className="text-3xl font-bold mb-8 text-white">Detailed History</h2>
                    {isLoading && !data ? (
                        <LoadingIndicator loadingText="Loading burn history" />
                    ) : error ? (
                        <ErrorDisplay message={(error as Error)?.message ?? 'Failed to load burn history'} />
                    ) : !hasHistory ? (
                        <div className="text-gray-400 py-8 text-center">
                            No burn history available yet.
                        </div>
                    ) : (
                        <BurnRateTable
                            data={tableData}
                            formatDate={formatDate}
                            formatLava={formatLava}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
