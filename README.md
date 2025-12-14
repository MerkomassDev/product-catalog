
# 🛍️ Product Catalog - Redis Cache Demo

Full-stack webová aplikace pro správu produktového katalogu s implementací Redis cache pro optimalizaci výkonu.

## 🎯 Funkce

- ✅ CRUD operace pro produkty (Create, Read, Update, Delete)
- ⚡ Redis cache pro rychlé načítání dat
- 🔍 Vyhledávání a filtrování produktů
- 📊 Real-time statistiky cache (hit/miss rate)
- 🎨 Moderní React UI
- 🐳 Kompletní Dockerizace
- 📦 PostgreSQL databáze s persistencí

## 🏗️ Architektura

┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│              Port 3000 - Nginx                       │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              Backend (Node.js/Express)               │
│                   Port 5000                          │
└──────────┬────────────────────────┬──────────────────┘
           │                        │
           ▼                        ▼
┌──────────────────┐    ┌──────────────────────────────┐
│  Redis Stack     │    │     PostgreSQL 15            │
│  Port 6379       │    │     Port 5432                │
│  Port 8001 (UI)  │    │                              │
└──────────────────┘    └──────────────────────────────┘

### Cache Flow

1. **Read Request:**
   - Frontend → Backend
   - Backend kontroluje Redis cache
   - **Cache HIT**: Vrátí data z Redis (rychlé ⚡)
   - **Cache MISS**: Načte z PostgreSQL → Uloží do Redis → Vrátí data

2. **Update/Delete:**
   - Frontend → Backend
   - Backend provede operaci v PostgreSQL
   - Invaliduje příslušný klíč v Redis cache

3. **Cache TTL:** 600s (10 minut) - konfigurovatelné

## 🚀 Rychlý start

### Požadavky

- Docker Desktop (nebo Docker + Docker Compose)
- Git
- 4GB+ volné RAM
- Volné porty: 3000, 5000, 5432, 6379, 8001

### Instalace a spuštění

1. **Klonování repozitáře:**
```bash
git clone <repository-url>
cd product-catalog
```

2. **Spuštění aplikace:**
```bash
docker-compose up --build -d
```

3. **Kontrola stavu:**
```bash
docker-compose ps
```

Všechny služby by měly být ve stavu `Up`.

4. **Přístup k aplikaci:**

- 🌐 **Frontend:** http://localhost:3000
- 🔧 **Backend API:** http://localhost:5000
- 🗄️ **RedisInsight:** http://localhost:8001
- 📊 **Health Check:** http://localhost:5000/health

## 📋 API Endpoints

### Products

```
GET    /api/products              - Seznam produktů (s filtrováním)
GET    /api/products/:id          - Detail produktu (s cache)
POST   /api/products              - Vytvoření produktu
PUT    /api/products/:id          - Aktualizace produktu
DELETE /api/products/:id          - Smazání produktu
GET    /api/products/categories   - Seznam kategorií
```

### Cache

```
GET    /api/products/stats/cache       - Cache statistiky
POST   /api/products/cache/invalidate  - Vyprázdnění cache
```

### Query Parameters (GET /api/products)

- `search` - Vyhledávání v názvu
- `category` - Filtr podle kategorie
- `page` - Číslo stránky (default: 1)
- `limit` - Počet položek (default: 10)

## 🧪 Testování Cache

### 1. Cache MISS → HIT test

```bash
# První request (MISS - načte z DB)
curl http://localhost:5000/api/products/1

# Druhý request (HIT - načte z cache)
curl http://localhost:5000/api/products/1
```

Sledujte backend logy:
```bash
docker-compose logs -f backend
```

Měli byste vidět:
```
❌ CACHE MISS - Product ID: 1
💾 Produkt uložen do cache - ID: 1
✅ CACHE HIT - Product ID: 1
```

### 2. Sledování cache statistik

Frontend: Sekce "📊 Cache Statistiky" se aktualizuje každých 5 sekund

Backend:
```bash
curl http://localhost:5000/api/products/stats/cache
```

### 3. RedisInsight UI

1. Otevřete http://localhost:8001
2. Připojte se k Redis (host: redis, port: 6379)
3. Sledujte klíče s prefixem `product:*`

### 4. Test invalidace

```bash
# Aktualizace produktu (vyprázdní cache)
curl -X PUT http://localhost:5000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Product","price":999,...}'

# Následný request bude MISS (cache byla invalidována)
curl http://localhost:5000/api/products/1
```

## 🛠️ Užitečné příkazy

### Docker Compose

```bash
# Spuštění
docker-compose up -d

# Rebuild a spuštění
docker-compose up --build -d

# Zastavení
docker-compose down

# Zastavení + smazání volumes (DATA LOSS!)
docker-compose down -v

# Zobrazení logů
docker-compose logs -f

# Logy konkrétní služby
docker-compose logs -f backend
docker-compose logs -f redis

# Restart služby
docker-compose restart backend
```

