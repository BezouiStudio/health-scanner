
'use server';

import type { OFFProduct, OFFSearchResponse, Product, OFFProductSummary } from './types';

const OPEN_FOOD_FACTS_API_URL = 'https://world.openfoodfacts.org/api/v2';
const OPEN_BEAUTY_FACTS_API_URL = 'https://world.openbeautyfacts.org/api/v2';
const OPEN_FOOD_FACTS_CGI_URL = 'https://world.openfoodfacts.org/cgi';
const OPEN_BEAUTY_FACTS_CGI_URL = 'https://world.openbeautyfacts.org/cgi';


function determineProductType(
  productData: Partial<OFFProduct['product'] & OFFProductSummary>, // Combined type for flexibility
  sourceApi: 'OFF' | 'OBF'
): 'food' | 'cosmetic' | 'unknown' {
  if (sourceApi === 'OBF') return 'cosmetic'; // If explicitly from OBF, it's cosmetic

  const categoriesString = (productData.categories || '').toLowerCase();
  const productNameString = (productData.product_name || productData.product_name_en || '').toLowerCase();
  const ingredientsString = (productData.ingredients_text || productData.ingredients_text_en || '').toLowerCase();

  const cosmeticKeywords = [
    'cosmetic', 'beauty', 'makeup', 'skin care', 'hair care', 'fragrance', 
    'parfum', 'shampoo', 'soap', 'lotion', 'cream', 'mascara', 'lipstick', 
    'eyeliner', 'conditioner', 'body wash', 'deodorant', 'sunscreen'
  ];
  const foodKeywords = ['food', 'drink', 'snack', 'grocery', 'beverage', 'ingredient', 'edible'];

  // Check product name first, as it's often more specific
  if (cosmeticKeywords.some(keyword => productNameString.includes(keyword))) {
    // If product name suggests cosmetic, but categories strongly suggest food, lean towards food or unknown
    if (foodKeywords.some(keyword => categoriesString.includes(keyword)) && !cosmeticKeywords.some(keyword => categoriesString.includes(keyword))) {
      // Conflicting, maybe unknown or prioritize source API if OFF
      return sourceApi === 'OFF' ? 'food' : 'unknown';
    }
    return 'cosmetic';
  }
  if (foodKeywords.some(keyword => productNameString.includes(keyword))) {
    return 'food';
  }

  // Then check categories
  if (cosmeticKeywords.some(keyword => categoriesString.includes(keyword))) {
    return 'cosmetic';
  }
  if (foodKeywords.some(keyword => categoriesString.includes(keyword))) {
    return 'food';
  }
  
  // Check ingredients for common cosmetic bases if other hints are weak
   const cosmeticIngredientMarkers = ['aqua', 'parfum', 'glycerin', 'sodium laureth sulfate', 'dimethicone'];
   if (sourceApi === 'OFF' && cosmeticIngredientMarkers.some(marker => ingredientsString.includes(marker)) && !foodKeywords.some(keyword => categoriesString.includes(keyword) || productNameString.includes(keyword))) {
       // If from OFF but ingredients look very cosmetic-like and no food indicators
       return 'cosmetic';
   }

  // Default based on source API if no strong indicators
  return sourceApi === 'OFF' ? 'food' : 'unknown';
}


