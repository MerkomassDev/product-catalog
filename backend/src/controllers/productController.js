const Product = require('../models/Product');
const { cacheHelpers } = require('../config/redis');
const { validationResult } = require('express-validator');

// Statistiky pro tracking cache hits/misses
let requestStats = {
  totalRequests: 0,
  cacheHits: 0,
  cacheMisses: 0
};

class ProductController {
  // GET /api/products - Získání všech produktů
  static async getAllProducts(req, res, next) {
    try {
      requestStats.totalRequests++;
      
      const { search, category, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const filters = {
        search,
        category,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const products = await Product.findAll(filters);
      const total = await Product.count({ search, category });

      res.json({
        success: true,
        data: products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        cache: {
          source: 'database'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/products/:id - Získání produktu podle ID (s cache)
  static async getProductById(req, res, next) {
    try {
      requestStats.totalRequests++;
      const { id } = req.params;

      // 1. Pokus o načtení z cache
      let product = await cacheHelpers.getProduct(id);
      let cacheHit = false;

      if (product) {
        // Cache HIT
        cacheHit = true;
        requestStats.cacheHits++;
        console.log(`✅ CACHE HIT - Product ID: ${id}`);
      } else {
        // Cache MISS - načtení z databáze
        requestStats.cacheMisses++;
        console.log(`❌ CACHE MISS - Product ID: ${id}`);
        
        product = await Product.findById(id);
        
        if (!product) {
          return res.status(404).json({
            success: false,
            error: 'Produkt nebyl nalezen'
          });
        }

        // Uložení do cache
        await cacheHelpers.setProduct(id, product);
        console.log(`💾 Produkt uložen do cache - ID: ${id}`);
      }

      res.json({
        success: true,
        data: product,
        cache: {
          hit: cacheHit,
          source: cacheHit ? 'redis' : 'database',
          ttl: process.env.CACHE_TTL || 600
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/products - Vytvoření nového produktu
  static async createProduct(req, res, next) {
    try {
      // Validace
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const product = await Product.create(req.body);

      res.status(201).json({
        success: true,
        data: product,
        message: 'Produkt byl úspěšně vytvořen'
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/products/:id - Aktualizace produktu
  static async updateProduct(req, res, next) {
    try {
      const { id } = req.params;

      // Validace
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const product = await Product.update(id, req.body);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Produkt nebyl nalezen'
        });
      }

      // Invalidace cache pro tento produkt
      await cacheHelpers.deleteProduct(id);
      console.log(`🗑️ Cache invalidována pro produkt ID: ${id}`);

      res.json({
        success: true,
        data: product,
        message: 'Produkt byl úspěšně aktualizován',
        cache: {
          invalidated: true
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/products/:id - Smazání produktu
  static async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;

      const product = await Product.delete(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Produkt nebyl nalezen'
        });
      }

      // Invalidace cache pro tento produkt
      await cacheHelpers.deleteProduct(id);
      console.log(`🗑️ Cache invalidována pro smazaný produkt ID: ${id}`);

      res.json({
        success: true,
        message: 'Produkt byl úspěšně smazán',
        cache: {
          invalidated: true
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/products/categories - Získání seznamu kategorií
  static async getCategories(req, res, next) {
    try {
      const categories = await Product.getCategories();
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/products/stats/cache - Cache statistiky
  static async getCacheStats(req, res, next) {
    try {
      const redisStats = await cacheHelpers.getStats();
      
      res.json({
        success: true,
        data: {
          application: {
            totalRequests: requestStats.totalRequests,
            cacheHits: requestStats.cacheHits,
            cacheMisses: requestStats.cacheMisses,
            hitRate: requestStats.totalRequests > 0
              ? ((requestStats.cacheHits / requestStats.totalRequests) * 100).toFixed(2)
              : 0
          },
          redis: redisStats
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/products/cache/invalidate - Invalidace cache
  static async invalidateCache(req, res, next) {
    try {
      await cacheHelpers.invalidateAll();
      
      res.json({
        success: true,
        message: 'Cache byla úspěšně vyprázdněna'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;
