const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const productRoutes = require('./routes/productRoutes');
const errorHandler = require('./middleware/errorHandler');
const { testDatabaseConnection } = require('./config/database');
const { testRedisConnection } = require('./config/redis');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Product Catalog API'
  });
});

app.use('/api/products', productRoutes);

// Error handling middleware
app.use(errorHandler);

// Spuštění serveru
const startServer = async () => {
  try {
    // Testování připojení k databázi
    await testDatabaseConnection();
    console.log('✅ Připojení k PostgreSQL úspěšné');

    // Testování připojení k Redis
    await testRedisConnection();
    console.log('✅ Připojení k Redis úspěšné');

    app.listen(PORT, () => {
      console.log(`🚀 Server běží na portu ${PORT}`);
      console.log(`📡 API dostupné na http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Chyba při spouštění serveru:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});