### Přímý přístup k službám

```bash
# PostgreSQL
docker-compose exec postgres psql -U postgres -d productdb

# Redis CLI
docker-compose exec redis redis-cli

# Backend shell
docker-compose exec backend sh
```

### Databázové operace

```bash
# Backup databáze
docker-compose exec postgres pg_dump -U postgres productdb > backup.sql

# Restore databáze
docker-compose exec -T postgres psql -U postgres productdb < backup.sql

# Reset databáze (znovu spustí init.sql)
docker-compose down -v
docker-compose up -d
```

## 📁 Struktura projektu

```
product-catalog/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js      # PostgreSQL konfigurace
│   │   │   └── redis.js         # Redis konfigurace + helpers
│   │   ├── controllers/
│   │   │   └── productController.js
│   │   ├── models/
│   │   │   └── Product.js
│   │   ├── routes/
│   │   │   └── productRoutes.js
│   │   ├── middleware/
│   │   │   └── errorHandler.js
│   │   └── index.js            # Entry point
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProductList.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── ProductForm.jsx
│   │   │   └── CacheStats.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── vite.config.js
│   └── package.json
├── database/
│   └── init.sql                # DB schema + seed data
├── docker-compose.yml
├── .gitignore
└── README.md
```

## ⚙️ Konfigurace

### Environment Variables

#### Backend (.env)

```env
NODE_ENV=production
PORT=5000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=productdb
DB_USER=postgres
DB_PASSWORD=postgres123
REDIS_HOST=redis
REDIS_PORT=6379
CACHE_TTL=600  # Cache TTL v sekundách
```

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000
```

## 🎨 Cache strategie

### Implementované cache patterns:

1. **Cache-Aside (Lazy Loading)**
   - Data se načítají do cache pouze když jsou poprvé požadována
   - Cache MISS → načti z DB → ulož do cache

2. **Write-Through Invalidation**
   - Při UPDATE/DELETE se ihned invaliduje příslušný klíč
   - Zajišťuje konzistenci dat

3. **TTL (Time To Live)**
   - Automatická expirace po 10 minutách
   - Zabraňuje zastaralým datům v cache

### Výhody:

- ⚡ **Rychlost:** Redis in-memory cache je 10-100x rychlejší než DB
- 📉 **Snížení zátěže DB:** Opakované requesty nemusí chodit do PostgreSQL
- 🔄 **Konzistence:** Automatická invalidace při změnách
- 📊 **Monitoring:** Real-time statistiky hit/miss rate

## 📊 Monitoring a debugování

### Backend logy obsahují:

- ✅ Cache HIT/MISS events
- 💾 Cache set operations
- 🗑️ Cache invalidation events
- 📡 HTTP requests

### Příklad logu:

```
🚀 Server běží na portu 5000
✅ Připojení k PostgreSQL úspěšné
✅ Připojení k Redis úspěšné
2024-01-10T10:15:30.123Z - GET /api/products/1
❌ CACHE MISS - Product ID: 1
💾 Produkt uložen do cache - ID: 1
2024-01-10T10:15:35.456Z - GET /api/products/1
✅ CACHE HIT - Product ID: 1
```

## 🔧 Troubleshooting

### Port již používán

```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess
Stop-Process -Id <PID>

# Linux
lsof -i :3000
kill -9 <PID>
```

### Databáze se neseeds

```bash
# Odstranit volumes a znovu vytvořit
docker-compose down -v
docker-compose up -d
```

### Redis nepřijímá připojení

```bash
# Kontrola Redis služby
docker-compose logs redis

# Restart Redis
docker-compose restart redis
```

### Frontend nezobrazuje data

```bash
# Zkontrolovat API URL
echo $VITE_API_URL

# Zkontrolovat CORS v backend logu
docker-compose logs backend | grep CORS
```

## 🎯 Jak dosáhnout vysokého Cache Hit Rate

### ✅ Správný způsob testování:

```
1. Klikněte na STEJNÝ produkt vícekrát (ne různé produkty!)
2. První klik = MISS (načte z DB)
3. Další kliky = HIT (načte z Redis)

Příklad:
- Klik iPhone (MISS)
- Klik iPhone (HIT)
- Klik iPhone (HIT)
- Klik iPhone (HIT)
= Hit Rate: 75%
```

### ❌ Špatný způsob:

```
- Klik iPhone (MISS)
- Klik MacBook (MISS)
- Klik AirPods (MISS)
= Hit Rate: 0% (všechno jsou první načtení!)
```

### Automatický test:

```bash
# PowerShell - 30 requestů na stejný produkt
for ($i=1; $i -le 30; $i++) {
    curl http://localhost:5000/api/products/1 | Out-Null
}

# Zobraz hit rate
curl http://localhost:5000/api/products/stats/cache
```














































