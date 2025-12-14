# Product Catalog - Redis Cache Demo

Full-stack webová aplikace pro správu produktového katalogu s implementací Redis cache pro optimalizaci výkonu.

## Funkce

- CRUD operace pro produkty (Create, Read, Update, Delete)
- Redis cache pro rychlé načítání dat
- Vyhledávání a filtrování produktů
- Real-time statistiky cache (hit/miss rate)
- Moderní React UI
- Kompletní Dockerizace
- PostgreSQL databáze s persistencí

## Architektura

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                 │
│              Port 3000 - Nginx                      │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              Backend (Node.js/Express)              │
│                   Port 5000                         │
└──────────┬────────────────────────┬─────────────────┘
           │                        │
           ▼                        ▼
┌──────────────────┐    ┌─────────────────────────────┐
│  Redis Stack     │    │     PostgreSQL 15           │
│  Port 6379       │    │     Port 5432               │
│  Port 8001 (UI)  │    │                             │
└──────────────────┘    └─────────────────────────────┘
```


<img width="1855" height="846" alt="image" src="https://github.com/user-attachments/assets/dbd2cfe1-1e2a-4ed4-9565-32e3345cab89" />


### Cache Flow

- Data se načítají primárně z Redis cache
- Při absenci v cache se načtou z PostgreSQL
- Načtená data se uloží do cache s expirací 10 minut
- Při aktualizaci/smazání se cache invaliduje

1. **Read Request:**
   - Frontend → Backend
   - Backend kontroluje Redis cache
   - **Cache HIT**: Vrátí data z Redis 
   - **Cache MISS**: Načte z PostgreSQL → Uloží do Redis → Vrátí data

2. **Update/Delete:**
   - Frontend → Backend
   - Backend provede operaci v PostgreSQL
   - Invaliduje příslušný klíč v Redis cache

3. **Cache TTL:** 600s (10 minut) - konfigurovatelné


## Požadavky

Před spuštěním aplikace je potřeba mít nainstalováno:

- **Docker** verze 20.10 nebo vyšší
- **Docker Compose** verze 2.0 nebo vyšší
- **Git**

Ověření verzí:
```bash
docker --version
docker-compose --version
git --version
```


### Instalace a spuštění

1. **Klonování repozitáře:**
```bash
git clone https://github.com/MerkomassDev/product-catalog
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

4. **Přístup k aplikaci:**

- **Frontend:** http://localhost:3000
- **RedisInsight:** http://localhost:8001

5. **Ukončení:**

```bash
docker-compose down -v  # Odstranění dat
```


## Přidání produktu

<img width="569" height="802" alt="image" src="https://github.com/user-attachments/assets/e3fcba3b-8298-4fbe-a929-4c2518f65cf9" />


## Vyhledávání produktu

<img width="766" height="108" alt="image" src="https://github.com/user-attachments/assets/3ed7a9d9-0c71-480c-b3e8-6f3499673de5" />


## Detail produktu

<img width="384" height="662" alt="image" src="https://github.com/user-attachments/assets/01632c3d-bae1-40d2-8a52-6ee42aea2d9c" />


## Testování Cache

### Správný způsob testování:

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

<img width="1064" height="540" alt="image" src="https://github.com/user-attachments/assets/31a47b44-4051-4e1b-8cff-2e8e36b79814" />

<img width="778" height="132" alt="image" src="https://github.com/user-attachments/assets/bcca795b-7681-4ba2-a07c-69631f8c9671" />

### Špatný způsob:

```
- Klik iPhone (MISS)
- Klik MacBook (MISS)
- Klik AirPods (MISS)
= Hit Rate: 0% (všechno jsou první načtení!)
```

<img width="764" height="119" alt="image" src="https://github.com/user-attachments/assets/d29a309d-048c-42f7-bb4f-8577c974f852" />


## Cache strategie

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

- **Rychlost:** Redis in-memory cache je 10-100x rychlejší než DB
- **Snížení zátěže DB:** Opakované requesty nemusí chodit do PostgreSQL
- **Konzistence:** Automatická invalidace při změnách
- **Monitoring:** Real-time statistiky hit/miss rate


## Struktura projektu

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

## Konfigurace

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


## Monitoring a debugování

### Backend logy obsahují:

- Cache HIT/MISS events
- Cache set operations
- Cache invalidation events
- HTTP requests


## API Endpoints

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
