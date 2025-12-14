const express = require('express');
const { body } = require('express-validator');
const ProductController = require('../controllers/productController');

const router = express.Router();

// Validační pravidla
const productValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Název produktu je povinný')
    .isLength({ min: 3, max: 255 }).withMessage('Název musí mít 3-255 znaků'),
  body('description')
    .optional()
    .trim(),
  body('price')
    .notEmpty().withMessage('Cena je povinná')
    .isFloat({ min: 0 }).withMessage('Cena musí být kladné číslo'),
  body('category')
    .trim()
    .notEmpty().withMessage('Kategorie je povinná'),
  body('stock')
    .notEmpty().withMessage('Skladem je povinné')
    .isInt({ min: 0 }).withMessage('Skladem musí být nezáporné celé číslo'),
  body('image_url')
    .optional()
    .trim()
    .isURL().withMessage('Neplatná URL adresa obrázku')
];

// Routes
router.get('/', ProductController.getAllProducts);
router.get('/categories', ProductController.getCategories);
router.get('/stats/cache', ProductController.getCacheStats);
router.post('/cache/invalidate', ProductController.invalidateCache);
router.post('/stats/cache/reset', ProductController.resetCacheStats);
router.get('/:id', ProductController.getProductById);
router.post('/', productValidation, ProductController.createProduct);
router.put('/:id', productValidation, ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);

module.exports = router;
