"use client"

import React from 'react'
import { PieChart } from '@mui/x-charts/PieChart'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Card, CardContent, CardHeader, CardTitle } from "@burn/components/ui/card"
import { Skeleton } from "@burn/components/ui/skeleton"
import { Loader2 } from "lucide-react"
import { useJsinfobeFetch } from '@burn/fetching/jsinfobe/hooks/useJsinfobeFetch'
import { PieChart as PieChartIcon } from "lucide-react"

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

interface TotalSupplyPieChartProps {
    burnedPercentage: number;
}

export function TotalSupplyPieChart({ burnedPercentage }: TotalSupplyPieChartProps) {
    const { data: totalSupplyStr, error, isLoading } = useJsinfobeFetch('supply/total');
    const { data: circulatingSupplyStr, error: circulatingSupplyError, isLoading: circulatingSupplyLoading } = useJsinfobeFetch('supply/circulating');

    // Use default values if loading or error
    const totalSupply = parseInt(totalSupplyStr || '985088593');
    const circulatingSupply = parseInt(circulatingSupplyStr || '277075327');
    const burnedAmount = (totalSupply * burnedPercentage) / 100;
    const lockedSupply = totalSupply - burnedAmount - circulatingSupply;

    // Calculate percentages
    const circulatingPercentage = (circulatingSupply / totalSupply) * 100;
    const lockedPercentage = (lockedSupply / totalSupply) * 100;

    const pieData = [
        {
            id: 1,
            value: circulatingSupply,
            label: `Circulating Supply (${circulatingPercentage.toFixed(2)}%)`
        },
        {
            id: 2,
            value: burnedAmount,
            label: `Burned Supply (${burnedPercentage.toFixed(2)}%)`
        },
        {
            id: 3,
            value: lockedSupply,
            label: `Locked Supply (${lockedPercentage.toFixed(2)}%)`
        }
    ];

    const valueFormatter = (value: any) => {
        return `${(value.value / 1e6).toFixed(2)}M LAVA`;
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex-1" />
                <CardTitle className="text-lg font-large text-center" style={{ fontSize: '1.2rem' }}>
                    Total Supply Distribution
                </CardTitle>
                <div className="flex-1 flex justify-end">
                    <PieChartIcon className="h-5 w-5 text-muted-foreground" />
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-0" style={{ marginBottom: '30px' }}>
                <ThemeProvider theme={darkTheme}>
                    <CssBaseline />
                    <div className="relative z-0 flex justify-center w-full">
                        <PieChart
                            series={[
                                {
                                    arcLabel: (item) => `${((item.value / totalSupply) * 100).toFixed(1)}%`,
                                    arcLabelMinAngle: 45,
                                    data: pieData,
                                    highlightScope: { fade: 'global', highlight: 'item' },
                                    faded: { innerRadius: 40, additionalRadius: -40, color: 'gray' },
                                    valueFormatter,
                                },
                            ]}
                            margin={{ top: 20, bottom: 80, left: 20, right: 20 }}
                            height={400}
                            width={undefined}
                            sx={{
                                width: '100%',
                                height: 'auto',
                                maxWidth: '100%'
                            }}
                            slotProps={{
                                legend: {
                                    direction: 'row',
                                    position: { vertical: 'bottom', horizontal: 'middle' },
                                    padding: 0,
                                    itemMarkWidth: 15,
                                    itemMarkHeight: 15,
                                    markGap: 8,
                                    itemGap: 20,
                                    labelStyle: {
                                        fill: '#FAFAFA',
                                        fontSize: 16,
                                    },
                                },
                            }}
                            tooltip={{
                                trigger: 'item'
                            }}
                        />
                    </div>
                </ThemeProvider>
            </CardContent>
        </Card>
    );
}