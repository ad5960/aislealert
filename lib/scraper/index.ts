import axios from 'axios';
import * as cheerio from 'cheerio';
import { log } from 'console';
import { extractPrices, extractPriceFallback, extractListPrice } from '../utils';

export async function scrapeAmazonProduct(url: string) {
    if (!url) return;
    
    //BrightData proxy configuration
    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);
    const port = 2225
    const session_id = (1000000 * Math.random()) | 0;

    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password,
        },
        host: `brd.superproxy.io`,
        port,
        rejectUnauthorized: false,
    }

    try {
        //Fetch the product page
        const response = await axios.get(url, options);
        const $ = cheerio.load(response.data);
        
        //Extract the product title
        const title = $('#productTitle').text().trim();
        let result = await extractPrices(url);
        if ('error' in result) {
            console.log(result.error); // Handle the error case
        } else {
            // Now TypeScript knows result is of type PriceResult
            let { currentPrice, listPrice: originalPrice } = result;
            if (currentPrice == 'Price not found' || originalPrice =='Price not found') {
                const { fullPrice: currentPrice, listPriceSpan: originalPrice } = extractPriceFallback($)
                console.log({ title, currentPrice, originalPrice });
            }

            else console.log({ title, currentPrice, originalPrice });
        }

        

        
    } catch (error:any) {
        throw new Error(`Failed to scrape product: ${error.message}`)
    }
}