export function extractPrice($: any) {
    const priceSymbol = $('.a-price-symbol').first().text();
    const priceWhole = $('.a-price-whole').first().text().replace(/\s/g, ''); // Remove any spaces
    const priceFraction = $('.a-price-fraction').first().text();

    // Construct the full price string
    const fullPrice = `${priceSymbol}${priceWhole}${priceFraction}`;

    return fullPrice;
}