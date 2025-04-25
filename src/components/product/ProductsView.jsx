import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import ProductPreview from './ProductPreview';
import ProductModal from './ProductModal';
import { loadProducts, deleteProduct, saveProduct } from '../../utils/products';
import { theme } from '../../theme';
import LoadingSpinner from '../common/LoadingSpinner';

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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
  {filteredProducts.map((product) => {
    const quantity = productQuantities[product.id] || 1;
    const price = productPrices[product.id] !== undefined ? productPrices[product.id] : (product.pricePerUnit || '');
    return (
      <div key={product.id} className="flex flex-col gap-2 border rounded-lg p-4" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
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
        <div className="flex flex-row gap-2 items-center mt-2">
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={e => setProductQuantities(q => ({ ...q, [product.id]: Number(e.target.value) }))}
            className="w-20 px-2 py-1 rounded border"
            style={{ borderColor: theme.colors.border }}
            placeholder={t('quantity')}
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={e => setProductPrices(p => ({ ...p, [product.id]: e.target.value }))}
            className="w-24 px-2 py-1 rounded border"
            style={{ borderColor: theme.colors.border }}
            placeholder={t('pricePerUnit')}
          />
          <button
            className="ml-2 px-4 py-1 rounded bg-orange-500 text-white hover:bg-orange-600"
            onClick={() => {/* TODO: handle add to calculation with product, quantity, price */}}
          >
            {t('addToCalculation')}
          </button>
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