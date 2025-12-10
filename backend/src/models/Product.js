const db = require('../config/database');

class Product {
  // Získání všech produktů s možností filtrování
  static async findAll(filters = {}) {
    const { search, category, limit = 50, offset = 0 } = filters;
    
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Vyhledávání podle názvu
    if (search) {
      query += ` AND name ILIKE $${paramCount}`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Filtrování podle kategorie
    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  // Počet produktů (pro stránkování)
  static async count(filters = {}) {
    const { search, category } = filters;
    
    let query = 'SELECT COUNT(*) FROM products WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND name ILIKE $${paramCount}`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    const result = await db.query(query, params);
    return parseInt(result.rows[0].count);
  }

  // Získání produktu podle ID
  static async findById(id) {
    const result = await db.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Vytvoření nového produktu
  static async create(productData) {
    const { name, description, price, category, stock, image_url } = productData;
    
    const result = await db.query(
      `INSERT INTO products (name, description, price, category, stock, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description, price, category, stock, image_url]
    );
    
    return result.rows[0];
  }

  // Aktualizace produktu
  static async update(id, productData) {
    const { name, description, price, category, stock, image_url } = productData;
    
    const result = await db.query(
      `UPDATE products 
       SET name = $1, description = $2, price = $3, category = $4, 
           stock = $5, image_url = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [name, description, price, category, stock, image_url, id]
    );
    
    return result.rows[0];
  }

  // Smazání produktu
  static async delete(id) {
    const result = await db.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  // Získání všech kategorií
  static async getCategories() {
    const result = await db.query(
      'SELECT DISTINCT category FROM products ORDER BY category'
    );
    return result.rows.map(row => row.category);
  }
}

module.exports = Product;
