-- Vytvoření tabulky produktů
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pro rychlejší vyhledávání
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Seed data (ukázková data)
INSERT INTO products (name, description, price, category, stock, image_url) VALUES
('iPhone 14 Pro', 'Apple iPhone 14 Pro s 256GB úložištěm a ProMotion displejem', 32990.00, 'Mobily', 15, 'https://images.unsplash.com/photo-1678652197950-05ebdb0d82b3?w=400'),
('MacBook Pro 16"', 'Apple MacBook Pro 16" s M2 Pro čipem a 16GB RAM', 79990.00, 'Notebooky', 8, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'),
('AirPods Pro 2', 'Bezdrátová sluchátka s aktivním potlačením hluku', 6990.00, 'Audio', 25, 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400'),
('iPad Air', 'iPad Air s 10.9" Liquid Retina displejem', 19990.00, 'Tablety', 12, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400'),
('Apple Watch Series 9', 'Chytré hodinky s pokročilým fitness trackerem', 12990.00, 'Nositelná elektronika', 20, 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400'),
('Magic Keyboard', 'Bezdrátová klávesnice s numerickou částí', 3490.00, 'Příslušenství', 30, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400'),
('Samsung Galaxy S23', 'Prémiový Android smartphone s výkonným procesorem', 24990.00, 'Mobily', 18, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400'),
('Dell XPS 15', 'Výkonný notebook pro profesionály', 45990.00, 'Notebooky', 6, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400'),
('Sony WH-1000XM5', 'Prémiová bezdrátová sluchátka s ANC', 9990.00, 'Audio', 14, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400'),
('Logitech MX Master 3', 'Ergonomická bezdrátová myš pro produktivitu', 2490.00, 'Příslušenství', 40, 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400');

-- Funkce pro automatickou aktualizaci updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pro aktualizaci timestamps
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
