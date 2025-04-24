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
  {filteredProducts.map((product) => (
    <ProductPreview
      key={product.id}
      product={product}
      onEdit={handleEdit}
      onDelete={async (id) => {
        if (window.confirm(t('deleteProductConfirmation'))) {
          await deleteProduct(id);
          loadProducts();
        }
      }}
    />
  ))}
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