
    export const currencyFourDecimals = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',

        maximumFractionDigits: 4,
    });
    
    export const currency = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',

        maximumFractionDigits: 2,
    });