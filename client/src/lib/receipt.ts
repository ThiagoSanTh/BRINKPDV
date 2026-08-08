import { formatCurrency, normalizeSaleItems, type SaleItem } from "./sales";

type ReceiptSettings = {
  includeLogo?: boolean;
  receiptHeader?: string;
  receiptFooter?: string;
  showFiscalData?: boolean;
};

type PrinterSettings = {
  printerName?: string;
  printerModel?: string;
  paperWidth?: string;
  autoCut?: boolean;
};

type SaleLike = {
  id: string;
  total: string | number;
  paymentMethod: string;
  createdAt: string | Date;
  items?: unknown;
  observation?: string | null;
  salespersonName?: string;
};

function getPaperWidthValue(paperWidth?: string) {
  if (paperWidth === "58") {
    return "220px";
  }

  return "300px";
}

function buildItemsRows(items: SaleItem[]) {
  return items
    .map((item) => {
      const lineTotal = Math.max(0, item.price * item.quantity - Number(item.discount || 0));

      return `
        <tr>
          <td>
            <strong>${item.name}</strong><br />
            <small>${item.quantity} x ${formatCurrency(item.price)}</small>
          </td>
          <td style="text-align:right;">${formatCurrency(lineTotal)}</td>
        </tr>
      `;
    })
    .join("");
}

export function buildSaleReceiptHtml({
  sale,
  receiptSettings = {},
  printerSettings = {},
  storeName = "BRINKCELL",
}: {
  sale: SaleLike;
  receiptSettings?: ReceiptSettings;
  printerSettings?: PrinterSettings;
  storeName?: string;
}) {
  const items = normalizeSaleItems(sale.items);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountTotal = items.reduce((sum, item) => sum + Number(item.discount || 0), 0);
  const total = Math.max(0, Number(sale.total) || subtotal - discountTotal);
  const width = getPaperWidthValue(printerSettings.paperWidth);
  const header = receiptSettings.receiptHeader?.trim();
  const footer = receiptSettings.receiptFooter?.trim();
  const saleDate = new Date(sale.createdAt);

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Comprovante - ${sale.id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 16px;
          background: #fff;
          color: #000;
          width: ${width};
        }
        .receipt {
          width: 100%;
          box-sizing: border-box;
        }
        .header {
          text-align: center;
          margin-bottom: 12px;
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
        }
        .store-name {
          font-size: 18px;
          font-weight: bold;
          margin: 0;
        }
        .header-note {
          font-size: 12px;
          margin-top: 4px;
          white-space: pre-wrap;
        }
        .meta {
          font-size: 12px;
          margin: 10px 0;
          line-height: 1.5;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        td {
          padding: 6px 0;
          vertical-align: top;
          border-bottom: 1px dotted #ccc;
        }
        .totals {
          margin-top: 12px;
          font-size: 13px;
        }
        .totals div {
          display: flex;
          justify-content: space-between;
          margin: 4px 0;
        }
        .total-row {
          font-weight: bold;
          font-size: 15px;
          border-top: 1px dashed #000;
          padding-top: 8px;
          margin-top: 8px;
        }
        .footer {
          margin-top: 14px;
          border-top: 1px dashed #000;
          padding-top: 10px;
          font-size: 11px;
          text-align: center;
          white-space: pre-wrap;
        }
        .muted {
          color: #333;
        }
        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          ${receiptSettings.includeLogo === false ? "" : `<p class="store-name">${storeName}</p>`}
          ${header ? `<div class="header-note">${header}</div>` : ""}
        </div>

        <div class="meta">
          <div><strong>Venda:</strong> ${sale.id}</div>
          ${receiptSettings.showFiscalData === false ? "" : `<div><strong>Data:</strong> ${saleDate.toLocaleString("pt-BR")}</div>`}
          <div><strong>Pagamento:</strong> ${sale.paymentMethod}</div>
          ${sale.salespersonName ? `<div><strong>Vendedor:</strong> ${sale.salespersonName}</div>` : ""}
          ${sale.observation ? `<div><strong>Obs.:</strong> ${sale.observation}</div>` : ""}
        </div>

        <table>
          <tbody>
            ${buildItemsRows(items)}
          </tbody>
        </table>

        <div class="totals">
          <div><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
          <div><span>Desconto</span><span>${formatCurrency(discountTotal)}</span></div>
          <div class="total-row"><span>Total</span><span>${formatCurrency(total)}</span></div>
        </div>

        ${footer ? `<div class="footer">${footer}</div>` : ""}
      </div>
      <script>
        window.onload = () => {
          window.focus();
          window.print();
        };
      </script>
    </body>
    </html>
  `;
}
