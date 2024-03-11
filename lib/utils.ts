import puppeteer from 'puppeteer';


export async function extractPrice(url: string) {
    if (!url) return 'URL not provided';

    try {
        const browser = await puppeteer.launch({ headless: true }); // Ensures Puppeteer runs in headless mode
        const page = await browser.newPage();

        await page.setJavaScriptEnabled(false); // Disables JavaScript to speed up loading

        await page.setRequestInterception(true);
        page.on('request', (req) => {
            // Aborts unnecessary requests to speed up page loading
            if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.goto(url, { waitUntil: 'domcontentloaded' }); // Waits for HTML content to be loaded and parsed

        const price = await page.evaluate(() => {
            const priceWhole = document.querySelector('#corePrice_feature_div .a-price-whole')?.textContent?.trim() ?? '';
            const priceFraction = document.querySelector('#corePrice_feature_div .a-price-fraction')?.textContent?.trim() ?? '';
            return priceWhole && priceFraction ? `${priceWhole}${priceFraction}` : 'Price not found';
        });

        console.log({ price });

        await browser.close();
        return price;
    } catch (error:any) {
        console.error(`Failed to scrape product: ${error.message}`);
        return 'Failed to scrape product';
    }
}

export function extractPriceFallback($:any) {
    const priceSymbol = $('.a-price-symbol').first().text();
    const priceWhole = $('.a-price-whole').first().text().replace(/\s/g, ''); // Remove any spaces
    const priceFraction = $('.a-price-fraction').first().text();

    // Construct the full price string
    const fullPrice = `${priceSymbol}${priceWhole}${priceFraction}`;
    return fullPrice;
}