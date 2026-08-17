using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PDV.Infraestrutura.Migracoes
{
    /// <inheritdoc />
    public partial class LimpezaBeta : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DELETE FROM cash_movements;
                DELETE FROM sales;
                DELETE FROM service_orders;
                DELETE FROM clients;
                DELETE FROM products;
                DELETE FROM salespersons;
                DELETE FROM store_settings;
                DELETE FROM users WHERE username IS DISTINCT FROM 'admin';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
