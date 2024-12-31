export const IsMeaningfulText = (text: string): boolean => {
    if (!text) {
        return false;
    }

    const trimmedText = text.trim();
    if (trimmedText === '') {
        return false;
    }

    const trimmedTextLower = trimmedText.toLowerCase();
    const meaninglessValues = ['null', 'undefined', 'none', 'n/a', 'na', 'nil', 'false', '0'];
    if (meaninglessValues.includes(trimmedTextLower)) {
        return false
    }

    return true;
};

const numberFormatter = new Intl.NumberFormat('en-US');
const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

export function FormatNumber(value: number | string): string {
    if (typeof value === 'string') {
        const numericValue = parseFloat(value.replace(/[$,]/g, ''));
        if (isNaN(numericValue)) return value;
        value = numericValue;
    }

    if (typeof value === 'number' && isNaN(value)) return String(value);

    return numberFormatter.format(value);
}

export function FormatDollarValue(value: number | string): string {
    // If value is already a string, try to parse it
    if (typeof value === 'string') {
        // Return original string if it's already formatted correctly
        if (value.startsWith('$') && value.includes(',')) return value;

        // Remove $ and commas, then convert to number
        const numericValue = parseFloat(value.replace(/[$,]/g, ''));
        if (isNaN(numericValue)) return value;
        value = numericValue;
    }

    // Return original value if NaN
    if (typeof value === 'number' && isNaN(value)) return String(value);

    try {
        return currencyFormatter.format(value);
    } catch (e) {
        // If formatting fails, return original value
        return typeof value === 'string' ? value : String(value);
    }
}