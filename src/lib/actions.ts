'use server';

import type { OFFProduct, OFFSearchResponse, Product, OFFProductSummary } from './types';

const OPEN_FOOD_FACTS_API_URL = 'https://world.openfoodfacts.org/api/v2';
const OPEN_BEAUTY_FACTS_API_URL = 'https://world.openbeautyfacts.org/api/v2';
const OPEN_FOOD_FACTS_CGI_URL = 'https://world.openfoodfacts.org/cgi';

function determineProductType(offProduct: OFFProduct | OFFProductSummary, sourceApi: 'OFF' | 'OBF'): 'food' | 'cosmetic' | 'unknown' {
  if (sourceApi === 'OBF') return 'cosmetic';
  
  const categoriesString = 'categories' in offProduct && typeof offProduct.categories === 'string' 
    ? offProduct.categories.toLowerCase() 
    : 'product' in offProduct && offProduct.product?.categories 
    ? offProduct.product.categories.toLowerCase()
    : '';

  const productNameString = 'product_name' in offProduct && typeof offProduct.product_name === 'string'
    ? offProduct.product_name.toLowerCase()
    : 'product_name_en' in offProduct && typeof offProduct.product_name_en === 'string'
    ? offProduct.product_name_en.toLowerCase()
    : 'product' in offProduct && offProduct.product?.product_name
    ? offProduct.product.product_name.toLowerCase()
    : 'product' in offProduct && offProduct.product?.product_name_en
    ? offProduct.product.product_name_en.toLowerCase()
    : '';

  const cosmeticKeywords = ['cosmetic', 'beauty', 'makeup', 'skin care', 'hair care', 'fragrance', 'parfum', 'shampoo', 'soap', 'lotion', 'cream'];
  const foodKeywords = ['food', 'drink', 'snack', 'grocery', 'beverage', 'ingredient'];

  if (cosmeticKeywords.some(keyword => categoriesString.includes(keyword) || productNameString.includes(keyword))) {
    return 'cosmetic';
  }
  if (foodKeywords.some(keyword => categoriesString.includes(keyword) || productNameString.includes(keyword))) {
    return 'food';
  }
  // If primarily from OFF and no strong cosmetic indicators, assume food
  if (sourceApi === 'OFF') return 'food';
  
  return 'unknown';
}


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

function findLocalizedData(productData: any, baseFieldName: string): string {
  if (productData[`${baseFieldName}_en`]) {
    return String(productData[`${baseFieldName}_en`]);
  }
  if (productData[baseFieldName]) {
    return String(productData[baseFieldName]);
  }
  for (const key in productData) {
    if (key.startsWith(`${baseFieldName}_`) && productData[key]) {
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
  
  const displayImageUrl = productData.image_front_url || productData.image_url || productData.image_small_url;

  return {
    barcode: offProduct.code,
    name: name,
    imageUrl: displayImageUrl,
    ingredients: ingredients,
    brands: productData.brands ? String(productData.brands).trim() : undefined,
    categories: productData.categories ? String(productData.categories).trim() : undefined,
    apiResponse: offProduct,
    productType: determineProductType(offProduct, sourceApi),
  };
}

export async function getProductDetails(barcode: string): Promise<Product | null> {
  let product: Product | null = null;
  let primarySourceApi: 'OFF' | 'OBF' = 'OFF';

  const offProduct = await fetchProductFromAPI(OPEN_FOOD_FACTS_API_URL, barcode);
  if (offProduct) {
    product = mapOFFProductToInternalProduct(offProduct, 'OFF');
    primarySourceApi = 'OFF';
  }

  if (!product || !product.ingredients || product.ingredients.trim() === '') {
    const obfProductData = await fetchProductFromAPI(OPEN_BEAUTY_FACTS_API_URL, barcode);
    if (obfProductData && obfProductData.product) {
      const obfInternalProduct = mapOFFProductToInternalProduct(obfProductData, 'OBF');
      if (obfInternalProduct) {
        if (product) {
          // If OBF has ingredients and OFF didn't (or OFF ingredients were empty)
          if (obfInternalProduct.ingredients && (!product.ingredients || product.ingredients.trim() === '')) {
            product.ingredients = obfInternalProduct.ingredients;
            // If ingredients are taken from OBF, OBF becomes the primary source for type
            product.apiResponse = obfInternalProduct.apiResponse; 
            primarySourceApi = 'OBF';
          }
          
          // Update name if OBF provides a more specific name or if original was "Unknown Product"
          if (obfInternalProduct.name !== 'Unknown Product' || product.name === 'Unknown Product') {
            product.name = obfInternalProduct.name;
          }
          
          product.imageUrl = obfInternalProduct.imageUrl || product.imageUrl;
          product.brands = obfInternalProduct.brands || product.brands;
          product.categories = obfInternalProduct.categories || product.categories;
          
        } else { // Product from OFF didn't exist, use OBF product
          product = obfInternalProduct;
          primarySourceApi = 'OBF';
        }
      }
    }
  }
  
  if (!product) {
     return null;
  }

  // Re-determine product type based on merged data and primary source
  product.productType = determineProductType(product.apiResponse?.product || {categories: product.categories, product_name: product.name}, primarySourceApi);


  product.ingredients = product.ingredients || '';
  if (!product.name || product.name.trim() === '') {
    product.name = 'Unknown Product';
  }
  
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
      // Try searching Open Beauty Facts if Open Food Facts yields no results
      const beautySearchUrl = `https://world.openbeautyfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`;
      const beautyResponse = await fetch(beautySearchUrl);
      if (beautyResponse.ok) {
        const beautyData: OFFSearchResponse = await beautyResponse.json();
        if (beautyData.products && beautyData.products.length > 0) {
          return beautyData.products.map((p: OFFProductSummary) => ({
            barcode: p._id, 
            name: (p.product_name_en || p.product_name || 'Unknown Product').trim(),
            imageUrl: p.image_small_url || p.image_url || p.image_front_small_url,
            brands: p.brands ? String(p.brands).trim() : undefined,
            categories: p.categories ? String(p.categories).trim() : undefined,
            productType: determineProductType(p, 'OBF'),
          }));
        }
      }
      return []; // Return empty if both searches fail
    }

    return data.products.map((p: OFFProductSummary) => ({
      barcode: p._id, 
      name: (p.product_name_en || p.product_name || 'Unknown Product').trim(),
      imageUrl: p.image_small_url || p.image_url || p.image_front_small_url,
      brands: p.brands ? String(p.brands).trim() : undefined,
      categories: p.categories ? String(p.categories).trim() : undefined,
      productType: determineProductType(p, 'OFF'),
    }));
  } catch (error) {
    console.error(`Error searching products "${query}":`, error);
    return [];
  }
}
