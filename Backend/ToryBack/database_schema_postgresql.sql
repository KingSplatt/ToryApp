-- PostgreSQL Schema for ToryApp (converted from MySQL)
-- This script creates the database schema for PostgreSQL matching the original MySQL structure

-- Categories table
CREATE TABLE categories (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL UNIQUE,
    "Description" VARCHAR(500),
    "IsActive" BOOLEAN DEFAULT TRUE,
    "SortOrder" INTEGER DEFAULT 0,
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories ("Name", "Description", "SortOrder") VALUES
('Electronics', 'Electronic devices and technology', 1),
('Tools', 'Work and DIY tools', 2),
('Books', 'Books and educational materials', 3),
('Home', 'Home articles and household items', 4),
('Collectibles', 'Collectible items', 5),
('Office', 'Office supplies and materials', 6),
('Sports', 'Sports equipment', 7),
('Music', 'Musical instruments and equipment', 8),
('Art', 'Art materials and artwork', 9),
('Other', 'General category', 10);

-- Inventories table with FIXED custom fields (following the specification)
CREATE TABLE inventories (
    "Id" SERIAL PRIMARY KEY,
    "Title" VARCHAR(200) NOT NULL,
    "Description" TEXT, 
    "CategoryId" INTEGER NOT NULL,
    "ImageUrl" VARCHAR(500), 
    "IsPublic" BOOLEAN DEFAULT TRUE,
    "OwnerId" VARCHAR(450) NOT NULL,
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "RowVersion" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Custom ID Format Configuration
    "custom_id_format" TEXT,
    "custom_id_enabled" BOOLEAN DEFAULT FALSE,
    
    -- String fields (up to 3)
    "custom_string1_state" BOOLEAN DEFAULT FALSE,
    "custom_string1_name" VARCHAR(100),
    "custom_string2_state" BOOLEAN DEFAULT FALSE,
    "custom_string2_name" VARCHAR(100),
    "custom_string3_state" BOOLEAN DEFAULT FALSE,
    "custom_string3_name" VARCHAR(100),
    
    -- Integer fields (up to 3)
    "custom_int1_state" BOOLEAN DEFAULT FALSE,
    "custom_int1_name" VARCHAR(100),
    "custom_int2_state" BOOLEAN DEFAULT FALSE,
    "custom_int2_name" VARCHAR(100),
    "custom_int3_state" BOOLEAN DEFAULT FALSE,
    "custom_int3_name" VARCHAR(100),
    
    -- Boolean fields (up to 3)
    "custom_bool1_state" BOOLEAN DEFAULT FALSE,
    "custom_bool1_name" VARCHAR(100),
    "custom_bool2_state" BOOLEAN DEFAULT FALSE,
    "custom_bool2_name" VARCHAR(100),
    "custom_bool3_state" BOOLEAN DEFAULT FALSE,
    "custom_bool3_name" VARCHAR(100),
    
    -- Date fields (up to 3)
    "custom_date1_state" BOOLEAN DEFAULT FALSE,
    "custom_date1_name" VARCHAR(100),
    "custom_date2_state" BOOLEAN DEFAULT FALSE,
    "custom_date2_name" VARCHAR(100),
    "custom_date3_state" BOOLEAN DEFAULT FALSE,
    "custom_date3_name" VARCHAR(100),
    
    -- Decimal fields (up to 3)
    "custom_decimal1_state" BOOLEAN DEFAULT FALSE,
    "custom_decimal1_name" VARCHAR(100),
    "custom_decimal2_state" BOOLEAN DEFAULT FALSE,
    "custom_decimal2_name" VARCHAR(100),
    "custom_decimal3_state" BOOLEAN DEFAULT FALSE,
    "custom_decimal3_name" VARCHAR(100),
    
    FOREIGN KEY ("CategoryId") REFERENCES categories("Id")
);

-- Tags table
CREATE TABLE tags (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(50) NOT NULL UNIQUE,
    "UsageCount" INTEGER DEFAULT 0,
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO tags ("Name", "UsageCount") VALUES
('programming', 1),
('vintage', 1),
('collectible', 1),
('professional', 1),
('home', 1),
('electronic', 1),
('manual', 1),
('rare', 1),
('new', 1),
('used', 1);

-- Inventory tags junction table
CREATE TABLE inventory_tags (
    "InventoryId" INTEGER NOT NULL,
    "TagId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("InventoryId", "TagId"),
    FOREIGN KEY ("InventoryId") REFERENCES inventories("Id") ON DELETE CASCADE,
    FOREIGN KEY ("TagId") REFERENCES tags("Id") ON DELETE CASCADE
);

-- Inventory access table (using PostgreSQL enum-like approach with CHECK constraint)
CREATE TABLE inventory_access (
    "InventoryId" INTEGER NOT NULL,
    "UserId" VARCHAR(450) NOT NULL,
    "AccessLevel" VARCHAR(10) DEFAULT 'Read' CHECK ("AccessLevel" IN ('Read', 'Write', 'Admin')),
    "GrantedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("InventoryId", "UserId"),
    FOREIGN KEY ("InventoryId") REFERENCES inventories("Id") ON DELETE CASCADE
);

-- Items table with FIXED custom field values
CREATE TABLE items (
    "Id" SERIAL PRIMARY KEY,
    "CustomId" VARCHAR(100),
    "InventoryId" INTEGER NOT NULL,
    "Name" VARCHAR(200) NOT NULL,
    "Description" TEXT,
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "RowVersion" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- String field values (corresponding to inventory custom fields)
    "custom_string1_value" TEXT,
    "custom_string2_value" TEXT,
    "custom_string3_value" TEXT,
    
    -- Integer field values
    "custom_int1_value" INTEGER,
    "custom_int2_value" INTEGER,
    "custom_int3_value" INTEGER,
    
    -- Boolean field values
    "custom_bool1_value" BOOLEAN,
    "custom_bool2_value" BOOLEAN,
    "custom_bool3_value" BOOLEAN,
    
    -- Date field values
    "custom_date1_value" TIMESTAMP,
    "custom_date2_value" TIMESTAMP,
    "custom_date3_value" TIMESTAMP,
    
    -- Decimal field values
    "custom_decimal1_value" DECIMAL(18,4),
    "custom_decimal2_value" DECIMAL(18,4),
    "custom_decimal3_value" DECIMAL(18,4),
    
    FOREIGN KEY ("InventoryId") REFERENCES inventories("Id") ON DELETE CASCADE,
    UNIQUE ("InventoryId", "CustomId")
);

-- Discussion posts table
CREATE TABLE discussion_posts (
    "Id" SERIAL PRIMARY KEY,
    "InventoryId" INTEGER NOT NULL,
    "AuthorId" VARCHAR(450) NOT NULL,
    "Content" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "LikesCount" INTEGER DEFAULT 0,
    FOREIGN KEY ("InventoryId") REFERENCES inventories("Id") ON DELETE CASCADE
);

-- Post likes table
CREATE TABLE post_likes (
    "UserId" VARCHAR(450) NOT NULL,
    "PostId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("UserId", "PostId"),
    FOREIGN KEY ("PostId") REFERENCES discussion_posts("Id") ON DELETE CASCADE
);

-- Indexes for performance (PostgreSQL syntax)
CREATE INDEX idx_inventories_owner ON inventories("OwnerId");
CREATE INDEX idx_inventories_created ON inventories("CreatedAt");
CREATE INDEX idx_inventories_public_category ON inventories("IsPublic", "CategoryId");
CREATE INDEX idx_inventories_owner_public ON inventories("OwnerId", "IsPublic");
CREATE INDEX idx_inventories_title ON inventories("Title");

CREATE INDEX idx_items_inventory ON items("InventoryId");
CREATE INDEX idx_items_custom_id ON items("InventoryId", "CustomId");
CREATE INDEX idx_items_name ON items("Name");
CREATE INDEX idx_items_created ON items("CreatedAt");
CREATE INDEX idx_items_inventory_name ON items("InventoryId", "Name");

CREATE INDEX idx_inventory_access_user ON inventory_access("UserId");

CREATE INDEX idx_discussion_posts_inventory ON discussion_posts("InventoryId");
CREATE INDEX idx_discussion_posts_author ON discussion_posts("AuthorId");
CREATE INDEX idx_discussion_posts_created ON discussion_posts("CreatedAt");

-- Update triggers for UpdatedAt columns (PostgreSQL specific)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."UpdatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventories_updated_at 
    BEFORE UPDATE ON inventories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Script completo para agregar triggers de auto-actualización en PostgreSQL
-- Ejecuta este script en tu base de datos de PostgreSQL en Render después de la migración

-- 1. Crear la función que actualiza UpdatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."UpdatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Crear trigger para la tabla inventories
DROP TRIGGER IF EXISTS update_inventories_updated_at ON inventories;
CREATE TRIGGER update_inventories_updated_at 
    BEFORE UPDATE ON inventories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Crear trigger para la tabla items
DROP TRIGGER IF EXISTS update_items_updated_at ON items;
CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Verificar que los triggers se crearon correctamente
SELECT 
    trigger_name, 
    event_object_table, 
    action_timing, 
    event_manipulation 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name IN ('update_inventories_updated_at', 'update_items_updated_at')
ORDER BY event_object_table, trigger_name;

