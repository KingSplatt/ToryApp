using DotNetEnv;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ToryBack.Data;
using ToryBack.Models;
using ToryBack.Services;

var builder = WebApplication.CreateBuilder(args);

Env.Load();

builder.Configuration["Google:ClientId"] = Env.GetString("GOOGLE_CLIENT_ID") ?? throw new InvalidOperationException("Google ClientId not configured");
builder.Configuration["Google:ClientSecret"] = Env.GetString("GOOGLE_CLIENT_SECRET") ?? throw new InvalidOperationException("Google ClientSecret not configured");
builder.Configuration["Facebook:AppId"] = Env.GetString("FACEBOOK_APP_ID") ?? throw new InvalidOperationException("Facebook AppId not configured");
builder.Configuration["Facebook:AppSecret"] = Env.GetString("FACEBOOK_APP_SECRET") ?? throw new InvalidOperationException("Facebook AppSecret not configured");

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database configuration
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("Default"), 
                    new MySqlServerVersion(new Version(8, 0, 21)))
           .EnableSensitiveDataLogging(builder.Environment.IsDevelopment()));

// Identity configuration
builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 4;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
    options.User.RequireUniqueEmail = true;
    options.SignIn.RequireConfirmedEmail = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

//Google y Facebook authentication
builder.Services.AddAuthentication()
    .AddGoogle(gl =>
    {
        gl.ClientId = builder.Configuration["Google:ClientId"] ?? throw new InvalidOperationException("Google ClientId no configurado");
        gl.ClientSecret = builder.Configuration["Google:ClientSecret"] ?? throw new InvalidOperationException("Google ClientSecret no configurado");
        gl.SaveTokens = true;
    })
    .AddFacebook(fb =>
    {
        fb.AppId = builder.Configuration["Facebook:AppId"] ?? throw new InvalidOperationException("Facebook AppId no configurado");
        fb.AppSecret = builder.Configuration["Facebook:AppSecret"] ?? throw new InvalidOperationException("Facebook AppSecret no configurado");
        fb.SaveTokens = true;
    });

// Register custom services
builder.Services.AddScoped<RoleInitializerService>();
builder.Services.AddScoped<IInventoryAuthorizationService, InventoryAuthorizationService>();
builder.Services.AddScoped<ICustomIdService, CustomIdService>();

// CORS configuration
var allowedOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() 
                    ?? new[] { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" };
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowConfiguredOrigins", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CORS must be before Authentication
app.UseCors("AllowConfiguredOrigins");

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Controllers
app.MapControllers();

// Health check endpoint
app.MapGet("/api/health", () => Results.Ok(new { 
    status = "ok", 
    timestamp = DateTime.UtcNow,
    environment = app.Environment.EnvironmentName,
    database = "inventorydb"
}))
.WithName("HealthCheck")
.WithTags("Health");

// Initialize roles and admin user
using (var scope = app.Services.CreateScope())
{
    var roleService = scope.ServiceProvider.GetRequiredService<RoleInitializerService>();
    await roleService.InitializeRolesAsync();
    
    // Create default admin user
    await roleService.CreateAdminUserAsync("admin@toryapp.com", "admin123", "Administrator");
}

//test endpoint
app.MapGet("/api/test-db", async (ApplicationDbContext context) =>
{
    try
    {
        var itemCount = await context.Items.CountAsync();
        return Results.Ok(new { 
            message = "Database connection successful", 
            itemCount,
            timestamp = DateTime.UtcNow 
        });
    }
    catch (Exception ex)
    {
        return Results.Problem($"Database connection failed: {ex.Message}");
    }
})
.WithName("TestDatabase")
.WithTags("Health");

app.Run();
