// Globální error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // PostgreSQL chyby
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: 'Produkt s tímto názvem již existuje'
    });
  }

  if (err.code === '22P02') {
    return res.status(400).json({
      success: false,
      error: 'Neplatný formát dat'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Interní chyba serveru',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