async function fetchProductFromAPI(apiUrl: string, barcode: string, apiName: 'OFF' | 'OBF'): Promise<OFFProduct | null> {
  try {
    const response = await fetch(`${apiUrl}/product/${barcode}.json?fields=product_name,product_name_en,image_front_url,image_url,image_small_url,ingredients_text,ingredients_text_en,ingredients_text_with_allergens,ingredients_text_debug,brands,categories,nutriments`);
    if (!response.ok) {
      if (response.status === 404) {
        // console.log(`Product with barcode ${barcode} not found on ${apiName} (${apiUrl}).`);
        return null;
      }
      console.error(`API error for barcode ${barcode} from ${apiName} (${apiUrl}): ${response.status} ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    if (data.status === 0 || !data.product) {
      // console.log(`Product with barcode ${barcode} not found (API status 0 or no product data) on ${apiName} (${apiUrl}).`);
      return null;
    }
    return data as OFFProduct;
  } catch (error) {
    console.error(`Error fetching product ${barcode} from ${apiName} (${apiUrl}):`, error);
    return null;
  }
}

function findLocalizedData(productData: any, baseFieldName: string): string {
  // Prioritize English version if available
  if (productData[`${baseFieldName}_en`] && String(productData[`${baseFieldName}_en`]).trim()) {
    return String(productData[`${baseFieldName}_en`]);
  }
  // Fallback to non-suffixed version
  if (productData[baseFieldName] && String(productData[baseFieldName]).trim()) {
    return String(productData[baseFieldName]);
  }
  // Fallback to any other language version (less ideal, but better than nothing for some fields)
  // For critical fields like 'product_name' and 'ingredients_text', this might be okay.
  for (const key in productData) {
    if (key.startsWith(`${baseFieldName}_`) && productData[key] && String(productData[key]).trim()) {
      return String(productData[key]);
    }
  }
  return '';
}

function mapOFFProductToInternalProduct(offProduct: OFFProduct, sourceApi: 'OFF' | 'OBF'): Product | null {
  if (!offProduct || !offProduct.product) {
    return null;
  }
  const productData = offProduct.product;

  const name = (findLocalizedData(productData, 'product_name') || 'Unknown Product').trim();
  
  let ingredients = 
    (findLocalizedData(productData, 'ingredients_text_with_allergens') ||
     findLocalizedData(productData, 'ingredients_text') ||
     (productData.ingredients_text_debug ? String(productData.ingredients_text_debug) : '')).trim();
  
  // Clean up common placeholders for missing ingredients
  if (ingredients.toLowerCase() === "unknown" || ingredients.toLowerCase() === "not available") {
    ingredients = "";
  }

  const displayImageUrl = productData.image_front_url || productData.image_url || productData.image_small_url;
  
  const mappedProduct: Product = {
    barcode: offProduct.code,
    name: name,
    imageUrl: displayImageUrl,
    ingredients: ingredients,
    brands: productData.brands ? String(productData.brands).trim() : undefined,
    categories: productData.categories ? String(productData.categories).trim() : undefined,
    apiResponse: offProduct, // Keep the original response for potential re-evaluation
    productType: 'unknown', // Will be determined later
  };
  
  // Determine product type based on mapped data AND original source
  mappedProduct.productType = determineProductType(productData, sourceApi);

  if (mappedProduct.productType === 'cosmetic' && !ingredients) {
     console.warn(`Cosmetic product (barcode: ${offProduct.code}, name: ${name}) from ${sourceApi} is missing ingredients.`);
  }
   if (mappedProduct.productType === 'cosmetic' && name === 'Unknown Product') {
     console.warn(`Cosmetic product (barcode: ${offProduct.code}) from ${sourceApi} has an unknown name.`);
  }


  return mappedProduct;
}

export async function getProductDetails(barcode: string): Promise<Product | null> {
  let offInternalProduct: Product | null = null;
  let obfInternalProduct: Product | null = null;

  const offProductData = await fetchProductFromAPI(OPEN_FOOD_FACTS_API_URL, barcode, 'OFF');
  if (offProductData) {
    offInternalProduct = mapOFFProductToInternalProduct(offProductData, 'OFF');
  }

  const obfProductData = await fetchProductFromAPI(OPEN_BEAUTY_FACTS_API_URL, barcode, 'OBF');
  if (obfProductData) {
    obfInternalProduct = mapOFFProductToInternalProduct(obfProductData, 'OBF');
  }

  // Logic to decide which product data to use or merge
  if (offInternalProduct && obfInternalProduct) {
    // Both APIs returned data. Prioritize based on product type or completeness.
    // If OBF product seems more "cosmetic" and has ingredients, or if OFF is food-like but OBF has better cosmetic name/ingredients.
    const offType = offInternalProduct.productType;
    const obfType = obfInternalProduct.productType;

    if (obfType === 'cosmetic' && (offType !== 'cosmetic' || !offInternalProduct.ingredients || offInternalProduct.name === 'Unknown Product')) {
        // OBF is definitively cosmetic and OFF is not, or OBF has better core data (ingredients/name)
        // Merge if necessary, preferring OBF for cosmetic-specific fields
        return {
            ...offInternalProduct, // Start with OFF as base
            name: (obfInternalProduct.name !== 'Unknown Product') ? obfInternalProduct.name : offInternalProduct.name,
            ingredients: obfInternalProduct.ingredients || offInternalProduct.ingredients,
            imageUrl: obfInternalProduct.imageUrl || offInternalProduct.imageUrl,
            brands: obfInternalProduct.brands || offInternalProduct.brands,
            categories: obfInternalProduct.categories || offInternalProduct.categories,
            productType: 'cosmetic', // Explicitly set as cosmetic
            apiResponse: obfInternalProduct.apiResponse, // Use OBF response if we primarily rely on its data
        };
    } else if (offType === 'food' && obfType !== 'food') {
        // OFF is food, OBF is not, prefer OFF.
        return offInternalProduct;
    } else {
        // Both might be food or cosmetic, or unknown.
        // General preference for more complete data.
        // If OBF has ingredients and OFF doesn't, and OBF name is not Unknown, it might be a better source.
        if (obfInternalProduct.ingredients && (!offInternalProduct.ingredients || offInternalProduct.ingredients.trim() === '') && obfInternalProduct.name !== 'Unknown Product') {
             return {
                ...offInternalProduct,
                name: obfInternalProduct.name,
                ingredients: obfInternalProduct.ingredients,
                imageUrl: obfInternalProduct.imageUrl || offInternalProduct.imageUrl,
                productType: obfInternalProduct.productType !== 'unknown' ? obfInternalProduct.productType : offInternalProduct.productType,
                apiResponse: obfInternalProduct.apiResponse,
            };
        }
        // Default to OFF if types are similar or unclear, or if OFF has ingredients.
        return offInternalProduct;
    }
  } else if (obfInternalProduct) {
    // Only OBF returned data
    return obfInternalProduct;
  } else if (offInternalProduct) {
    // Only OFF returned data
    return offInternalProduct;
  }

  return null; // No product found on either API
}


export async function searchProducts(query: string): Promise<Product[]> {
  if (!query.trim()) {
    return [];
  }

  const results: Product[] = [];
  const processedBarcodes = new Set<string>();

  // Search Open Food Facts
  try {
    const foodSearchUrl = `${OPEN_FOOD_FACTS_CGI_URL}/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=true&page_size=10`; // smaller page size
    const foodResponse = await fetch(foodSearchUrl);

    if (foodResponse.ok) {
      const foodData: OFFSearchResponse = await foodResponse.json();
      if (foodData.products && foodData.products.length > 0) {
        foodData.products.forEach((p: OFFProductSummary) => {
          if (!processedBarcodes.has(p._id)) {
            results.push({
              barcode: p._id,
              name: (p.product_name_en || p.product_name || 'Unknown Product').trim(),
              imageUrl: p.image_small_url || p.image_url || p.image_front_small_url,
              brands: p.brands ? String(p.brands).trim() : undefined,
              categories: p.categories ? String(p.categories).trim() : undefined,
              productType: determineProductType(p, 'OFF'),
            });
            processedBarcodes.add(p._id);
          }
        });
      }
    } else {
      console.error(`Open Food Facts API search error for query "${query}": ${foodResponse.status} ${foodResponse.statusText}`);
    }
  } catch (error) {
    console.error(`Error searching Open Food Facts for "${query}":`, error);
  }

  // Search Open Beauty Facts
  try {
    const beautySearchUrl = `${OPEN_BEAUTY_FACTS_CGI_URL}/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10`; // smaller page size
    const beautyResponse = await fetch(beautySearchUrl);
    if (beautyResponse.ok) {
      const beautyData: OFFSearchResponse = await beautyResponse.json();
      if (beautyData.products && beautyData.products.length > 0) {
        beautyData.products.forEach((p: OFFProductSummary) => {
          if (!processedBarcodes.has(p._id)) { // Add only if not already added from OFF
            results.push({
              barcode: p._id,
              name: (p.product_name_en || p.product_name || 'Unknown Product').trim(),
              imageUrl: p.image_small_url || p.image_url || p.image_front_small_url,
              brands: p.brands ? String(p.brands).trim() : undefined,
              categories: p.categories ? String(p.categories).trim() : undefined,
              productType: determineProductType(p, 'OBF'),
            });
            processedBarcodes.add(p._id);
          }
        });
      }
    } else {
       console.error(`Open Beauty Facts API search error for query "${query}": ${beautyResponse.status} ${beautyResponse.statusText}`);
    }
  } catch (error) {
    console.error(`Error searching Open Beauty Facts for "${query}":`, error);
  }
  
  // Sort results: cosmetics first, then by name
  results.sort((a, b) => {
    if (a.productType === 'cosmetic' && b.productType !== 'cosmetic') return -1;
    if (a.productType !== 'cosmetic' && b.productType === 'cosmetic') return 1;
    return a.name.localeCompare(b.name);
  });

  return results.slice(0, 20); // Limit total results
}
