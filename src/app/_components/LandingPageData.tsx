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
import React, { useState, useEffect } from 'react';
import { TotalSupplyPieChart } from "./TotalSupplyPieChart";
import { CurrentTotalSupplyDataBox } from "./CurrentTotalSupplyDataBox";
import { CurrentCirculatingSupplyDataBox } from "./CurrentCirculatingSupplyDataBox";
import { FAQ, FAQItem } from "@burn/components/faq";
import DistributedRewardsDataBox from "./DistributedRewardsDataBox"
import burnHistoryData from '../burn-rate/data/burn_history.json';

interface BurnBlock {
  day: string;
  block: number;
  supply: number;
  supply_diff: number;
  block_date: string;
  target_date: string;
}

export default function LandingPageData() {
  const calculateTotalBurned = () => {
    return burnHistoryData.blocks.reduce((acc, curr) => acc + (curr.supply_diff || 0), 0);
  };

  const calculateBurnPercentage = () => {
    const initialSupply = 1_000_000_000;
    const totalBurned = calculateTotalBurned();
    return (totalBurned / initialSupply) * 100;
  };

  const calculateAverageDailyBurn = () => {
    if (burnHistoryData.blocks.length === 0) return 0;
    const totalBurned = calculateTotalBurned();
    const days = burnHistoryData.blocks.length * 30;
    return totalBurned / days;
  };

  const calculateAnnualizedBurn = () => {
    const totalBurned = calculateTotalBurned();
    const latestMonthBurn = totalBurned / burnHistoryData.blocks.length;
    return latestMonthBurn * 12;
  };

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
            value={`${calculateBurnPercentage().toFixed(2)}%`}
            icon={<Flame className="h-4 w-4" />}
            subtext="Updated monthly"
            tooltip="Percentage of total initial LAVA supply that has been burned"
            largeValueText={true}
            className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 h-full"
          />
          <DataBox
            title="Revenue distributed (to stakers)"
            value="$1.06M"
            icon={<Coins className="h-4 w-4" />}
            subtext="Updated monthly"
            tooltip="Total USD value of rewards distributed to LAVA stakers"
            largeValueText={true}
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 h-full"
          />
        </div>

        <Card style={{ margin: '15px' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            <DistributedRewardsDataBox />
            <DataBox
              title="LAVA Burned"
              value={calculateTotalBurned().toLocaleString(undefined, { maximumFractionDigits: 1 })}
              icon={<CircleOff className="h-4 w-4" />}
              subtext="Updated daily"
              tooltip="Total amount of LAVA tokens permanently removed from circulation since launch"
            />
            <DataBox
              title="Annualised LAVA Burn"
              value={calculateAnnualizedBurn().toLocaleString(undefined, { maximumFractionDigits: 1 })}
              icon={<TrendingUp className="h-4 w-4" />}
              subtext="Updated daily"
              tooltip="Projected annual burn rate based on the latest month's burn (current month's burn × 12)"
            />
            <DataBox
              title="Average Daily LAVA Burn"
              value={calculateAverageDailyBurn().toLocaleString(undefined, { maximumFractionDigits: 1 })}
              icon={<Calendar className="h-4 w-4" />}
              subtext="Updated daily"
              tooltip="Average amount of LAVA burned per day since the burn mechanism started"
            />
            <CurrentTotalSupplyDataBox />
            <CurrentCirculatingSupplyDataBox />
          </div>
        </Card>

        <div style={{ marginTop: '40px' }}></div>

        {/* Full-width pie chart container */}
        <div className="flex justify-center w-full ml-4 pr-7">
          <TotalSupplyPieChart burnedPercentage={1.62} />
        </div>

        <div className="flex justify-center w-full mt-10 ml-6" style={{ paddingRight: '50px' }}>
          <FAQ faqList={faqList} className="w-full" />
        </div>
      </div>
    </>
  );
}
