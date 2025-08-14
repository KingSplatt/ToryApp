using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ToryBack.Models;

namespace ToryBack.Data
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSets for all entities
        public DbSet<Item> Items { get; set; } = null!;
        public DbSet<InventoryItem> InventoryItems { get; set; } = null!;
        public DbSet<Inventory> Inventories { get; set; } = null!;
        public DbSet<Category> Categories { get; set; } = null!;
        public DbSet<Tag> Tags { get; set; } = null!;
        public DbSet<InventoryTag> InventoryTags { get; set; } = null!;
        public DbSet<InventoryAccess> InventoryAccess { get; set; } = null!;
        public DbSet<CustomField> CustomFields { get; set; } = null!;
        public DbSet<CustomFieldValue> CustomFieldValues { get; set; } = null!;
        public DbSet<DiscussionPost> DiscussionPosts { get; set; } = null!;
        public DbSet<PostLike> PostLikes { get; set; } = null!;
        
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            
            // Configure Items table
            builder.Entity<Item>(entity =>
            {
                entity.ToTable("items");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("Id");
                entity.Property(e => e.CustomId).HasColumnName("CustomId").HasMaxLength(100);
                entity.Property(e => e.InventoryId).HasColumnName("InventoryId").IsRequired();
                entity.Property(e => e.Name).HasColumnName("Name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.CreateAt).HasColumnName("CreateAt").IsRequired();
                
                // Add unique constraint for CustomId per Inventory
                entity.HasIndex(e => new { e.InventoryId, e.CustomId })
                      .HasDatabaseName("unique_custom_id_per_inventory")
                      .IsUnique();
            });

            // Configure Inventories table
            builder.Entity<Inventory>(entity =>
            {
                entity.ToTable("inventories");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
                entity.Property(e => e.OwnerId).HasMaxLength(450).IsRequired();
                entity.Property(e => e.ImageUrl).HasMaxLength(500);
                entity.Property(e => e.IsPublic).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
                
                // Foreign key relationships
                entity.HasOne(e => e.Category)
                      .WithMany(c => c.Inventories)
                      .HasForeignKey(e => e.CategoryId);
                      
                entity.HasOne(e => e.Owner)
                      .WithMany()
                      .HasForeignKey(e => e.OwnerId);
            });

            // Configure Categories table
            builder.Entity<Category>(entity =>
            {
                entity.ToTable("categories");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.SortOrder).HasDefaultValue(0);
                entity.HasIndex(e => e.Name).IsUnique();
            });

            // Configure Tags table
            builder.Entity<Tag>(entity =>
            {
                entity.ToTable("tags");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(50).IsRequired();
                entity.Property(e => e.UsageCount).HasDefaultValue(0);
                entity.HasIndex(e => e.Name).IsUnique();
            });

            // Configure InventoryTags junction table
            builder.Entity<InventoryTag>(entity =>
            {
                entity.ToTable("inventory_tags");
                entity.HasKey(e => new { e.InventoryId, e.TagId });
                
                entity.HasOne(e => e.Inventory)
                      .WithMany(i => i.InventoryTags)
                      .HasForeignKey(e => e.InventoryId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasOne(e => e.Tag)
                      .WithMany(t => t.InventoryTags)
                      .HasForeignKey(e => e.TagId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure InventoryAccess table
            builder.Entity<InventoryAccess>(entity =>
            {
                entity.ToTable("inventory_access");
                entity.HasKey(e => new { e.InventoryId, e.UserId });
                entity.Property(e => e.UserId).HasMaxLength(450);
                entity.Property(e => e.AccessLevel).HasConversion<string>();
                
                entity.HasOne(e => e.Inventory)
                      .WithMany(i => i.AccessList)
                      .HasForeignKey(e => e.InventoryId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure DiscussionPosts table
            builder.Entity<DiscussionPost>(entity =>
            {
                entity.ToTable("discussion_posts");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.AuthorId).HasMaxLength(450).IsRequired();
                entity.Property(e => e.Content).IsRequired();
                entity.Property(e => e.LikesCount).HasDefaultValue(0);
                
                entity.HasOne(e => e.Inventory)
                      .WithMany(i => i.DiscussionPosts)
                      .HasForeignKey(e => e.InventoryId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure PostLikes table
            builder.Entity<PostLike>(entity =>
            {
                entity.ToTable("post_likes");
                entity.HasKey(e => new { e.UserId, e.PostId });
                entity.Property(e => e.UserId).HasMaxLength(450);
                
                entity.HasOne(e => e.Post)
                      .WithMany(p => p.Likes)
                      .HasForeignKey(e => e.PostId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure CustomFields table
            builder.Entity<CustomField>(entity =>
            {
                entity.ToTable("custom_fields");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
                entity.Property(e => e.Type).HasConversion<string>();
                entity.Property(e => e.ShowInTable).HasDefaultValue(false);
                entity.Property(e => e.SortOrder).HasDefaultValue(0);
                
                entity.HasOne(e => e.Inventory)
                      .WithMany(i => i.CustomFields)
                      .HasForeignKey(e => e.InventoryId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure CustomFieldValues table
            builder.Entity<CustomFieldValue>(entity =>
            {
                entity.ToTable("custom_field_values");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.NumberValue).HasPrecision(18, 4);
                
                entity.HasIndex(e => new { e.ItemId, e.CustomFieldId })
                      .HasDatabaseName("unique_item_field")
                      .IsUnique();
                      
                entity.HasOne(e => e.Item)
                      .WithMany(i => i.CustomFieldValues)
                      .HasForeignKey(e => e.ItemId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasOne(e => e.CustomField)
                      .WithMany(cf => cf.Values)
                      .HasForeignKey(e => e.CustomFieldId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
