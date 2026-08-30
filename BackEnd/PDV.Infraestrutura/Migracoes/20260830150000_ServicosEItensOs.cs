using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PDV.Infraestrutura.Migracoes
{
    /// <inheritdoc />
    public partial class ServicosEItensOs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "services",
                columns: table => new
                {
                    id = table.Column<string>(type: "varchar", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    default_price = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_services", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_services_name",
                table: "services",
                column: "name",
                unique: true);

            migrationBuilder.AddColumn<string>(
                name: "service_items",
                table: "service_orders",
                type: "text",
                nullable: false,
                defaultValue: "[]");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "service_items",
                table: "service_orders");

            migrationBuilder.DropTable(
                name: "services");
        }
    }
}
