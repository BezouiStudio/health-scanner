'use server';

import type { OFFProduct, OFFSearchResponse, Product, HealthScoreData, OFFProductSummary } from './types';
// generateHealthScore and GenerateHealthScoreInput will be used by a client component's action
// For now, they are not directly used in this file after the modification.

const OPEN_FOOD_FACTS_API_URL = 'https://world.openfoodfacts.org/api/v2';
const OPEN_BEAUTY_FACTS_API_URL = 'https://world.openbeautyfacts.org/api/v2';
const OPEN_FOOD_FACTS_CGI_URL = 'https://world.openfoodfacts.org/cgi';

async function fetchProductFromAPI(apiUrl: string, barcode: string): Promise<OFFProduct | null> {
  try {
    const response = await fetch(`${apiUrl}/product/${barcode}.json`);
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Product with barcode ${barcode} not found on ${apiUrl}.`);
        return null;
      }
      console.error(`API error for barcode ${barcode} from ${apiUrl}: ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    if (data.status === 0 || !data.product) {
      console.log(`Product with barcode ${barcode} not found (API status 0 or no product data) on ${apiUrl}.`);
      return null;
    }
    return data as OFFProduct;
  } catch (error) {
    console.error(`Error fetching product ${barcode} from ${apiUrl}:`, error);
    return null;
  }
}

// Helper function to find localized data from product fields
function findLocalizedData(productData: any, baseFieldName: string): string {
  // Prioritize English version if available
  if (productData[`${baseFieldName}_en`]) {
    return String(productData[`${baseFieldName}_en`]);
  }
  // Then try the base field name (often the product's primary language entry)
  if (productData[baseFieldName]) {
    return String(productData[baseFieldName]);
  }
  // Then search for any other language version
  for (const key in productData) {
    if (key.startsWith(`${baseFieldName}_`) && productData[key]) {
      return String(productData[key]); // Return the first one found
    }
  }
  return ''; // Return empty string if no version is found
}

function mapOFFProductToInternalProduct(offProduct: OFFProduct): Product | null {
  if (!offProduct || !offProduct.product) {
    return null;
  }
  const productData = offProduct.product;

  const name = (findLocalizedData(productData, 'product_name') || 'Unknown Product').trim();
  
  let ingredients = 
    (findLocalizedData(productData, 'ingredients_text_with_allergens') ||
    findLocalizedData(productData, 'ingredients_text') ||
    (productData.ingredients_text_debug ? String(productData.ingredients_text_debug) : '')).trim();
  
  const displayImageUrl = productData.image_front_url || productData.image_url || productData.image_small_url;

  return {
    barcode: offProduct.code,
    name: name, // Already includes "Unknown Product" fallback and is trimmed
    imageUrl: displayImageUrl,
    ingredients: ingredients, // Already trimmed
    brands: productData.brands ? String(productData.brands).trim() : undefined,
    categories: productData.categories ? String(productData.categories).trim() : undefined,
    apiResponse: offProduct,
  };
}

export async function getProductDetails(barcode: string): Promise<Product | null> {
  let product: Product | null = null;

  // 1. Try fetching from Open Food Facts
  const offProduct = await fetchProductFromAPI(OPEN_FOOD_FACTS_API_URL, barcode);
  if (offProduct) {
    product = mapOFFProductToInternalProduct(offProduct);
  }

  // 2. If no ingredients from OFF (or product not found on OFF), try Open Beauty Facts
  // This is particularly useful for cosmetics.
  if (!product || !product.ingredients) {
    const obfProductData = await fetchProductFromAPI(OPEN_BEAUTY_FACTS_API_URL, barcode);
    if (obfProductData && obfProductData.product) {
      const obfInternalProduct = mapOFFProductToInternalProduct(obfProductData);
      if (obfInternalProduct) { // Check if mapping was successful
        if (product) { // Product from OFF existed
          // Update ingredients if OBF has them and OFF didn't, or if OBF ingredients are non-empty
          if (obfInternalProduct.ingredients && (!product.ingredients || product.ingredients.trim() === '')) {
            product.ingredients = obfInternalProduct.ingredients;
          }
          
          // Update name if OBF provides a more specific name (not "Unknown Product"),
          // or if the original product name was "Unknown Product"
          if (obfInternalProduct.name !== 'Unknown Product' || product.name === 'Unknown Product') {
            product.name = obfInternalProduct.name;
          }
          
          // Update other fields if OBF might have better cosmetic-specific info
          product.imageUrl = obfInternalProduct.imageUrl || product.imageUrl;
          product.brands = obfInternalProduct.brands || product.brands;
          product.categories = obfInternalProduct.categories || product.categories;
          // If ingredients were updated from OBF, consider its API response more relevant
          if (product.ingredients === obfInternalProduct.ingredients) {
            product.apiResponse = obfInternalProduct.apiResponse; 
          }
        } else { // Product from OFF didn't exist, use OBF product
          product = obfInternalProduct;
        }
      }
    }
  }
  
  // Fallback if product is still null (not found on either API)
  if (!product) {
     return null;
  }

  // Ensure ingredients is a string, even if empty, and name has a final fallback
  if (product) {
    product.ingredients = product.ingredients || '';
    if (!product.name || product.name.trim() === '') {
      product.name = 'Unknown Product';
    }
  }
  
  return product;
}

export async function searchProducts(query: string): Promise<Product[]> {
  if (!query.trim()) {
    return [];
  }
  try {
    // Open Food Facts search is generally more comprehensive for a mixed search
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

    // Map search results. Detailed info (including potential OBF fallback) will be fetched in getProductDetails.
    return data.products.map((p: OFFProductSummary) => ({
      barcode: p._id, 
      name: (p.product_name_en || p.product_name || 'Unknown Product').trim(), // Apply fallback and trim
      imageUrl: p.image_small_url || p.image_url || p.image_front_small_url,
      brands: p.brands ? String(p.brands).trim() : undefined,
      categories: p.categories ? String(p.categories).trim() : undefined,
      // Ingredients and health score will be fetched on the product page.
    }));
  } catch (error) {
    console.error(`Error searching products "${query}" from Open Food Facts:`, error);
    return [];
  }
}

