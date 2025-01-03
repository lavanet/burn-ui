'use client'

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@burn/components/tables/SortatableTableTooltipBase"
import { ProcessedToken } from './types'

interface TokenTooltipProps {
    totalUsd: number
    tokens: ProcessedToken[]
}

function aggregateTokens(tokens: ProcessedToken[]): ProcessedToken[] {
    const tokenMap = new Map<string, ProcessedToken>()

    tokens.forEach(token => {
        const existing = tokenMap.get(token.denom)
        if (existing) {
            const newAmount = (parseFloat(existing.amount) + parseFloat(token.amount)).toString()
            const newValueUsd = (parseFloat(existing.value_usd.replace('$', '')) +
                parseFloat(token.value_usd.replace('$', ''))).toString()

            tokenMap.set(token.denom, {
                ...token,
                amount: newAmount,
                value_usd: `$${newValueUsd}`
            })
        } else {
            tokenMap.set(token.denom, token)
        }
    })

    return Array.from(tokenMap.values())
}

export default function TokenTooltip({ totalUsd, tokens }: TokenTooltipProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    ${totalUsd.toLocaleString()}
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={5}>
                    <div className="space-y-2">
                        {aggregateTokens(tokens)
                            .sort((a, b) =>
                                parseFloat(b.value_usd.replace('$', '')) -
                                parseFloat(a.value_usd.replace('$', ''))
                            )
                            .map((token, i) => (
                                <div key={i} className="flex justify-between gap-4 min-w-[200px]">
                                    <span className="font-mono">
                                        {parseFloat(token.amount).toLocaleString()} {token.denom}
                                    </span>
                                    <span className="text-muted-foreground font-mono">
                                        ${parseFloat(token.value_usd.replace('$', '')).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
