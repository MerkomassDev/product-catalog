const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class API {
  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Něco se pokazilo');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Products
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== '' && v !== null)
    ).toString();

    const data = await this.request(`/api/products?${queryString}`);
    return data;
  }

  async getProductById(id) {
    return await this.request(`/api/products/${id}`);
  }

  async createProduct(productData) {
    return await this.request('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, productData) {
    return await this.request(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id) {
    return await this.request(`/api/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories() {
    const data = await this.request('/api/products/categories');
    return data.data;
  }

  // Cache
  async getCacheStats() {
    const data = await this.request('/api/products/stats/cache');
    return data.data;
  }

  async invalidateCache() {
    return await this.request('/api/products/cache/invalidate', {
      method: 'POST',
    });
  }

  async resetCacheStats() {
    return await this.request('/api/products/stats/cache/reset', {
      method: 'POST',
    });
  }

}

export default new API();
