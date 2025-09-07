using DotNetEnv;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ToryBack.Data;
using ToryBack.Models;
using ToryBack.Services;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

// Load .env file only in development
if (builder.Environment.IsDevelopment())
{
    Env.Load();
}

// Configure OAuth settings from environment variables or configuration
builder.Configuration["Google:ClientId"] = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID") 
    ?? builder.Configuration["Google:ClientId"] 
    ?? throw new InvalidOperationException("Google ClientId not configured");

builder.Configuration["Google:ClientSecret"] = Environment.GetEnvironmentVariable("GOOGLE_CLIENT_SECRET") 
    ?? builder.Configuration["Google:ClientSecret"] 
    ?? throw new InvalidOperationException("Google ClientSecret not configured");

builder.Configuration["Facebook:AppId"] = Environment.GetEnvironmentVariable("FACEBOOK_APP_ID") 
    ?? builder.Configuration["Facebook:AppId"] 
    ?? throw new InvalidOperationException("Facebook AppId not configured");

builder.Configuration["Facebook:AppSecret"] = Environment.GetEnvironmentVariable("FACEBOOK_APP_SECRET") 
    ?? builder.Configuration["Facebook:AppSecret"] 
    ?? throw new InvalidOperationException("Facebook AppSecret not configured");

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database configuration
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");

// Log the connection string for debugging (mask password)
if (!string.IsNullOrEmpty(connectionString))
{
    var maskedConnectionString = connectionString.Contains("@") 
        ? connectionString.Substring(0, connectionString.IndexOf("://") + 3) + "***@" + connectionString.Substring(connectionString.IndexOf("@") + 1)
        : "***";
    Console.WriteLine($"Database URL detected: {maskedConnectionString}");
    
    // Convert PostgreSQL URL to Entity Framework connection string
    if (connectionString.StartsWith("postgresql://"))
    {
        try
        {
            var uri = new Uri(connectionString);
            var host = uri.Host;
            var portt = uri.Port;
            var database = uri.AbsolutePath.TrimStart('/');
            var userInfo = uri.UserInfo.Split(':');
            var username = userInfo[0];
            var password = userInfo.Length > 1 ? userInfo[1] : "";
            
            connectionString = $"Host={host};Port={portt};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true;";
            Console.WriteLine("PostgreSQL URL converted to Entity Framework format successfully");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error parsing PostgreSQL URL: {ex.Message}");
            throw new InvalidOperationException($"Invalid PostgreSQL URL format: {ex.Message}");
        }
    }
}
else
{
    Console.WriteLine("DATABASE_URL environment variable is null or empty");
}

// If DATABASE_URL is not available, build from individual components
if (string.IsNullOrEmpty(connectionString))
{
    var dbHost = Environment.GetEnvironmentVariable("DB_HOST") ?? "localhost";
    var dbPort = Environment.GetEnvironmentVariable("DB_PORT") ?? "5432";
    var database = Environment.GetEnvironmentVariable("DB_NAME") ?? "";
    var username = Environment.GetEnvironmentVariable("DB_USER") ?? "";
    var password = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? "";
    
    Console.WriteLine($"Building connection string from components: Host={dbHost}, Port={dbPort}, Database={database}, User={username}");
    
    if (!string.IsNullOrEmpty(database) && !string.IsNullOrEmpty(username))
    {
        connectionString = $"Host={dbHost};Port={dbPort};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true;";
    }
}

// Fallback to configuration
connectionString ??= builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrEmpty(connectionString))
{
    Console.WriteLine("ERROR: No database connection string available");
    throw new InvalidOperationException("Database connection string not configured");
}

Console.WriteLine("Database connection string configured successfully");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString)
           .EnableSensitiveDataLogging(builder.Environment.IsDevelopment()));

// Identity configuration
builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 4;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
    options.User.RequireUniqueEmail = true;
    options.SignIn.RequireConfirmedEmail = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Configure Identity to work as API (no redirects)
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = 401;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = 403;
        return Task.CompletedTask;
    };
    options.Cookie.SameSite = SameSiteMode.None;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.HttpOnly = true;
});

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
var allowedOrigins = Environment.GetEnvironmentVariable("CORS_ORIGINS")?.Split(',') 
                    ?? builder.Configuration.GetSection("Cors:Origins").Get<string[]>() 
                    ?? new[] { 
                        "http://localhost:5173", 
                        "http://localhost:5174", 
                        "http://localhost:3000",
                        "https://toryappfront.netlify.app" // Removed trailing slash
                    };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowConfiguredOrigins", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // En desarrollo, permite cualquier origen
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
        else
        {
            // En producción, usa orígenes específicos
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
    });
});

var app = builder.Build();

// Configurar para trabajar detrás de un proxy (Render)
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor | Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto
});

// Configure the HTTP request pipeline
// Enable Swagger in all environments for API documentation
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ToryApp API V1");
    c.RoutePrefix = "swagger"; // This makes Swagger available at /swagger
});

if (!app.Environment.IsDevelopment())
{
    // Configurar para HTTPS detrás de proxy (Render)
    app.Use((context, next) =>
    {
        context.Request.Scheme = "https";
        return next();
    });
    
    app.UseHsts();
}

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
    database = "inventorydb (PostgreSQL)"
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

// Configure port for Render
var port = Environment.GetEnvironmentVariable("PORT") ?? "5217";

// En Render, siempre usar HTTP internamente, Render maneja HTTPS externamente
app.Urls.Add($"http://0.0.0.0:{port}");

app.Run();