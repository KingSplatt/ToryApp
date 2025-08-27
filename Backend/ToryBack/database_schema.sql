
CREATE DATABASE inventorydb;
USE inventorydb;

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

CREATE TABLE inventories (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Title VARCHAR(200) NOT NULL,
    Description TEXT, 
    CategoryId INT NOT NULL,
    ImageUrl VARCHAR(500), 
    IsPublic BOOLEAN DEFAULT TRUE,
    OwnerId VARCHAR(450) NOT NULL, -- ID del usuario
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    RowVersion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
    FOREIGN KEY (CategoryId) REFERENCES categories(Id)
);

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

CREATE TABLE inventory_tags (
    InventoryId INT NOT NULL,
    TagId INT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (InventoryId, TagId),
    FOREIGN KEY (InventoryId) REFERENCES inventories(Id) ON DELETE CASCADE,
    FOREIGN KEY (TagId) REFERENCES tags(Id) ON DELETE CASCADE
);

CREATE TABLE inventory_access (
    InventoryId INT NOT NULL,
    UserId VARCHAR(450) NOT NULL,
    AccessLevel ENUM('Read', 'Write', 'Admin') DEFAULT 'Read',
    GrantedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (InventoryId, UserId),
    FOREIGN KEY (InventoryId) REFERENCES inventories(Id) ON DELETE CASCADE
);


CREATE TABLE custom_fields (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    InventoryId INT NOT NULL,
    Name VARCHAR(100) NOT NULL,
    Type ENUM('Text', 'Number', 'Checkbox', 'Date', 'Dropdown') NOT NULL,
    ShowInTable BOOLEAN DEFAULT FALSE,
    SortOrder INT DEFAULT 0,
    ValidationRules JSON,
    Options JSON,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (InventoryId) REFERENCES inventories(Id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS items (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    CustomId VARCHAR(100),
    InventoryId INT NOT NULL,
    Name VARCHAR(200) NOT NULL,
    Description TEXT,
    CreateAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    RowVersion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (InventoryId) REFERENCES inventories(Id) ON DELETE CASCADE,
    UNIQUE KEY unique_custom_id_per_inventory (InventoryId, CustomId)
);

CREATE TABLE custom_field_values (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    ItemId INT NOT NULL,
    CustomFieldId INT NOT NULL,
    TextValue TEXT,
    NumberValue DECIMAL(18,4),
    BooleanValue BOOLEAN,
    DateValue DATETIME,
    FOREIGN KEY (ItemId) REFERENCES items(Id) ON DELETE CASCADE,
    FOREIGN KEY (CustomFieldId) REFERENCES custom_fields(Id) ON DELETE CASCADE,
    UNIQUE KEY unique_item_field (ItemId, CustomFieldId)
);

CREATE TABLE IF NOT EXISTS discussion_posts (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    InventoryId INT NOT NULL,
    AuthorId VARCHAR(450) NOT NULL,
    Content TEXT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    LikesCount INT DEFAULT 0,
    FOREIGN KEY (InventoryId) REFERENCES inventories(Id) ON DELETE CASCADE
);

CREATE TABLE post_likes (
    UserId VARCHAR(450) NOT NULL,
    PostId INT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (UserId, PostId),
    FOREIGN KEY (PostId) REFERENCES discussion_posts(Id) ON DELETE CASCADE
);

CREATE TABLE custom_id_configs (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    InventoryId INT NOT NULL,
    Pattern JSON NOT NULL,
    NextSequence INT DEFAULT 1,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (InventoryId) REFERENCES inventories(Id) ON DELETE CASCADE
);

CREATE INDEX idx_inventories_owner ON inventories(OwnerId);
CREATE INDEX idx_inventories_created ON inventories(CreatedAt);
CREATE INDEX idx_inventories_public_category ON inventories(IsPublic, CategoryId);
CREATE INDEX idx_inventories_owner_public ON inventories(OwnerId, IsPublic);
CREATE INDEX idx_inventories_title ON inventories(Title);

CREATE INDEX idx_items_inventory ON items(InventoryId);
CREATE INDEX idx_items_custom_id ON items(InventoryId, CustomId);
CREATE INDEX idx_items_name ON items(Name);
CREATE INDEX idx_items_created ON items(CreateAt);
CREATE INDEX idx_items_inventory_name ON items(InventoryId, Name);

CREATE INDEX idx_custom_field_values_item ON custom_field_values(ItemId);
CREATE INDEX idx_custom_field_values_field ON custom_field_values(CustomFieldId);

CREATE INDEX idx_inventory_access_user ON inventory_access(UserId);

CREATE INDEX idx_discussion_posts_inventory ON discussion_posts(InventoryId);
CREATE INDEX idx_discussion_posts_author ON discussion_posts(AuthorId);
CREATE INDEX idx_discussion_posts_created ON discussion_posts(CreatedAt);
