import DataBox from "@burn/components/databox";
import { Card, CardHeader, CardTitle, CardContent } from "@burn/components/ui/card";

import React from 'react';
import { TotalSupplyPieChart } from "./TotalSupplyPieChart";

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
        <DataBox title="Annualized Burn Percentage" value="1.49%" />
        <DataBox title="LAVA Burned" value="14,911,406.3" />
        <DataBox title="Annualised LAVA Burn" value=" 14,911,406.3" />
        <DataBox title="Daily Burn Amount" value="40,859.2014,910,608" />
        <DataBox title="Current Supply" value="985,088,593.4" />
      </div>

      <TotalSupplyPieChart burnedPercentage={1.49} />
    </>

  );
}
