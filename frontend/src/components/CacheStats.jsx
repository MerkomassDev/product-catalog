import React, { useState, useEffect } from 'react';
import api from '../services/api';

function CacheStats({ onInvalidate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000); // Refresh každých 5 sekund

    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getCacheStats();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Chyba při načítání statistik:', error);
      setLoading(false);
    }
  };

    const handleResetStats = async () => {
    if (!window.confirm('Opravdu chcete resetovat cache statistiky?')) {
      return;
    }

    try {
      await api.resetCacheStats();
      await loadStats(); // Reload stats po resetu
      alert('✅ Statistiky byly resetovány');
    } catch (error) {
      console.error('Chyba při resetování statistik:', error);
      alert('❌ Chyba při resetování statistik');
    }
  };

  if (loading) {
    return (
      <div className="cache-stats">
        <h2>📊 Cache Statistiky</h2>
        <p>Načítání...</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const appStats = stats.application;
  const redisStats = stats.redis;

  return (
    <div className="cache-stats">
      {/* ✅ ZMĚŇ tuto sekci - přidej druhé tlačítko */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h2>📊 Cache Statistiky</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleResetStats} className="btn btn-warning">
            🔄 Resetovat statistiky
          </button>
          <button onClick={onInvalidate} className="btn btn-danger">
            🗑️ Vyprázdnit cache
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{appStats.totalRequests}</div>
          <div className="stat-label">Celkem požadavků</div>
        </div>

        <div className="stat-card success">
          <div className="stat-value">{appStats.cacheHits}</div>
          <div className="stat-label">Cache Hits ⚡</div>
        </div>

        <div className="stat-card warning">
          <div className="stat-value">{appStats.cacheMisses}</div>
          <div className="stat-label">Cache Misses 💾</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{appStats.hitRate}%</div>
          <div className="stat-label">Hit Rate</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{redisStats.cachedProducts}</div>
          <div className="stat-label">Produktů v cache</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{redisStats.totalKeys}</div>
          <div className="stat-label">Celkem klíčů v Redis</div>
        </div>
      </div>

      <div style={{
        marginTop: '15px',
        padding: '15px',
        background: 'var(--light)',
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: '#6c757d'
      }}>
        <strong>ℹ️ Vysvětlení:</strong>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li><strong>Cache Hit:</strong> Produkt byl nalezen v Redis cache (rychlé načtení)</li>
          <li><strong>Cache Miss:</strong> Produkt nebyl v cache, načten z databáze</li>
          <li><strong>Hit Rate:</strong> Poměr cache hits k celkovému počtu požadavků</li>
        </ul>
      </div>
    </div>
  );
}

export default CacheStats;
