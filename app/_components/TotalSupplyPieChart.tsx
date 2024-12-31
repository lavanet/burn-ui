"use client"

import React from 'react'
import { PieChart } from '@mui/x-charts/PieChart'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Card, CardContent, CardHeader, CardTitle } from "@burn/components/ui/card"
import { Skeleton } from "@burn/components/ui/skeleton"
import { Loader2 } from "lucide-react"
import { useJsinfobeFetch } from '@burn/fetching/jsinfobe/hooks/useJsinfobeFetch'

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

    if (error) return <div>Failed to load supply data</div>;

    if (isLoading) {
        return (
            <Card className="flex flex-col w-fit" style={{ height: '330px', width: '350px' }}>
                <CardHeader className="items-center pb-0">
                    <CardTitle>
                        <div className="text-[15px] mb-1">Total Supply Distribution</div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center flex-1">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <div className="mt-4 space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const totalSupply = parseInt(totalSupplyStr || '0');
    const burnedAmount = (totalSupply * burnedPercentage) / 100;
    const remainingSupply = totalSupply - burnedAmount;

    const pieData = [
        { id: 1, value: remainingSupply, label: 'Circulating Supply' },
        { id: 2, value: burnedAmount, label: 'Burned Supply' },
    ];

    const valueFormatter = (value: any) => {
        return `${(value.value / 1e6).toFixed(2)}M LAVA`;
    };

    return (
        <Card className="flex flex-col w-fit" style={{ height: '360px' }}>
            <CardHeader className="items-center pb-0">
                <CardTitle>
                    <div className="text-[15px] mb-1">Total Supply Distribution</div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ThemeProvider theme={darkTheme}>
                    <CssBaseline />
                    <PieChart
                        series={[
                            {
                                arcLabel: (item) => `${((item.value / totalSupply) * 100).toFixed(1)}%`,
                                arcLabelMinAngle: 45,
                                data: pieData,
                                highlightScope: { fade: 'global', highlight: 'item' },
                                faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                                valueFormatter,
                            },
                        ]}
                        margin={{ top: 10, bottom: 50, left: 10, right: 10 }}
                        height={300}
                        width={300}
                        slotProps={{
                            legend: {
                                direction: 'row',
                                position: { vertical: 'bottom', horizontal: 'middle' },
                                padding: 0,
                                itemMarkWidth: 10,
                                itemMarkHeight: 10,
                                markGap: 5,
                                itemGap: 10,
                                labelStyle: {
                                    fill: '#FAFAFA',
                                    fontSize: 12,
                                },
                            },
                        }}
                        tooltip={{
                            trigger: 'item'
                        }}
                    />
                </ThemeProvider>
            </CardContent>
        </Card>
    );
}