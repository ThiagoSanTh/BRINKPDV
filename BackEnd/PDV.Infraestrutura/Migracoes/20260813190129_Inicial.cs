using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PDV.Infraestrutura.Migracoes
{
    /// <inheritdoc />
    public partial class Inicial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "cash_movements",
                columns: table => new
                {
                    id = table.Column<string>(type: "varchar", nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    amount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cash_movements", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "products",
                columns: table => new
                {
                    id = table.Column<string>(type: "varchar", nullable: false),
                    sku = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "text", nullable: false),
                    price = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    cost_price = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    stock = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    barcode = table.Column<string>(type: "text", nullable: true),
                    image = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_products", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "salespersons",
                columns: table => new
                {
                    id = table.Column<string>(type: "varchar", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    phone = table.Column<string>(type: "text", nullable: false),
                    commission = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    total_sales = table.Column<decimal>(type: "numeric(10,2)", nullable: false, defaultValue: 0m),
                    active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    entry_date = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_salespersons", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "service_orders",
                columns: table => new
                {
                    id = table.Column<string>(type: "varchar", nullable: false),
                    order_number = table.Column<string>(type: "text", nullable: false),
                    customer = table.Column<string>(type: "text", nullable: false),
                    customer_contact = table.Column<string>(type: "text", nullable: false),
                    device = table.Column<string>(type: "text", nullable: false),
                    issue = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false, defaultValue: "Orçamento"),
                    priority = table.Column<string>(type: "text", nullable: false, defaultValue: "Média"),
                    value = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    deadline = table.Column<DateOnly>(type: "date", nullable: false),
                    exit_date = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_service_orders", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "store_settings",
                columns: table => new
                {
                    id = table.Column<string>(type: "varchar", nullable: false),
                    store_name = table.Column<string>(type: "text", nullable: false, defaultValue: "BRINKPDV"),
                    store_logo = table.Column<string>(type: "text", nullable: true),
                    store_phone = table.Column<string>(type: "text", nullable: true),
                    store_address = table.Column<string>(type: "text", nullable: true),
                    legal_name = table.Column<string>(type: "text", nullable: true),
                    cnpj = table.Column<string>(type: "text", nullable: true),
                    city = table.Column<string>(type: "text", nullable: true),
                    state = table.Column<string>(type: "text", nullable: true),
                    cep = table.Column<string>(type: "text", nullable: true),
                    receipt_include_logo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    receipt_header = table.Column<string>(type: "text", nullable: true),
                    receipt_footer = table.Column<string>(type: "text", nullable: true),
                    receipt_show_fiscal_data = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    printer_name = table.Column<string>(type: "text", nullable: true),
                    printer_model = table.Column<string>(type: "text", nullable: true),
                    paper_width = table.Column<string>(type: "text", nullable: true),
                    printer_auto_cut = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    stock_alerts = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    checkout_sound = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    auto_print = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_store_settings", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<string>(type: "varchar", nullable: false),
                    username = table.Column<string>(type: "text", nullable: false),
                    password = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: true),
                    role = table.Column<string>(type: "text", nullable: false, defaultValue: "Vendedor"),
                    active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "sales",
                columns: table => new
                {
                    id = table.Column<string>(type: "varchar", nullable: false),
                    salesperson_id = table.Column<string>(type: "varchar", nullable: true),
                    total = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    payment_method = table.Column<string>(type: "text", nullable: false),
                    items = table.Column<string>(type: "text", nullable: false),
                    observation = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sales", x => x.id);
                    table.ForeignKey(
                        name: "FK_sales_salespersons_salesperson_id",
                        column: x => x.salesperson_id,
                        principalTable: "salespersons",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_cash_movements_created_at",
                table: "cash_movements",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_products_sku",
                table: "products",
                column: "sku",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_sales_created_at",
                table: "sales",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_sales_salesperson_id",
                table: "sales",
                column: "salesperson_id");

            migrationBuilder.CreateIndex(
                name: "IX_salespersons_email",
                table: "salespersons",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_service_orders_order_number",
                table: "service_orders",
                column: "order_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_username",
                table: "users",
                column: "username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "cash_movements");

            migrationBuilder.DropTable(
                name: "products");

            migrationBuilder.DropTable(
                name: "sales");

            migrationBuilder.DropTable(
                name: "service_orders");

            migrationBuilder.DropTable(
                name: "store_settings");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "salespersons");
        }
    }
}
