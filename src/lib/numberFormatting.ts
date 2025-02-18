export const formatLava = (amount: number) => {
    return amount.toLocaleString(undefined, {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
    })
}

export const formatLavaMillions = (amount: number) => {
    return `${(amount / 1_000_000).toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    })}M`
} 