import React, { useState, useEffect } from 'react';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import ProductDetail from './components/ProductDetail';
import CacheStats from './components/CacheStats';
import api from './services/api';

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filtry
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Načtení kategorií při startu
  useEffect(() => {
    loadCategories();
  }, []);

  // Načtení produktů při změně filtrů
  useEffect(() => {
    loadProducts();
  }, [searchTerm, selectedCategory, currentPage]);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Chyba při načítání kategorií:', err);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getProducts({
        search: searchTerm,
        category: selectedCategory,
        page: currentPage,
        limit: 10
      });
      setProducts(response.data);
      setTotalPages(response.pagination.pages);
    } catch (err) {
      setError('Chyba při načítání produktů');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = async (id) => {
    try {
      const product = await api.getProductById(id);
      setSelectedProduct(product);
    } catch (err) {
      console.error('Chyba při načítání detailu produktu:', err);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Opravdu chcete smazat tento produkt?')) {
      return;
    }

    try {
      await api.deleteProduct(id);
      setSelectedProduct(null);
      loadProducts();
    } catch (err) {
      alert('Chyba při mazání produktu');
      console.error(err);
    }
  };

  const handleFormSubmit = async (productData) => {
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productData);
      } else {
        await api.createProduct(productData);
      }
      setIsFormOpen(false);
      setEditingProduct(null);
      loadProducts();
      loadCategories(); // Refresh kategorií pokud byla přidána nová
    } catch (err) {
      throw err;
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleInvalidateCache = async () => {
    if (!window.confirm('Opravdu chcete vyprázdnit celou cache?')) {
      return;
    }

    try {
      await api.invalidateCache();
      alert('Cache byla úspěšně vyprázdněna');
    } catch (err) {
      alert('Chyba při vyprazdňování cache');
      console.error(err);
    }
  };

  return (
    <div className="app">
      <main className="container">
        {/* Cache statistiky */}
        <CacheStats onInvalidate={handleInvalidateCache} />

        {/* Vyhledávání a filtry */}
        <div className="filters">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Vyhledat produkt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="category-select"
            >
              <option value="">Všechny kategorie</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">
              Hledat
            </button>
          </form>

          <button onClick={handleCreateProduct} className="btn btn-success">
            ➕ Nový produkt
          </button>
        </div>

        {/* Error message */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Product List */}
        <ProductList
          products={products}
          loading={loading}
          onProductClick={handleProductClick}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary"
            >
              ← Předchozí
            </button>
            <span className="page-info">
              Stránka {currentPage} z {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary"
            >
              Další →
            </button>
          </div>
        )}

        {/* Product Detail Modal */}
        {selectedProduct && (
          <ProductDetail
            product={selectedProduct.data}
            cacheInfo={selectedProduct.cache}
            onClose={() => setSelectedProduct(null)}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        )}

        {/* Product Form Modal */}
        {isFormOpen && (
          <ProductForm
            product={editingProduct}
            categories={categories}
            onSubmit={handleFormSubmit}
            onClose={() => {
              setIsFormOpen(false);
              setEditingProduct(null);
            }}
          />
        )}
      </main>

    </div>
  );
}

export default App;
