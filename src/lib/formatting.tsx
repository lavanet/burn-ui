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

const formatter = new Intl.NumberFormat('en-US');
export function FormatNumber(value: number): string {
    return formatter.format(value)
}