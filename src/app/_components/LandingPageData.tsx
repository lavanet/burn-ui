"use client"

import { DataBox } from "@burn/components/databox";
import { Card, CardHeader, CardTitle, CardDescription } from "@burn/components/ui/card";
import {
  Flame,
  CircleDollarSign,
  TrendingUp,
  Calendar,
  CircleOff,
  Coins,
} from "lucide-react";
import React from 'react';
import { TotalSupplyPieChart } from "./TotalSupplyPieChart";
import { CurrentTotalSupplyDataBox } from "./CurrentTotalSupplyDataBox";
import { CurrentCirculatingSupplyDataBox } from "./CurrentCirculatingSupplyDataBox";
import { FAQ, FAQItem } from "@burn/components/faq";
import DistributedRewardsDataBox from "./DistributedRewardsDataBox"

export default function LandingPageData() {
  const faqList: FAQItem[] = [
    {
      question: "How does the burn mechanism work?",
      answer: `Lava has 6.6% of total supply allocated towards incentivizing data providers to join in the early stages of the protocol, when there is less paid demand. This is distributed over 4 years, monthly. Each month, the LAVA allocation is distributed depending on paid demand. Any LAVA allocation not distributed is burned.

In summary: across 4 years, 6.6% is total LAVA supply may be burned depending on Lava RPC demand`
    },
  ];
  return (
    <>
      <CardHeader className="flex flex-col items-center justify-center border-b py-3">
        <CardTitle className="text-3xl font-bold text-center mt-0 mb-3">
          LAVA Burn & Revenue Statistics
        </CardTitle>
      </CardHeader>

      <div className="w-full" style={{ marginTop: '-20px' }}>
        {/* Prominent boxes in their own row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-4">
          <DataBox
            title="Burn % of total supply"
            value="1.49%"
            icon={<Flame className="h-4 w-4" />}
            subtext="Updated daily"
            largeValueText={true}
            className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 h-full"
          />
          <DataBox
            title="Revenue distributed (to stakers)"
            value="$1.06M"
            icon={<Coins className="h-4 w-4" />}
            subtext="Updated daily"
            tooltip="Total rewards distributed to LAVA stakers in USD"
            largeValueText={true}
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 h-full"
          />
        </div>

        <div style={{ marginTop: '10px' }}></div>
        {/* Rest of the boxes in grid */}
        <Card style={{ margin: '15px' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 gap-y-0">
            <DistributedRewardsDataBox />
            <DataBox
              title="LAVA Burned"
              value="14,911,406.3"
              icon={<CircleOff className="h-4 w-4" />}
              subtext="Updated daily"
            />
            <DataBox
              title="Annualised LAVA Burn"
              value="14,911,406.3"
              icon={<TrendingUp className="h-4 w-4" />}
              subtext="Updated daily"
            />
            <DataBox
              title="Average Daily LAVA Burn"
              value="40,859.2"
              icon={<Calendar className="h-4 w-4" />}
              subtext="Updated daily"
              tooltip="Average daily burn amount in LAVA"
            />
            <CurrentTotalSupplyDataBox />
            <CurrentCirculatingSupplyDataBox />
          </div >
        </Card >

        <div style={{ marginTop: '40px' }}></div>

        {/* Full-width pie chart container */}
        <div className="flex justify-center w-full ml-4 pr-7">
          <TotalSupplyPieChart burnedPercentage={1.49} />
        </div>

        <div className="flex justify-center w-full mt-10 ml-6" style={{ paddingRight: '50px' }}>
          <FAQ faqList={faqList} className="w-full" />
        </div>

      </div >
    </>
  );
}
