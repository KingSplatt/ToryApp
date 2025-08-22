using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ToryBack.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRoleNamesToEnglish : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Update role names from Spanish to English
            migrationBuilder.Sql(@"
                UPDATE AspNetRoles 
                SET Name = 'Admin', NormalizedName = 'ADMIN' 
                WHERE Name = 'Administrador';
                
                UPDATE AspNetRoles 
                SET Name = 'AuthUser', NormalizedName = 'AUTHUSER' 
                WHERE Name = 'UsuarioAutenticado';
                
                UPDATE AspNetRoles 
                SET Name = 'Public', NormalizedName = 'PUBLIC' 
                WHERE Name = 'UsuarioNoAutenticado';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE AspNetRoles 
                SET Name = 'Administrador', NormalizedName = 'ADMINISTRADOR' 
                WHERE Name = 'Admin';
                
                UPDATE AspNetRoles 
                SET Name = 'UsuarioAutenticado', NormalizedName = 'USUARIOAUTENTICADO' 
                WHERE Name = 'AuthUser';
                
                UPDATE AspNetRoles 
                SET Name = 'UsuarioNoAutenticado', NormalizedName = 'USUARIONOAUTENTICADO' 
                WHERE Name = 'Public';
            ");
        }
    }
}
