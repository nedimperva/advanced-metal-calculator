import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import ProductPreview from './ProductPreview';
import ProductModal from './ProductModal';
import { loadProducts, deleteProduct, saveProduct } from '../../utils/products';
import { theme } from '../../theme';
import LoadingSpinner from '../common/LoadingSpinner';

import { saveCalculation, loadSavedCalculations } from '../../utils/storage';

const ProductsView = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalMode, setModalMode] = useState('view');
  
  // State for per-product quantity and price
  const [productQuantities, setProductQuantities] = useState({});
  const [productPrices, setProductPrices] = useState({});
  const [addedProductIds, setAddedProductIds] = useState([]); // for success indicator

  
  // Fetch products on component mount
  useEffect(() => {
    loadProductsList();
  }, []);
  
  const loadProductsList = () => {
    setLoading(true);
    const productList = loadProducts();
    setProducts(productList);
    setLoading(false);
  };

  const handleView = (product) => {
    setCurrentProduct(product);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    // Create a blank product object with required fields
    setCurrentProduct({
      id: Date.now().toString(),
      name: '',
      description: '',
      components: [],
      totalWeight: 0,
      updatedAt: new Date().toISOString(),
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm(t('deleteProductConfirmation'))) {
      await deleteProduct(productId);
      loadProductsList();
    }
  };

  const handleModalClose = (refreshData = false) => {
    setIsModalOpen(false);
    setModalMode('view');
    setCurrentProduct(null);
    if (refreshData) {
      loadProductsList();
    }
  };

  const filteredProducts = searchQuery
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : products;

  // Handler to add product to calculations
  const handleAddToCalculation = (product) => {
    // Calculate total price for the product
    const totalPriceAll = Array.isArray(product.components)
      ? product.components.reduce(
          (sum, c) => sum + (typeof c.totalPrice === 'number' ? c.totalPrice : ((Number(c.pricePerKg) || 0) * (Number(c.weight) || 0) * (Number(c.quantity) || 1))),
          0
        )
      : 0;
    const calculation = {
      id: Date.now().toString(),
      type: 'product',
      name: product.name || 'Product',
      quantity: Number(productQuantities[product.id]) || 1,
      weight: Number(product.totalWeight) || 0,
      totalPrice: Number(totalPriceAll) || 0,
      color: theme.colors.accent1,
      timestamp: new Date().toISOString(),
    };
    saveCalculation(calculation);
    window.dispatchEvent(new Event('calculation-added'));
    setAddedProductIds(ids => [...ids, product.id]);
    setTimeout(() => setAddedProductIds(ids => ids.filter(id => id !== product.id)), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-lg font-bold" style={{ color: theme.colors.text }}>
          {t('products')}
        </h1>

        <button
          onClick={handleAddNew}
          className="px-4 py-4 rounded-lg flex items-center gap-4"
          style={{ backgroundColor: theme.colors.primary, color: 'white' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('addProduct')}
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchProducts')}
          className="w-full px-4 py-4 rounded-lg border"
          style={{ borderColor: theme.colors.border }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-0">
        {filteredProducts.map((product) => {
          const quantity = productQuantities[product.id] || 1;
          const price = productPrices[product.id] !== undefined ? productPrices[product.id] : (product.pricePerUnit || '');
          return (
            <div key={product.id} className="flex flex-col gap-2 border rounded-lg p-2 h-full" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
              <div className="flex-1 flex flex-col">
                <ProductPreview
                  product={{ ...product, quantity, pricePerUnit: price }}
                  onEdit={handleEdit}
                  onDelete={async (id) => {
                    if (window.confirm(t('deleteProductConfirmation'))) {
                      await deleteProduct(id);
                      loadProducts();
                    }
                  }}
                />
              </div>
              <div className="mt-auto pt-2 w-full flex flex-col items-center">
                <div className="w-full max-w-[340px] mx-auto flex flex-row items-end gap-3">
                  <div className="flex flex-col flex-1">
                    <label htmlFor={`quantity-input-${product.id}`} className="block text-xs font-medium mb-1" style={{ color: theme.colors.textLight }}>
                      <svg className="inline mr-1" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12h18M12 3v18"/></svg>
                      {t('quantity')}
                    </label>
                    <input
                      id={`quantity-input-${product.id}`}
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={e => setProductQuantities(q => ({ ...q, [product.id]: Number(e.target.value) }))}
                      className="w-full p-2 border rounded-md focus:ring-2"
                      style={{
                        backgroundColor: theme.colors.background,
                        borderColor: theme.colors.border,
                        color: theme.colors.text,
                        outlineColor: theme.colors.primary
                      }}
                      placeholder={t('quantity')}
                    />
                  </div>
                  <button
                    className={`px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 flex-1 ${addedProductIds.includes(product.id) ? 'opacity-70 cursor-not-allowed' : ''}`}
                    style={{ minHeight: '42px' }}
                    disabled={addedProductIds.includes(product.id)}
                    onClick={() => handleAddToCalculation(product)}
                  >
                    {addedProductIds.includes(product.id) ? (
                      <span className="flex items-center gap-1">{t('added')} <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></span>
                    ) : t('addToCalculation')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        product={currentProduct}
        mode={modalMode}
        onEdit={() => setModalMode('edit')}
        onDelete={async (id) => {
          if (window.confirm(t('deleteProductConfirmation'))) {
            await deleteProduct(id);
            handleModalClose(true);
          }
        }}
        onSave={product => {
          saveProduct(product);
          handleModalClose(true);
        }}
      />
    </div>
  );
};

export default ProductsView;