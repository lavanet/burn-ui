import DataBox from "./databox";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

import React from 'react';

export default function Data() {
  return (
    <>
      <CardHeader className="flex flex-col items-center justify-center space-y-0 border-b py-7">
        <CardTitle className="text-3xl font-bold text-center">
          LAVA Token Burn Statistics
        </CardTitle>
      </CardHeader>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 m-1">
        <DataBox title="Burn % of total supply" value="1.49%" largeValueText={true} />
        <DataBox title="Annualized Burn Percentage" value="1.49%" />
        <DataBox title="LAVA Burned" value="14,911,406.3" />
        <DataBox title="Annualised LAVA Burn" value=" 14,911,406.3" />
        <DataBox title="Daily Burn Amount" value="40,859.2014,910,608" />
        <DataBox title="Current Supply" value="985,088,593.4" />
      </div>
    </>

  );
}