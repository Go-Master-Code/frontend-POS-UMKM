export function formatCurrency(value) {
    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(value);
}

export function formatNumber(value) {
    return new Intl.NumberFormat("id-ID").format(value);
}