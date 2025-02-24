export const formatCurrency = (amount: number): string => {
    if (!amount || amount === 0) {
        return 'Free';
    }
    return `$${amount.toFixed(2)}`;
};
