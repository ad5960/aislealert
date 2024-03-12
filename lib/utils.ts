
import puppeteer from 'puppeteer';

type PriceResult = { currentPrice: string | undefined; listPrice: string| undefined; outOfStock: string| undefined; discountRate: string | undefined};
type ErrorResult = { error: string; };

export async function extractPriceFallback($:any) {
    const priceSymbol = $('.a-price-symbol').first().text();
    const priceWhole = $('.a-price-whole').first().text().replace(/\s/g, ''); // Remove any spaces
    const priceFraction = $('.a-price-fraction').first().text();
    // Construct the full price string
    const fullPrice = `${priceSymbol}${priceWhole}${priceFraction}`;
    
    const corePriceDiv = $('#corePriceDisplay_desktop_feature_div');
    const priceSectionDiv = corePriceDiv.find('div.a-section.a-spacing-small.aok-align-center');
    const priceTextSpan = priceSectionDiv.find('span.a-price.a-text-price');
    const listPrice = priceTextSpan.find('span.a-offscreen').text().trim();

    const availabilitydiv = $('#availability');
    const outOfStock = availabilitydiv.find('span.a-size-medium.a-color-success').text().trim() === 'Currently unavailable.';
    const discountRate = corePriceDiv.find('span.savingsPercentage').text().trim().replace(/[-%]/g, "");

    
    return { fullPrice, listPrice,outOfStock,discountRate };
}


export async function extractPrices(url: string): Promise<PriceResult | ErrorResult> {
    if (!url) return { error: 'URL not provided' };

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.setJavaScriptEnabled(false); // Consider enabling JS if necessary for the page

        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.goto(url, { waitUntil: 'domcontentloaded' });
    
        // Extract both prices in the same page context
        const prices = await page.evaluate(() => {
            const listPriceSpan = document.querySelector('#corePriceDisplay_desktop_feature_div div.a-section.a-spacing-small.aok-align-center span.a-price.a-text-price span.a-offscreen');
            const listPrice = listPriceSpan ? listPriceSpan.textContent?.trim() : 'Price not found';

            const priceWhole = document.querySelector('#corePrice_feature_div .a-price-whole')?.textContent?.trim() ?? '';
            const priceFraction = document.querySelector('#corePrice_feature_div .a-price-fraction')?.textContent?.trim() ?? '';
            const currentPrice = priceWhole && priceFraction ? `${'$'}${priceWhole}${priceFraction}` : 'Price not found';

            const outOfStockElement = document.querySelector('#availability .a-size-medium.a-color-success');
            const outOfStock = outOfStockElement ? outOfStockElement.textContent?.trim() : 'Availability not found';

            const discountRateElement = document.querySelector('#corePriceDisplay_desktop_feature_div .savingsPercentage');
            const discountRate = discountRateElement ? discountRateElement.textContent?.trim().replace(/[-%]/g, "") : 'No discount available';
            
            
            return { currentPrice, listPrice, outOfStock, discountRate, discountRateElement };
        });

        await browser.close();
        return prices; // Returns an object with both prices
    } catch (error:any) {
        console.error(`Failed to scrape product: ${error.message}`);
        return { error: `Failed to scrape product: ${error.message}` };
    }
}