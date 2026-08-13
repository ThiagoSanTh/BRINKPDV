using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PDV.Infraestrutura.Migracoes
{
    /// <inheritdoc />
    public partial class OsOficina : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "clients",
                columns: table => new
                {
                    id = table.Column<string>(type: "varchar", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    phone = table.Column<string>(type: "text", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_clients", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_clients_phone",
                table: "clients",
                column: "phone",
                unique: true);

            migrationBuilder.AddColumn<string>(
                name: "client_id",
                table: "service_orders",
                type: "varchar",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "device_type",
                table: "service_orders",
                type: "text",
                nullable: false,
                defaultValue: "Outro");

            migrationBuilder.AddColumn<string>(
                name: "device_brand",
                table: "service_orders",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "device_model",
                table: "service_orders",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "device_condition",
                table: "service_orders",
                type: "text",
                nullable: false,
                defaultValue: "Bom");

            migrationBuilder.CreateIndex(
                name: "IX_service_orders_client_id",
                table: "service_orders",
                column: "client_id");

            migrationBuilder.AddForeignKey(
                name: "FK_service_orders_clients_client_id",
                table: "service_orders",
                column: "client_id",
                principalTable: "clients",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddColumn<string>(
                name: "whatsapp_token",
                table: "store_settings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "whatsapp_phone_number_id",
                table: "store_settings",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_service_orders_clients_client_id",
                table: "service_orders");

            migrationBuilder.DropIndex(
                name: "IX_service_orders_client_id",
                table: "service_orders");

            migrationBuilder.DropColumn(name: "client_id", table: "service_orders");
            migrationBuilder.DropColumn(name: "device_type", table: "service_orders");
            migrationBuilder.DropColumn(name: "device_brand", table: "service_orders");
            migrationBuilder.DropColumn(name: "device_model", table: "service_orders");
            migrationBuilder.DropColumn(name: "device_condition", table: "service_orders");
            migrationBuilder.DropColumn(name: "whatsapp_token", table: "store_settings");
            migrationBuilder.DropColumn(name: "whatsapp_phone_number_id", table: "store_settings");
            migrationBuilder.DropTable(name: "clients");
        }
    }
}
