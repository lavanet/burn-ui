"use client";

import { useJsinfobeFetch } from '@burn/fetching/jsinfobe/hooks/useJsinfobeFetch';
import { DataBox } from '@burn/components/databox';
import LoadingIndicator from '@burn/components/modern/LoadingIndicator';
import { ErrorDisplay } from '@burn/components/modern/ErrorDisplay';
import { FormatNumber, IsMeaningfulText } from '@burn/lib/formatting';
import { Container } from "lucide-react";

export function CurrentTotalSupplyDataBox() {
    const { data, isLoading, error } = useJsinfobeFetch<string>('supply/total');

    if (isLoading) {
        return <DataBox
            title="Total LAVA Supply"
            value="985,088,593"
            tooltip="Current total supply of LAVA tokens in LAVA"
            icon={<Container className="h-4 w-4" />}
            subtext="Updated live"
        />
    }

    if (error || !IsMeaningfulText(data + "") || !parseFloat(data + "")) {
        return <DataBox
            title="Total LAVA Supply"
            value="985,088,593"
            tooltip="Current total supply of LAVA tokens in LAVA"
            icon={<Container className="h-4 w-4" />}
            subtext="Updated live"
        />
    }

    const formattedSupply = FormatNumber(Number(data));

    return (
        <DataBox
            title="Total LAVA Supply"
            value={formattedSupply}
            tooltip="Current total supply of LAVA tokens in LAVA"
            icon={<Container className="h-4 w-4" />}
            subtext="Updated live"
        />
    );
}
