"use server"

import { scrapeAmazonProduct } from "../scraper";

export async function scrapeAndStoreProduct(productURL: string) {
    if (!productURL) return;
    
    try {
        const scrapedProduct = await scrapeAmazonProduct(productURL);
    } catch (error:any) {
        throw new Error(`Failed to create/update product: ${error.message}`)
    }
}