"use client"

import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import ModernTooltip from "./modern/ModernTooltip";
import React from 'react';

interface DataBoxProps {
  title: string;
  value: string;
  tooltip?: string;
  largeValueText?: boolean;
  className?: string;
  subtext?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export function DataBox({ title, value, tooltip, largeValueText = false, className = "", subtext, icon, iconPosition = 'right' }: DataBoxProps) {
  return (
    <div className={`p-4 rounded-lg ${className}`}>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className={`${largeValueText ? 'text-m' : 'text-sm'} font-medium`}>
            <ModernTooltip title={tooltip}>
              <div className="flex items-center gap-2">
                {title}
              </div>
            </ModernTooltip>
          </CardTitle>
          {icon && (
            <span className="text-muted-foreground">
              {icon}
            </span>
          )}
        </CardHeader>
        <CardContent>
          <div className={`font-bold ${largeValueText ? 'text-3xl' : 'text-2xl'}`}>
            {value}
          </div>
          {subtext && (
            <div className="text-sm text-muted-foreground mt-1">
              {subtext}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}