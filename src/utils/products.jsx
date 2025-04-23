// Products utility functions
const PRODUCTS_KEY = 'metalCalculator.products';

/**
 * Load products from localStorage
 * @returns {Array} Array of product objects
 */
export const loadProducts = () => {
  try {
    const saved = localStorage.getItem(PRODUCTS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
};

/**
 * Save a product to localStorage
 * @param {Object} product - The product to save
 * @returns {Array|null} Updated array of products or null if error
 */
export const saveProduct = (product) => {
  try {
    // Load existing products
    const products = loadProducts();
    
    // Check if this is a new product or an update
    const existingIndex = products.findIndex(p => p.id === product.id);
    let updatedProducts;
    
    if (existingIndex >= 0) {
      // Update existing product
      updatedProducts = [...products];
      updatedProducts[existingIndex] = product;
    } else {
      // Add new product to the beginning of the array
      updatedProducts = [product, ...products];
    }
    
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));
    return updatedProducts;
  } catch (error) {
    console.error('Error saving product:', error);
    return null;
  }
};

/**
 * Delete a product from localStorage
 * @param {string} id - ID of the product to delete
 * @returns {Array|null} Updated array of products or null if error
 */
export const deleteProduct = (id) => {
  try {
    const products = loadProducts();
    const updatedProducts = products.filter(p => p.id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));
    return updatedProducts;
  } catch (error) {
    console.error('Error deleting product:', error);
    return null;
  }
};

/**
 * Calculate total weight of components
 * @param {Array} components - Array of component objects
 * @returns {number} Total weight
 */
export const calculateTotalWeight = (components) => {
  if (!components || !Array.isArray(components)) return 0;
  return components.reduce((sum, component) => {
    return sum + ((component.weight || 0) * (component.quantity || 1));
  }, 0);
};

/**
 * Calculate total price for a product based on pricePerKg
 * @param {Object} product - The product
 * @param {number} pricePerKg - Price per kg
 * @returns {number} Total price
 */
export const calculateProductPrice = (product, pricePerKg = 0) => {
  if (!product || !product.totalWeight) return 0;
  return product.totalWeight * pricePerKg;
};