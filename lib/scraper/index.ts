import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractPrices, extractPriceFallback } from '../utils';

export async function scrapeAmazonProduct(url: string) {
    if (!url) return;
    
    // Initialize variables at a broader scope
    let title = '';
    let currentPrice: string | undefined = undefined;
    let originalPrice: string | undefined = undefined;
    let outOfStock: boolean |string | undefined;
    let imageUrls: string[] = [];
    let discountRate: string | undefined = undefined;
    
    //BrightData proxy configuration
    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);
    const port = 2225;
    const session_id = (1000000 * Math.random()) | 0;

    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password,
        },
        host: `brd.superproxy.io`,
        port,
        rejectUnauthorized: false,
    };

    try {
        //Fetch the product page
        const response = await axios.get(url, options);
        const $ = cheerio.load(response.data);
        
        //Extract the product title
        title = $('#productTitle').text().trim();
        let result = await extractPrices(url);
        const images = 
            $('#imgBlkFront').attr('data-a-dynamic-image') ||
            $('#landingImage').attr('data-a-dynamic-image') ||
            '{}';
        imageUrls = Object.keys(JSON.parse(images));
         
        if ('error' in result) {
            console.log(result.error); // Handle the error case
        } else {
            currentPrice = result.currentPrice;
            originalPrice = result.listPrice;
            outOfStock = result.outOfStock;
            discountRate = result.discountRate || '';
        }

        // If the URL does not include 'amazon.com', use the fallback
        if (!url.includes('amazon.com')) {
            let fallbackResult = await extractPriceFallback($);
            currentPrice = fallbackResult.fullPrice;
            originalPrice = fallbackResult.listPrice;
            outOfStock = fallbackResult.outOfStock;
            discountRate = fallbackResult.discountRate;
            // Adjust discountRate based on fallbackResult if available
        }

        const data = {
            url,
            // currency: currency
            image: imageUrls[0],
            title,
            currentPrice: currentPrice, //might have to convert to number
            originalPrice: originalPrice, //might have to convert to number
            priceHistory: [],
            discountRate: Number(discountRate),
            category: 'category',
            reviewsCount: 100,
            stars: 4.5,
            isOutOfStock: outOfStock,
        }
        
        console.log(data);
        
    } catch (error:any) {
        throw new Error(`Failed to scrape product: ${error.message}`)
    }
}
