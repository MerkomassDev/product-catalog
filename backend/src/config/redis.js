const { createClient } = require('redis');

// Vytvoření Redis klienta
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    // Retry strategie
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('❌ Příliš mnoho pokusů o připojení k Redis');
        return new Error('Redis reconnect failed');
      }
      return retries * 100; // Exponenciální backoff
    }
  }
});

// Event handlers
redisClient.on('connect', () => {
  console.log('🔌 Připojování k Redis...');
});

redisClient.on('ready', () => {
  console.log('✅ Redis klient připraven');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis chyba:', err);
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Reconnecting k Redis...');
});

// Připojení k Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Chyba při připojování k Redis:', error);
  }
})();

// Testování připojení
const testRedisConnection = async () => {
  try {
    await redisClient.ping();
    return true;
  } catch (error) {
    console.error('Chyba při testování Redis připojení:', error);
    throw error;
  }
};

// Helper funkce pro cache operace
const CACHE_PREFIX = 'product:';
const CACHE_TTL = parseInt(process.env.CACHE_TTL) || 600; // 10 minut default

const cacheHelpers = {
  // Získání produktu z cache
  getProduct: async (id) => {
    try {
      const data = await redisClient.get(`${CACHE_PREFIX}${id}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Chyba při čtení z cache:', error);
      return null;
    }
  },

  // Uložení produktu do cache
  setProduct: async (id, product) => {
    try {
      await redisClient.setEx(
        `${CACHE_PREFIX}${id}`,
        CACHE_TTL,
        JSON.stringify(product)
      );
      return true;
    } catch (error) {
      console.error('Chyba při zápisu do cache:', error);
      return false;
    }
  },

  // Smazání produktu z cache
  deleteProduct: async (id) => {
    try {
      await redisClient.del(`${CACHE_PREFIX}${id}`);
      return true;
    } catch (error) {
      console.error('Chyba při mazání z cache:', error);
      return false;
    }
  },

  // Invalidace všech produktů
  invalidateAll: async () => {
    try {
      const keys = await redisClient.keys(`${CACHE_PREFIX}*`);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Chyba při invalidaci cache:', error);
      return false;
    }
  },

  // Získání cache statistik
  getStats: async () => {
    try {
      const info = await redisClient.info('stats');
      const keys = await redisClient.keys(`${CACHE_PREFIX}*`);
      
      // Parsing Redis INFO stats
      const stats = {};
      info.split('\r\n').forEach(line => {
        const [key, value] = line.split(':');
        if (key && value) {
          stats[key] = value;
        }
      });

      return {
        cachedProducts: keys.length,
        totalKeys: await redisClient.dbSize(),
        hits: parseInt(stats.keyspace_hits) || 0,
        misses: parseInt(stats.keyspace_misses) || 0,
        hitRate: stats.keyspace_hits && stats.keyspace_misses 
          ? ((parseInt(stats.keyspace_hits) / (parseInt(stats.keyspace_hits) + parseInt(stats.keyspace_misses))) * 100).toFixed(2)
          : 0
      };
    } catch (error) {
      console.error('Chyba při získávání statistik:', error);
      return {
        cachedProducts: 0,
        totalKeys: 0,
        hits: 0,
        misses: 0,
        hitRate: 0
      };
    }
  }
};

module.exports = {
  redisClient,
  testRedisConnection,
  cacheHelpers
};
