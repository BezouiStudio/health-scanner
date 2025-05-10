// Types for Open Food Facts API
// Based on https://world.openfoodfacts.org/api/v2/product/[barcode].json and cgi/search.pl

export interface OFFProduct {
  code: string; // This is the barcode for /api/v2/product endpoint
  status: number; // 1 for found, 0 for not found
  status_verbose: string;
  product?: {
    product_name?: string;
    product_name_en?: string;
    image_url?: string;
    image_small_url?: string;
    image_front_url?: string;
    ingredients_text?: string;
    ingredients_text_debug?: string; // Often more raw
    ingredients_text_with_allergens?: string; // Can be useful
    brands?: string;
    categories?: string;
    nutriments?: Record<string, any>;
    // Add other fields from OFF as needed
  };
}

export interface OFFSearchResponse {
  count: number; // Total number of products for the query
  page: number; // Current page number
  page_count: number; // Number of products on the current page (from cgi/search.pl)
  page_size: number; // Number of products per page
  products: OFFProductSummary[]; // List of products
  skip?: number; // from cgi/search.pl
}

export interface OFFProductSummary {
  _id: string; // Barcode from cgi/search.pl results
  code?: string; // Barcode, may be present or same as _id, or from other endpoints
  product_name?: string;
  product_name_en?: string;
  image_url?: string; // cgi/search.pl might use image_url
  image_small_url?: string;
  image_front_small_url?: string; // another option for images
  brands?: string;
  categories?: string;
}

// Internal App Product type
export interface Product {
  barcode: string;
  name: string;
  imageUrl?: string;
  ingredients?: string; // Combined and cleaned ingredients string
  brands?: string;
  categories?: string;
  healthScore?: number;
  scoreExplanation?: string;
  apiResponse?: OFFProduct; // Store raw API response if needed for debugging or more details
  productType?: 'food' | 'cosmetic' | 'unknown'; // Add product type
}

export interface HealthScoreData {
  healthScore: number;
  explanation?: string;
}

// Type for AI-analyzed ingredient
export interface AnalyzedIngredient {
  ingredientName: string;
  category: 'beneficial' | 'neutral' | 'caution' | 'avoid' | 'unknown';
  reasoning?: string;
}
