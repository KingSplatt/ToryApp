CREATE DATABASE inventorydb;
USE inventorydb;

-- Categories table (unchanged)
CREATE TABLE categories (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL UNIQUE,
    Description VARCHAR(500),
    IsActive BOOLEAN DEFAULT TRUE,
    SortOrder INT DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (Name, Description, SortOrder) VALUES
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

-- NEW: Inventories table with FIXED custom fields (following the specification)
CREATE TABLE inventories (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Title VARCHAR(200) NOT NULL,
    Description TEXT, 
    CategoryId INT NOT NULL,
    ImageUrl VARCHAR(500), 
    IsPublic BOOLEAN DEFAULT TRUE,
    OwnerId VARCHAR(450) NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    RowVersion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- String fields (up to 3)
    custom_string1_state BOOLEAN DEFAULT FALSE,
    custom_string1_name VARCHAR(100),
    custom_string2_state BOOLEAN DEFAULT FALSE,
    custom_string2_name VARCHAR(100),
    custom_string3_state BOOLEAN DEFAULT FALSE,
    custom_string3_name VARCHAR(100),
    
    -- Integer fields (up to 3)
    custom_int1_state BOOLEAN DEFAULT FALSE,
    custom_int1_name VARCHAR(100),
    custom_int2_state BOOLEAN DEFAULT FALSE,
    custom_int2_name VARCHAR(100),
    custom_int3_state BOOLEAN DEFAULT FALSE,
    custom_int3_name VARCHAR(100),
    
    -- Boolean fields (up to 3)
    custom_bool1_state BOOLEAN DEFAULT FALSE,
    custom_bool1_name VARCHAR(100),
    custom_bool2_state BOOLEAN DEFAULT FALSE,
    custom_bool2_name VARCHAR(100),
    custom_bool3_state BOOLEAN DEFAULT FALSE,
    custom_bool3_name VARCHAR(100),
    
    -- Date fields (up to 3)
    custom_date1_state BOOLEAN DEFAULT FALSE,
    custom_date1_name VARCHAR(100),
    custom_date2_state BOOLEAN DEFAULT FALSE,
    custom_date2_name VARCHAR(100),
    custom_date3_state BOOLEAN DEFAULT FALSE,
    custom_date3_name VARCHAR(100),
    
    -- Decimal fields (up to 3)
    custom_decimal1_state BOOLEAN DEFAULT FALSE,
    custom_decimal1_name VARCHAR(100),
    custom_decimal2_state BOOLEAN DEFAULT FALSE,
    custom_decimal2_name VARCHAR(100),
    custom_decimal3_state BOOLEAN DEFAULT FALSE,
    custom_decimal3_name VARCHAR(100),
    
    FOREIGN KEY (CategoryId) REFERENCES categories(Id)
);

-- Tags table (unchanged)
CREATE TABLE tags (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(50) NOT NULL UNIQUE,
    UsageCount INT DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO tags (Name, UsageCount) VALUES
('programming', 15),
('vintage', 12),
('collectible', 18),
('professional', 10),
('home', 8),
('electronic', 22),
('manual', 6),
('rare', 4),
('new', 25),
('used', 15);

-- Inventory tags junction table (unchanged)
CREATE TABLE inventory_tags (
    InventoryId INT NOT NULL,
    TagId INT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (InventoryId, TagId),
    FOREIGN KEY (InventoryId) REFERENCES inventories(Id) ON DELETE CASCADE,
    FOREIGN KEY (TagId) REFERENCES tags(Id) ON DELETE CASCADE
);

-- Inventory access table (unchanged)
CREATE TABLE inventory_access (
    InventoryId INT NOT NULL,
    UserId VARCHAR(450) NOT NULL,
    AccessLevel ENUM('Read', 'Write', 'Admin') DEFAULT 'Read',
    GrantedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (InventoryId, UserId),
    FOREIGN KEY (InventoryId) REFERENCES inventories(Id) ON DELETE CASCADE
);

-- NEW: Items table with FIXED custom field values
CREATE TABLE items (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    CustomId VARCHAR(100),
    InventoryId INT NOT NULL,
    Name VARCHAR(200) NOT NULL,
    Description TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    RowVersion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- String field values (corresponding to inventory custom fields)
    custom_string1_value TEXT,
    custom_string2_value TEXT,
    custom_string3_value TEXT,
    
    -- Integer field values
    custom_int1_value INT,
    custom_int2_value INT,
    custom_int3_value INT,
    
    -- Boolean field values
    custom_bool1_value BOOLEAN,
    custom_bool2_value BOOLEAN,
    custom_bool3_value BOOLEAN,
    
    -- Date field values
    custom_date1_value DATETIME,
    custom_date2_value DATETIME,
    custom_date3_value DATETIME,
    
    -- Decimal field values
    custom_decimal1_value DECIMAL(18,4),
    custom_decimal2_value DECIMAL(18,4),
    custom_decimal3_value DECIMAL(18,4),
    
    FOREIGN KEY (InventoryId) REFERENCES inventories(Id) ON DELETE CASCADE,
    UNIQUE KEY unique_custom_id_per_inventory (InventoryId, CustomId)
);

-- Discussion posts table (unchanged)
CREATE TABLE discussion_posts (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    InventoryId INT NOT NULL,
    AuthorId VARCHAR(450) NOT NULL,
    Content TEXT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    LikesCount INT DEFAULT 0,
    FOREIGN KEY (InventoryId) REFERENCES inventories(Id) ON DELETE CASCADE
);

-- Post likes table (unchanged)
CREATE TABLE post_likes (
    UserId VARCHAR(450) NOT NULL,
    PostId INT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (UserId, PostId),
    FOREIGN KEY (PostId) REFERENCES discussion_posts(Id) ON DELETE CASCADE
);

-- Custom ID configs table (unchanged)
CREATE TABLE custom_id_configs (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    InventoryId INT NOT NULL,
    Pattern JSON NOT NULL,
    NextSequence INT DEFAULT 1,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (InventoryId) REFERENCES inventories(Id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_inventories_owner ON inventories(OwnerId);
CREATE INDEX idx_inventories_created ON inventories(CreatedAt);
CREATE INDEX idx_inventories_public_category ON inventories(IsPublic, CategoryId);
CREATE INDEX idx_inventories_owner_public ON inventories(OwnerId, IsPublic);
CREATE INDEX idx_inventories_title ON inventories(Title);

CREATE INDEX idx_items_inventory ON items(InventoryId);
CREATE INDEX idx_items_custom_id ON items(InventoryId, CustomId);
CREATE INDEX idx_items_name ON items(Name);
CREATE INDEX idx_items_created ON items(CreatedAt);
CREATE INDEX idx_items_inventory_name ON items(InventoryId, Name);

CREATE INDEX idx_inventory_access_user ON inventory_access(UserId);

CREATE INDEX idx_discussion_posts_inventory ON discussion_posts(InventoryId);
CREATE INDEX idx_discussion_posts_author ON discussion_posts(AuthorId);
CREATE INDEX idx_discussion_posts_created ON discussion_posts(CreatedAt);
