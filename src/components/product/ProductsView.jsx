import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import ProductPreview from './ProductPreview';
import ProductModal from './ProductModal';
import { loadProducts, deleteProduct, saveProduct } from '../../utils/products';
import { theme } from '../../theme';
import LoadingSpinner from '../common/LoadingSpinner';

import { saveCalculation, loadSavedCalculations } from '../../utils/storage';
import SavedCalculations from '../calculator/SavedCalculations';

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

  // State for calculations panel
  const [showCalculations, setShowCalculations] = useState(false);
  const [calculations, setCalculations] = useState([]);
  const [sidebarPinned, setSidebarPinned] = useState(() => {
    // Persist pin state in localStorage
    try {
      return localStorage.getItem('amc_calculations_sidebar_pinned') === 'true';
    } catch {
      return false;
    }
  });

  // Always show sidebar if pinned
  useEffect(() => {
    if (sidebarPinned && !showCalculations) {
      setShowCalculations(true);
    }
  }, [sidebarPinned, showCalculations]);

  // Load calculations from localStorage
  useEffect(() => {
    if (showCalculations) {
      const saved = localStorage.getItem('savedCalculations');
      if (saved) {
        try {
          setCalculations(JSON.parse(saved));
        } catch (error) {
          setCalculations([]);
        }
      } else {
        setCalculations([]);
      }
    }
  }, [showCalculations]);

  // Listen for calculation changes from other tabs/pages
  useEffect(() => {
    function handleStorageChange(e) {
      if (e.key === 'savedCalculations' && showCalculations) {
        const saved = localStorage.getItem('savedCalculations');
        setCalculations(saved ? JSON.parse(saved) : []);
      }
    }
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [showCalculations]);

  // Delete a calculation
  const handleDeleteCalculation = (id) => {
    const saved = JSON.parse(localStorage.getItem('savedCalculations') || '[]');
    const updated = saved.filter(calc => calc.id !== id);
    localStorage.setItem('savedCalculations', JSON.stringify(updated));
    setCalculations(updated);
  };

  // Clear all calculations
  const handleClearAllCalculations = () => {
    setCalculations([]);
    localStorage.removeItem('savedCalculations');
  };

  
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

      {/* Right Sidebar Toggle Button (floating) */}
      <button
        onClick={() => {
          if (!sidebarPinned) setShowCalculations((v) => !v);
          // If unpinning and sidebar is hidden, allow opening
          if (sidebarPinned && !showCalculations) setShowCalculations(true);
        }}
        className={`fixed top-1/2 right-0 z-40 transform -translate-y-1/2 px-4 py-2 rounded-l-lg border shadow-lg ${sidebarPinned ? 'opacity-60 cursor-not-allowed' : ''}`}
        style={{
          backgroundColor: showCalculations ? theme.colors.accent1 : theme.colors.surface,
          color: showCalculations ? theme.colors.textOnPrimary : theme.colors.text,
          borderColor: theme.colors.border,
          fontWeight: 500,
          borderRight: 'none',
        }}
        title={sidebarPinned ? t('pinnedTooltip') : ''}
      >
        {showCalculations ? t('hideMyCalculations') : t('showMyCalculations')}
      </button>

      {/* Right Sidebar for My Calculations */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] max-w-full z-50 transition-transform duration-300 ease-in-out ${showCalculations ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          boxShadow: showCalculations ? 'rgba(0,0,0,0.15) -4px 0 16px' : 'none',
          backgroundColor: theme.colors.surface,
        }}
        tabIndex={-1}
        aria-modal="true"
        role="dialog"
      >
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center p-2">
            {/* Pin/unpin button */}
            <button
              aria-label={sidebarPinned ? t('unpinCalculations') : t('pinCalculations')}
              title={sidebarPinned ? t('unpinCalculations') : t('pinCalculations')}
              onClick={() => {
                const newPinned = !sidebarPinned;
                setSidebarPinned(newPinned);
                try { localStorage.setItem('amc_calculations_sidebar_pinned', newPinned ? 'true' : 'false'); } catch {}
                // If pinning, always show sidebar
                if (newPinned) setShowCalculations(true);
              }}
              className={`p-2 rounded hover:bg-gray-200 ${sidebarPinned ? 'text-yellow-500' : ''}`}
              style={{ color: sidebarPinned ? theme.colors.accent1 : theme.colors.text }}
            >
              {/* Pin icon */}
              {sidebarPinned ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.293 17.293a1 1 0 001.414 0l6.293-6.293a1 1 0 00-1.414-1.414L11 13.586V3a1 1 0 10-2 0v10.586l-4.293-4.293a1 1 0 00-1.414 1.414l6.293 6.293z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7l-1.41-1.41A2 2 0 0012.17 5H11.83a2 2 0 00-1.42.59L9 7m7 0v12a2 2 0 01-2 2H10a2 2 0 01-2-2V7m7 0H9" /></svg>
              )}
            </button>
            {/* Close button, hidden if pinned */}
            {!sidebarPinned && (
              <button
                aria-label="Close sidebar"
                onClick={() => setShowCalculations(false)}
                className="p-2 rounded hover:bg-gray-200"
                style={{ color: theme.colors.text }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <SavedCalculations
              calculations={calculations}
              onDelete={handleDeleteCalculation}
              onClearAll={handleClearAllCalculations}
            />
          </div>
        </div>
      </div>

      {/* Backdrop overlay */}
      {showCalculations && !sidebarPinned && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-30 transition-opacity duration-300"
          onClick={() => setShowCalculations(false)}
          aria-label="Close sidebar backdrop"
        />
      )}

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