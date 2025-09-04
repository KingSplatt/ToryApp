# Deploy ToryApp Backend en Render

## Archivos Necesarios ✅

Tu carpeta Backend ya contiene todos los archivos necesarios:

- ✅ `Dockerfile` - Para deployment con Docker
- ✅ `start.sh` - Script de inicio alternativo  
- ✅ `appsettings.Production.json` - Configuración de producción
- ✅ `.env.example` - Ejemplo de variables de entorno
- ✅ `ToryBack.csproj` - Proyecto .NET
- ✅ Migración PostgreSQL corregida
- ✅ `postgres_triggers_complete.sql` - Triggers necesarios

## Configuraciones Aplicadas

### 1. Base de Datos
- ✅ Corregido: `DefaultConnection` en lugar de `Default`
- ✅ Agregado: Soporte para `DATABASE_URL` de Render
- ✅ Configurado: PostgreSQL con Npgsql

### 2. Puerto y Hosting
- ✅ Configurado: Variable `PORT` de Render
- ✅ Configurado: Binding a `0.0.0.0` para acceso externo

## Pasos para Deploy en Render

### 1. Crear Web Service en Render

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Conecta tu repositorio GitHub: `KingSplatt/ToryApp`
4. Configurar el servicio:

```
Name: toryapp-backend
Environment: Docker
Region: (tu preferencia)
Branch: main
Root Directory: Backend/ToryBack
```

### 2. Variables de Entorno en Render

En la configuración del servicio, agrega estas variables:

```bash
# Base de Datos (automática si usas Render PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# OAuth (obtén las claves de Google/Facebook Developers)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
FACEBOOK_APP_ID=tu_facebook_app_id
FACEBOOK_APP_SECRET=tu_facebook_app_secret

# CORS (URL de tu frontend en Netlify)
CORS_ORIGINS=https://tu-app.netlify.app,https://tu-dominio-custom.com

# Entorno
ASPNETCORE_ENVIRONMENT=Production
```

### 3. Crear Base de Datos PostgreSQL

1. En Render Dashboard: "New" → "PostgreSQL"
2. Configurar:
   ```
   Name: toryapp-db
   Database Name: toryapp
   User: toryapp_user
   Region: (misma que el backend)
   ```
3. Copia la `DATABASE_URL` a las variables de entorno del backend

### 4. Ejecutar Migración y Triggers

Después del primer deploy exitoso:

1. **Conecta a tu base de datos** usando la URL interna de Render
2. **Ejecuta los triggers** desde `postgres_triggers_complete.sql`:

```sql
-- Función para auto-update de UpdatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."UpdatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para las tablas
CREATE TRIGGER update_inventories_updated_at 
    BEFORE UPDATE ON inventories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5. Verificar Deploy

Una vez desplegado, prueba estos endpoints:

```bash
# Health check
GET https://tu-app.onrender.com/api/health

# Database test
GET https://tu-app.onrender.com/api/test-db

# Swagger UI
GET https://tu-app.onrender.com/swagger
```

## Estructura Final del Deploy

```
Render Web Service (Backend)
├── Build: Docker automatically
├── Start Command: automatic (Dockerfile)
├── Environment Variables: (configuradas arriba)
└── Database: Connected via DATABASE_URL

Render PostgreSQL (Database)
├── Migrations: Applied automatically
├── Triggers: Added manually
└── Connection: Via DATABASE_URL
```

## Troubleshooting

### Error de Migración
- ✅ Ya resuelto: Migración PostgreSQL corregida
- ✅ Ejecutar: `postgres_triggers_complete.sql` después del deploy

### Error de Conexión
- Verificar `DATABASE_URL` en variables de entorno
- Verificar que la base de datos esté en la misma región

### Error de CORS
- Agregar URL del frontend a `CORS_ORIGINS`
- Verificar formato: `https://app.netlify.app` (sin slash final)

### Error de OAuth
- Verificar `GOOGLE_CLIENT_ID/SECRET` y `FACEBOOK_APP_ID/SECRET`
- Agregar URLs de Render a OAuth providers

## URLs Importantes

- **Backend**: `https://toryapp-backend.onrender.com`
- **Swagger**: `https://toryapp-backend.onrender.com/swagger`
- **Health**: `https://toryapp-backend.onrender.com/api/health`
- **Database Test**: `https://toryapp-backend.onrender.com/api/test-db`

¡Tu backend está listo para deploy! 🚀
