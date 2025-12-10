import React from 'react';

function ProductList({ products, loading, onProductClick }) {
  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Načítání produktů...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="loading">
        <p>😔 Žádné produkty nenalezeny</p>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK'
    }).format(price);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Není skladem', class: 'out-of-stock' };
    if (stock < 5) return { text: `Pouze ${stock} ks`, class: 'low-stock' };
    return { text: `Skladem: ${stock} ks`, class: 'in-stock' };
  };

  return (
    <div className="product-grid">
      {products.map(product => {
        const stockStatus = getStockStatus(product.stock);
        
        return (
          <div
            key={product.id}
            className="product-card"
            onClick={() => onProductClick(product.id)}
          >
            <img
              src={product.image_url || 'https://via.placeholder.com/400x200?text=No+Image'}
              alt={product.name}
              className="product-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
              }}
            />
            <div className="product-info">
              <span className="product-category">{product.category}</span>
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-footer">
                <span className="product-price">{formatPrice(product.price)}</span>
                <span className={`product-stock ${stockStatus.class}`}>
                  {stockStatus.text}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ProductList;
