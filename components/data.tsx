import DataBox from "./databox";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

import React from 'react';

export default function Data() {
  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <CardTitle>
              LAVA Token Burn Statistics
            </CardTitle>
          </div>
        </div>
      </CardHeader>

    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 m-4">
        <DataBox title="LAVA Burned" value="XXXXX" />
        <DataBox title="Annualised LAVA Burn" value="XXXXX" />
        <DataBox title="% of Total Supply Burned" value="XXXXX" />
        <DataBox title="Annualized Burn Percentage" value="XXXXX" />
        <DataBox title="Daily Burn Amount" value="XXXXX" />
        <DataBox title="Current Supply" value="XXXXX" />
    </div>

    </Card>
  );
}