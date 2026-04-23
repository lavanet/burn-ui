"use client"

import { DataBox } from "@burn/components/databox";
import { Card, CardHeader, CardTitle, CardDescription } from "@burn/components/ui/card";
import {
  Flame,
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
import DistributedRewardsDataBox from "./DistributedRewardsDataBox";
import { useInfoFetch } from "@burn/fetching/info/hooks/useInfoFetch";
import { INFO_ENDPOINTS } from "@burn/fetching/info/consts";
import type { BurnRateResponse } from "@burn/fetching/info/types";
import { calculateBurnData } from "../burn-rate/data/burnDataCalculator";

function formatBurnAmount(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export default function LandingPageData() {
  // Full history (months=36 covers every snapshot the indexer emits).
  // The landing stats (cumulative burn, burn %, annualised) are
  // computed from the whole walk — a 12-row default would under-count
  // the total burned by the older months that don't make the cut.
  const { data: burnRate } = useInfoFetch<BurnRateResponse>(
    `${INFO_ENDPOINTS.burnRate}?months=36`,
  );
  const burnData = calculateBurnData(burnRate);
  const monthlyRows = burnData.length;

  // Cumulative burn lives on the last (newest) walked row. During the
  // initial SWR fetch every derived stat is 0 — a brief flash before
  // data lands is preferable to lying with stale hard-coded numbers
  // (the previous PLACEHOLDER_* constants drifted further out of date
  // on every monthly burn).
  const totalBurned = monthlyRows > 0 ? burnData[monthlyRows - 1].cumulativeBurn : 0;
  const burnPercentage = monthlyRows > 0 ? burnData[monthlyRows - 1].burnRate : 0;

  // Preserve the original heuristics: average per-day = total / (months * 30),
  // annualised = last-month burn × 12.
  const averageDailyBurn = monthlyRows > 0 ? totalBurned / (monthlyRows * 30) : 0;
  const annualizedBurn = monthlyRows > 0 ? (totalBurned / monthlyRows) * 12 : 0;

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
            value={`${burnPercentage.toFixed(2)}%`}
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
              value={formatBurnAmount(totalBurned)}
              icon={<CircleOff className="h-4 w-4" />}
              subtext="Updated monthly"
              tooltip="Total amount of LAVA tokens permanently removed from circulation since launch"
            />
            <DataBox
              title="Annualised LAVA Burn"
              value={formatBurnAmount(annualizedBurn)}
              icon={<TrendingUp className="h-4 w-4" />}
              subtext="Updated monthly"
              tooltip="Projected annual burn rate based on the latest month's burn (current month's burn × 12)"
            />
            <DataBox
              title="Average Daily LAVA Burn"
              value={formatBurnAmount(averageDailyBurn)}
              icon={<Calendar className="h-4 w-4" />}
              subtext="Updated monthly"
              tooltip="Average amount of LAVA burned per day since the burn mechanism started"
            />
            <CurrentTotalSupplyDataBox />
            <CurrentCirculatingSupplyDataBox />
          </div>
        </Card>

        <div style={{ marginTop: '40px' }}></div>

        {/* Full-width pie chart container */}
        <div className="flex justify-center w-full ml-4 pr-7">
          <TotalSupplyPieChart burnedPercentage={burnPercentage} />
        </div>

        <div className="flex justify-center w-full mt-10 ml-6" style={{ paddingRight: '50px' }}>
          <FAQ faqList={faqList} className="w-full" />
        </div>
      </div>
    </>
  );
}
