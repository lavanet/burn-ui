import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import ModernTooltip from "./modern/ModernTooltip";
import React from 'react';

interface DataBoxProps {
  title: string;
  value: string | number;
  largeValueText?: boolean;
  tooltip?: string;
}

export default function DataBox({ title, value, largeValueText = false, tooltip }: DataBoxProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`${largeValueText ? 'text-m' : 'text-sm'} font-medium`}>
          <ModernTooltip title={tooltip}>
            <div className="flex items-center gap-2">{title}</div>
          </ModernTooltip>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`font-bold ${largeValueText ? 'text-3xl' : 'text-2xl'}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}