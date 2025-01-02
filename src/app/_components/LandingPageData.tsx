"use client"

import { DataBox } from "@burn/components/databox";
import { Card, CardHeader, CardTitle, CardContent } from "@burn/components/ui/card";

import React from 'react';
import { TotalSupplyPieChart } from "./TotalSupplyPieChart";
import { CurrentTotalSupplyDataBox } from "./CurrentTotalSupplyDataBox";
// import AllRewardsSection, { GetTotalRewards } from "./AllRewardsSection";
// import { FormatDollarValue } from "@burn/lib/formatting";
import { CurrentCirculatingSupplyDataBox } from "./CurrentCirculatingSupplyDataBox";

export default function LandingPageData() {
  return (
    <>
      <CardHeader className="flex flex-col items-center justify-center border-b py-3">
        <CardTitle className="text-3xl font-bold text-center mt-0 mb-3">
          LAVA Token Burn Statistics
        </CardTitle>
      </CardHeader>

      <div className="w-full" style={{ marginTop: '-20px' }}>
        {/* Prominent boxes in their own row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-4">
          <DataBox
            title="Burn % of total supply"
            value="1.49%"
            largeValueText={true}
            className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 h-full"
          />
          <DataBox
            title="Revenue distributed (to stakers)"
            value="$1.06M"
            tooltip="Total rewards distributed to LAVA stackers in USD"
            largeValueText={true}
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 h-full"
          />
        </div>

        <div style={{ marginTop: '10px' }}></div>
        {/* Rest of the boxes in grid */}
        <Card style={{ margin: '15px' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 gap-y-0">

            <DataBox title="Already distributed" value="$420K USD" tooltip="Distributed rewards to LAVA stackers in USD on mainnet and testnet" />

            {/* <DataBox
          key="total_rewards"
          title="Revenue"
          value={FormatDollarValue(GetTotalRewards())}
          tooltip="Revenue distributed to LAVA stackers"
        /> */}
            {/* <DataBox title="Annualized Burn Percentage" value="1.49%" /> */}
            <DataBox title="LAVA Burned" value="14,911,406.3" />
            <DataBox title="Annualised LAVA Burn" value="14,911,406.3" />
            <DataBox title="Average Daily LAVA Burn" value="40,859.2" tooltip="Average daily burn amount in LAVA" />
            <CurrentTotalSupplyDataBox />
            <CurrentCirculatingSupplyDataBox />
          </div>
        </Card>

        <div style={{ marginTop: '40px' }}></div>

        {/* Full-width pie chart container */}
        <div className="flex justify-center w-full ml-4 pr-7">
          <TotalSupplyPieChart burnedPercentage={1.49} />
        </div>

        {/* <AllRewardsSection /> */}
      </div >
    </>
  );
}
