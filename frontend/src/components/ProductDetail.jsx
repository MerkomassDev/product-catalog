import React from 'react';

function ProductDetail({ product, cacheInfo, onClose, onEdit, onDelete }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            Detail produktu
            {cacheInfo && (
              <span className={`cache-badge ${cacheInfo.hit ? 'hit' : 'miss'}`}>
                {cacheInfo.hit ? '⚡ Cache HIT' : '💾 Cache MISS'}
              </span>
            )}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <img
            src={product.image_url || 'https://via.placeholder.com/600x300?text=No+Image'}
            alt={product.name}
            style={{
              width: '100%',
              height: '300px',
              objectFit: 'cover',
              borderRadius: '8px',
              marginBottom: '20px'
            }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/600x300?text=Image+Not+Found';
            }}
          />

          <h3 style={{ fontSize: '2rem', marginBottom: '10px' }}>{product.name}</h3>
          
          <p style={{ 
            display: 'inline-block',
            padding: '6px 16px',
            background: 'var(--primary)',
            color: 'white',
            borderRadius: '20px',
            fontSize: '0.9rem',
            marginBottom: '20px'
          }}>
            {product.category}
          </p>

          <p style={{ 
            fontSize: '1.1rem', 
            color: '#6c757d', 
            marginBottom: '25px',
            lineHeight: '1.6'
          }}>
            {product.description || 'Bez popisu'}
          </p>

          <div style={{
            background: 'var(--light)',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: '15px'
            }}>
              <div>
                <strong style={{ color: '#6c757d' }}>Cena:</strong>
                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)', margin: '5px 0' }}>
                  {formatPrice(product.price)}
                </p>
              </div>
              <div>
                <strong style={{ color: '#6c757d' }}>Skladem:</strong>
                <p style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold',
                  color: product.stock > 0 ? 'var(--success)' : 'var(--danger)',
                  margin: '5px 0'
                }}>
                  {product.stock} ks
                </p>
              </div>
            </div>
          </div>

          {cacheInfo && (
            <div style={{
              background: cacheInfo.hit ? '#d4edda' : '#fff3cd',
              border: `1px solid ${cacheInfo.hit ? '#c3e6cb' : '#ffc107'}`,
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <strong>ℹ️ Cache Info:</strong>
              <ul style={{ marginTop: '10px', paddingLeft: '20px', lineHeight: '1.8' }}>
                <li><strong>Zdroj dat:</strong> {cacheInfo.source === 'redis' ? 'Redis Cache' : 'PostgreSQL Database'}</li>
                <li><strong>Cache status:</strong> {cacheInfo.hit ? 'HIT ⚡' : 'MISS 💾'}</li>
                {cacheInfo.ttl && <li><strong>TTL:</strong> {cacheInfo.ttl}s</li>}
              </ul>
            </div>
          )}

          <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
            <p><strong>Vytvořeno:</strong> {formatDate(product.created_at)}</p>
            <p><strong>Aktualizováno:</strong> {formatDate(product.updated_at)}</p>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={() => onEdit(product)} className="btn btn-primary">
            ✏️ Upravit
          </button>
          <button onClick={() => onDelete(product.id)} className="btn btn-danger">
            🗑️ Smazat
          </button>
          <button onClick={onClose} className="btn btn-secondary">
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
