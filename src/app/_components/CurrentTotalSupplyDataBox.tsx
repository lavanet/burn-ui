"use client";

import { useJsinfobeFetch } from '@burn/fetching/jsinfobe/hooks/useJsinfobeFetch';
import { DataBox } from '@burn/components/databox';
import LoadingIndicator from '@burn/components/modern/LoadingIndicator';
import { ErrorDisplay } from '@burn/components/modern/ErrorDisplay';
import { FormatNumber, IsMeaningfulText } from '@burn/lib/formatting';

export function CurrentTotalSupplyDataBox() {
    const { data, isLoading, error } = useJsinfobeFetch<string>('supply/total');

    if (isLoading) {
        <LoadingIndicator loadingText="Loading supply" />
    }

    if (error || !IsMeaningfulText(data + "") || !parseFloat(data + "")) {
        <ErrorDisplay message="Failed to load supply" />
    }

    const formattedSupply = FormatNumber(Number(data));

    return (
        <DataBox
            title="Total LAVA Supply"
            value={formattedSupply}
            tooltip="Current total supply of LAVA tokens in LAVA"
        />
    );
}
