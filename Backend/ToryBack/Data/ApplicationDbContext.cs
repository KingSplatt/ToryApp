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
        public DbSet<Inventory> Inventories { get; set; } = null!;
        public DbSet<Category> Categories { get; set; } = null!;
        public DbSet<Tag> Tags { get; set; } = null!;
        public DbSet<InventoryTag> InventoryTags { get; set; } = null!;
        public DbSet<InventoryAccess> InventoryAccess { get; set; } = null!;
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
                entity.Property(e => e.Description).HasColumnName("Description");
                entity.Property(e => e.CreatedAt).HasColumnName("CreatedAt").IsRequired();
                entity.Property(e => e.UpdatedAt).HasColumnName("UpdatedAt").IsRequired();
                
                // Custom field value mappings
                entity.Property(e => e.CustomString1Value).HasColumnName("custom_string1_value");
                entity.Property(e => e.CustomString2Value).HasColumnName("custom_string2_value");
                entity.Property(e => e.CustomString3Value).HasColumnName("custom_string3_value");
                
                entity.Property(e => e.CustomInt1Value).HasColumnName("custom_int1_value");
                entity.Property(e => e.CustomInt2Value).HasColumnName("custom_int2_value");
                entity.Property(e => e.CustomInt3Value).HasColumnName("custom_int3_value");
                
                entity.Property(e => e.CustomBool1Value).HasColumnName("custom_bool1_value");
                entity.Property(e => e.CustomBool2Value).HasColumnName("custom_bool2_value");
                entity.Property(e => e.CustomBool3Value).HasColumnName("custom_bool3_value");
                
                entity.Property(e => e.CustomDate1Value).HasColumnName("custom_date1_value");
                entity.Property(e => e.CustomDate2Value).HasColumnName("custom_date2_value");
                entity.Property(e => e.CustomDate3Value).HasColumnName("custom_date3_value");
                
                entity.Property(e => e.CustomDecimal1Value).HasColumnName("custom_decimal1_value").HasPrecision(18, 4);
                entity.Property(e => e.CustomDecimal2Value).HasColumnName("custom_decimal2_value").HasPrecision(18, 4);
                entity.Property(e => e.CustomDecimal3Value).HasColumnName("custom_decimal3_value").HasPrecision(18, 4);
                
                // Add unique constraint for CustomId per Inventory
                entity.HasIndex(e => new { e.InventoryId, e.CustomId })
                      .HasDatabaseName("unique_custom_id_per_inventory")
                      .IsUnique();
                      
                // Foreign key relationship
                entity.HasOne(e => e.Inventory)
                      .WithMany(i => i.Items)
                      .HasForeignKey(e => e.InventoryId)
                      .OnDelete(DeleteBehavior.Cascade);
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
                
                // Custom field state and name mappings
                entity.Property(e => e.CustomString1State).HasColumnName("custom_string1_state").HasDefaultValue(false);
                entity.Property(e => e.CustomString1Name).HasColumnName("custom_string1_name").HasMaxLength(100);
                entity.Property(e => e.CustomString2State).HasColumnName("custom_string2_state").HasDefaultValue(false);
                entity.Property(e => e.CustomString2Name).HasColumnName("custom_string2_name").HasMaxLength(100);
                entity.Property(e => e.CustomString3State).HasColumnName("custom_string3_state").HasDefaultValue(false);
                entity.Property(e => e.CustomString3Name).HasColumnName("custom_string3_name").HasMaxLength(100);
                
                entity.Property(e => e.CustomInt1State).HasColumnName("custom_int1_state").HasDefaultValue(false);
                entity.Property(e => e.CustomInt1Name).HasColumnName("custom_int1_name").HasMaxLength(100);
                entity.Property(e => e.CustomInt2State).HasColumnName("custom_int2_state").HasDefaultValue(false);
                entity.Property(e => e.CustomInt2Name).HasColumnName("custom_int2_name").HasMaxLength(100);
                entity.Property(e => e.CustomInt3State).HasColumnName("custom_int3_state").HasDefaultValue(false);
                entity.Property(e => e.CustomInt3Name).HasColumnName("custom_int3_name").HasMaxLength(100);
                
                entity.Property(e => e.CustomBool1State).HasColumnName("custom_bool1_state").HasDefaultValue(false);
                entity.Property(e => e.CustomBool1Name).HasColumnName("custom_bool1_name").HasMaxLength(100);
                entity.Property(e => e.CustomBool2State).HasColumnName("custom_bool2_state").HasDefaultValue(false);
                entity.Property(e => e.CustomBool2Name).HasColumnName("custom_bool2_name").HasMaxLength(100);
                entity.Property(e => e.CustomBool3State).HasColumnName("custom_bool3_state").HasDefaultValue(false);
                entity.Property(e => e.CustomBool3Name).HasColumnName("custom_bool3_name").HasMaxLength(100);
                
                entity.Property(e => e.CustomDate1State).HasColumnName("custom_date1_state").HasDefaultValue(false);
                entity.Property(e => e.CustomDate1Name).HasColumnName("custom_date1_name").HasMaxLength(100);
                entity.Property(e => e.CustomDate2State).HasColumnName("custom_date2_state").HasDefaultValue(false);
                entity.Property(e => e.CustomDate2Name).HasColumnName("custom_date2_name").HasMaxLength(100);
                entity.Property(e => e.CustomDate3State).HasColumnName("custom_date3_state").HasDefaultValue(false);
                entity.Property(e => e.CustomDate3Name).HasColumnName("custom_date3_name").HasMaxLength(100);
                
                entity.Property(e => e.CustomDecimal1State).HasColumnName("custom_decimal1_state").HasDefaultValue(false);
                entity.Property(e => e.CustomDecimal1Name).HasColumnName("custom_decimal1_name").HasMaxLength(100);
                entity.Property(e => e.CustomDecimal2State).HasColumnName("custom_decimal2_state").HasDefaultValue(false);
                entity.Property(e => e.CustomDecimal2Name).HasColumnName("custom_decimal2_name").HasMaxLength(100);
                entity.Property(e => e.CustomDecimal3State).HasColumnName("custom_decimal3_state").HasDefaultValue(false);
                entity.Property(e => e.CustomDecimal3Name).HasColumnName("custom_decimal3_name").HasMaxLength(100);
                
                // Custom ID Configuration mappings
                entity.Property(e => e.CustomIdFormat).HasColumnName("custom_id_format");
                entity.Property(e => e.CustomIdEnabled).HasColumnName("custom_id_enabled").HasDefaultValue(true);
                
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
        }
    }
}
