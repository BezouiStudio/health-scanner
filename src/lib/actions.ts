
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

function mapOFFProductToInternalProduct(offProduct: OFFProduct): Product | null {
  if (!offProduct || !offProduct.product) {
    return null;
  }
  const productData = offProduct.product;
  const productName = productData.product_name || productData.product_name_en || 'Unknown Product';
  const ingredients = productData.ingredients_text_with_allergens || productData.ingredients_text || productData.ingredients_text_debug || '';
  
  const displayImageUrl = productData.image_front_url || productData.image_url || productData.image_small_url;

  return {
    barcode: offProduct.code,
    name: productName,
    imageUrl: displayImageUrl,
    ingredients: ingredients,
    brands: productData.brands,
    categories: productData.categories,
    apiResponse: offProduct, // Store the raw API response
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
      if (obfInternalProduct && obfInternalProduct.ingredients) {
        // If OBF has ingredients, prioritize its data, especially for cosmetics.
        // If OFF product existed but lacked ingredients, update it. Otherwise, use OBF product.
        if (product) {
          product.ingredients = obfInternalProduct.ingredients;
          // Optionally update other fields if OBF's are better for cosmetics
          product.name = obfInternalProduct.name || product.name;
          product.imageUrl = obfInternalProduct.imageUrl || product.imageUrl;
          product.brands = obfInternalProduct.brands || product.brands;
          product.categories = obfInternalProduct.categories || product.categories;
          product.apiResponse = obfInternalProduct.apiResponse; // Update API response to OBF's
        } else {
          product = obfInternalProduct;
        }
      } else if (!product && obfInternalProduct) { 
        // If product wasn't found on OFF at all, but found on OBF (even without ingredients yet)
        product = obfInternalProduct;
      }
    }
  }
  
  // Fallback if product is still null (not found on either API)
  if (!product) {
     return null;
  }

  // Ensure ingredients is a string, even if empty
  if (product && typeof product.ingredients === 'undefined') {
    product.ingredients = '';
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
      name: p.product_name || p.product_name_en || 'Unknown Product',
      imageUrl: p.image_small_url || p.image_url || p.image_front_small_url,
      brands: p.brands,
      categories: p.categories,
      // Ingredients and health score will be fetched on the product page.
    }));
  } catch (error) {
    console.error(`Error searching products "${query}" from Open Food Facts:`, error);
    return [];
  }
}
