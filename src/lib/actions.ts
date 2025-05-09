
'use server';

import type { OFFProduct, OFFSearchResponse, Product, HealthScoreData, OFFProductSummary } from './types';
// generateHealthScore and GenerateHealthScoreInput will be used by a client component's action
// For now, they are not directly used in this file after the modification.

const OPEN_FOOD_FACTS_API_URL = 'https://world.openfoodfacts.org/api/v2';
const OPEN_FOOD_FACTS_CGI_URL = 'https://world.openfoodfacts.org/cgi';

async function fetchOpenFoodFactsProduct(barcode: string): Promise<OFFProduct | null> {
  try {
    const response = await fetch(`${OPEN_FOOD_FACTS_API_URL}/product/${barcode}.json`);
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Product with barcode ${barcode} not found on Open Food Facts.`);
        return null;
      }
      console.error(`Open Food Facts API error for barcode ${barcode}: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    if (data.status === 0 || !data.product) { // Product not found by API or product field missing
        console.log(`Product with barcode ${barcode} not found (API status 0 or no product data).`);
        return null;
    }
    return data as OFFProduct;
  } catch (error) {
    console.error(`Error fetching product ${barcode} from Open Food Facts:`, error);
    return null;
  }
}

export async function getProductDetails(barcode: string): Promise<Product | null> {
  const offProduct = await fetchOpenFoodFactsProduct(barcode);

  if (!offProduct || !offProduct.product) {
    return null;
  }

  const productData = offProduct.product;
  const productName = productData.product_name || productData.product_name_en || 'Unknown Product';
  const ingredients = productData.ingredients_text_with_allergens || productData.ingredients_text || productData.ingredients_text_debug;
  
  const displayImageUrl = productData.image_front_url || productData.image_url || productData.image_small_url;

  const product: Product = {
    barcode: offProduct.code,
    name: productName,
    imageUrl: displayImageUrl,
    ingredients: ingredients,
    brands: productData.brands,
    categories: productData.categories,
    // healthScore and scoreExplanation will be fetched client-side
    apiResponse: offProduct,
  };

  return product;
}

export async function searchProducts(query: string): Promise<Product[]> {
  if (!query.trim()) {
    return [];
  }
  try {
    const searchUrl = `${OPEN_FOOD_FACTS_CGI_URL}/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=true&page_size=20`;
    const response = await fetch(searchUrl);

    if (!response.ok) {
      console.error(`Open Food Facts API search error for query "${query}": ${response.status} ${response.statusText}`);
      return [];
    }
    const data: OFFSearchResponse = await response.json();
    
    if (!data.products || data.products.length === 0) {
      return [];
    }

    return data.products.map((p: OFFProductSummary) => ({
      barcode: p._id, 
      name: p.product_name || p.product_name_en || 'Unknown Product',
      imageUrl: p.image_small_url || p.image_url || p.image_front_small_url,
      brands: p.brands,
      categories: p.categories,
    }));
  } catch (error) {
    console.error(`Error searching products "${query}" from Open Food Facts:`, error);
    return [];
  }
}
