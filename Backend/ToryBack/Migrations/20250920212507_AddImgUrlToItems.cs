using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ToryBack.Migrations
{
    /// <inheritdoc />
    public partial class AddImgUrlToItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<byte[]>(
                name: "RowVersion",
                table: "items",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                defaultValueSql: "'\\x00000000'::bytea",
                oldClrType: typeof(byte[]),
                oldType: "bytea",
                oldRowVersion: true);

            migrationBuilder.AddColumn<string>(
                name: "ImgUrl",
                table: "items",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<byte[]>(
                name: "RowVersion",
                table: "inventories",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                defaultValueSql: "'\\x00000000'::bytea",
                oldClrType: typeof(byte[]),
                oldType: "bytea",
                oldRowVersion: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImgUrl",
                table: "items");

            migrationBuilder.AlterColumn<byte[]>(
                name: "RowVersion",
                table: "items",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                oldClrType: typeof(byte[]),
                oldType: "bytea",
                oldRowVersion: true,
                oldDefaultValueSql: "'\\x00000000'::bytea");

            migrationBuilder.AlterColumn<byte[]>(
                name: "RowVersion",
                table: "inventories",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                oldClrType: typeof(byte[]),
                oldType: "bytea",
                oldRowVersion: true,
                oldDefaultValueSql: "'\\x00000000'::bytea");
        }
    }
}
