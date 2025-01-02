"use client";

import { useJsinfobeFetch } from '@burn/fetching/jsinfobe/hooks/useJsinfobeFetch';
import { DataBox } from '@burn/components/databox';
import LoadingIndicator from '@burn/components/modern/LoadingIndicator';
import { ErrorDisplay } from '@burn/components/modern/ErrorDisplay';
import { FormatNumber, IsMeaningfulText } from '@burn/lib/formatting';
import { CircleDot } from "lucide-react";

export function CurrentCirculatingSupplyDataBox() {
    const { data, isLoading, error } = useJsinfobeFetch<string>('supply/circulating');

    if (isLoading) {
        return <DataBox
            title="Circulating LAVA Supply"
            value="277,075,327"
            tooltip="Current circulating supply of LAVA tokens in LAVA"
            icon={<CircleDot className="h-4 w-4" />}
            subtext="Updated live"
        />
    }

    if (error || !IsMeaningfulText(data + "") || !parseFloat(data + "")) {
        return <DataBox
            title="Circulating LAVA Supply"
            value="277,075,327"
            tooltip="Current circulating supply of LAVA tokens in LAVA"
            icon={<CircleDot className="h-4 w-4" />}
            subtext="Updated live"
        />
    }

    const formattedSupply = FormatNumber(Number(data));

    return (
        <DataBox
            title="Circulating LAVA Supply"
            value={formattedSupply}
            tooltip="Current circulating supply of LAVA tokens in LAVA"
            icon={<CircleDot className="h-4 w-4" />}
            subtext="Updated live"
        />
    );
}
