"use client"

import DataBox from "@burn/components/databox";
import { Card, CardHeader, CardTitle, CardContent } from "@burn/components/ui/card";

import React from 'react';
import { TotalSupplyPieChart } from "./TotalSupplyPieChart";
import { CurrentSupplyDataBox } from "./CurrentSupplyDataBox";
import AllRewardsSection, { GetTotalRewards } from "./AllRewardsSection";
import { FormatDollarValue } from "@burn/lib/formatting";

export default function LandingPageData() {
  return (
    <>
      <CardHeader className="flex flex-col items-center justify-center border-b py-3">
        <CardTitle className="text-3xl font-bold text-center mt-0 mb-3">
          LAVA Token Burn Statistics
        </CardTitle>
      </CardHeader>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 m-1 mt-0">
        <DataBox title="Burn % of total supply" value="1.49%" largeValueText={true} />

        <DataBox title="Total rewards" value="$1.06M" tooltip="Total rewards distributed to LAVA stackers in USD" />
        <DataBox title="Distributed rewards" value="$413,416" tooltip="Distributed rewards to LAVA stackers in USD" />

        {/* <DataBox
          key="total_rewards"
          title="Revenue"
          value={FormatDollarValue(GetTotalRewards())}
          tooltip="Revenue distributed to LAVA stackers"
        /> */}
        {/* <DataBox title="Annualized Burn Percentage" value="1.49%" /> */}
        <DataBox title="LAVA Burned" value="14,911,406.3" />
        <DataBox title="Annualised LAVA Burn" value="14,911,406.3" />
        <DataBox title="Average Daily Burn Amount" value="40,859.2" tooltip="Average daily burn amount in LAVA" />
        <CurrentSupplyDataBox />
      </div>

      <TotalSupplyPieChart burnedPercentage={1.49} />

      {/* <AllRewardsSection /> */}
    </>

  );
}
