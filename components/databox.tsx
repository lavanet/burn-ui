import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import React from 'react';

interface DataBoxProps {
  title: string;
  value: string | number;
  largeValueText?: boolean;
}

export default function DataBox({ title, value, largeValueText = false }: DataBoxProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`${largeValueText ? 'text-m' : 'text-sm'} font-medium`}>
          <div className="flex items-center gap-2">{title}</div>
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