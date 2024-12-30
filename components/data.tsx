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
        <DataBox title="LAVA Burned" value="14,911,406.3" />
        <DataBox title="Annualised LAVA Burn" value=" 14,911,406.3" />
        <DataBox title="% of Total Supply Burned" value="1.49%" />
        <DataBox title="Annualized Burn Percentage" value="1.49%" />
        <DataBox title="Daily Burn Amount" value="40,859.2014,910,608" />
        <DataBox title="Current Supply" value="985,088,593.4" />
    </div>

    </Card>
  );
}