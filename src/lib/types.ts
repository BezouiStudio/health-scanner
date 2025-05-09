// Types for Open Food Facts API
// Based on https://world.openfoodfacts.org/api/v2/product/[barcode].json

export interface OFFProduct {
  code: string;
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
  page_count: number; // Number of products on the current page
  page_size: number; // Number of products per page
  products: OFFProductSummary[]; // List of products
}

export interface OFFProductSummary {
  code: string;
  product_name?: string;
  product_name_en?: string;
  image_small_url?: string;
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
}

export interface HealthScoreData {
  healthScore: number;
  explanation?: string;
}
