using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PDV.Infraestrutura.Migracoes
{
    /// <inheritdoc />
    public partial class ApagarOrdensDeTeste : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM cash_movements;");
            migrationBuilder.Sql("DELETE FROM sales;");
            migrationBuilder.Sql("DELETE FROM service_orders;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
