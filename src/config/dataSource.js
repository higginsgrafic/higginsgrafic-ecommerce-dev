/**
 * Data Source Configuration
 * Gestiona la font de dades dels productes: Mock Data o Supabase
 */

import { mockProducts } from '@/data/mockProducts';
import { productsService } from '@/api/supabase-products';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

/**
 * Get all products from the configured source
 */
export const getProducts = async () => {
  if (USE_MOCK_DATA) {
    console.log('📦 Using MOCK data');
    return mockProducts;
  }

  try {
    console.log('🔄 Fetching products from Supabase...');
    return await productsService.getProducts();
  } catch (error) {
    console.error('❌ Error fetching Supabase products, falling back to mock data:', error);
    return mockProducts;
  }
};

/**
 * Get single product by ID
 */
export const getProductById = async (id) => {
  if (USE_MOCK_DATA) {
    return mockProducts.find(p => p.id === parseInt(id) || p.id === id);
  }

  try {
    return await productsService.getProductById(id);
  } catch (error) {
    console.error('❌ Error fetching Supabase product, falling back to mock data:', error);
    return mockProducts.find(p => p.id === parseInt(id) || p.id === id);
  }
};

/**
 * Search products
 */
export const searchProducts = async (searchTerm) => {
  if (USE_MOCK_DATA) {
    return mockProducts.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  try {
    return await productsService.searchProducts(searchTerm);
  } catch (error) {
    console.error('❌ Error searching Supabase products, falling back to mock data:', error);
    return mockProducts.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
};

/**
 * Get products by collection
 */
export const getProductsByCollection = async (collection) => {
  if (USE_MOCK_DATA) {
    return mockProducts.filter(p => p.collection === collection);
  }

  try {
    return await productsService.getProductsByCollection(collection);
  } catch (error) {
    console.error('❌ Error fetching Supabase collection products, falling back to mock data:', error);
    return mockProducts.filter(p => p.collection === collection);
  }
};

/**
 * Check if using mock data
 */
export const isUsingMockData = () => USE_MOCK_DATA;

/**
 * Get data source name for debugging
 */
export const getDataSourceName = () => USE_MOCK_DATA ? 'Mock Data' : 'Supabase';

export default {
  getProducts,
  getProductById,
  searchProducts,
  getProductsByCollection,
  isUsingMockData,
  getDataSourceName,
};
