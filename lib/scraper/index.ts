import axios from 'axios';
import * as cheerio from 'cheerio';
import { log } from 'console';
import { extractPrice } from '../utils';

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
        const currentPrice = extractPrice($);

        console.log({ title, currentPrice });
        
    } catch (error:any) {
        throw new Error(`Failed to scrape product: ${error.message}`)
    }
}