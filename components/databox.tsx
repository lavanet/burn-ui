import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import React from 'react';

interface DataBoxProps {
  title: string;
  value: string | number;
}

export default function DataBox({ title, value }: DataBoxProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <div className="flex items-center gap-2">{title}</div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}