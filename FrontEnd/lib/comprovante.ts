import { Platform } from "react-native";

import { moeda } from "./formato";
import { escaparHtml, estiloPapel, htmlDadosFiscais } from "./impressao";
import { ConfiguracaoLoja, Venda } from "./tipos";

export function montarHtmlComprovante(venda: Venda, configuracao?: ConfiguracaoLoja | null) {
  const papel = estiloPapel(configuracao);
  const linhas = venda.itens
    .map(
      (item) => `
        <tr>
          <td>
            <strong>${escaparHtml(item.nome)}</strong><br />
            <small>${item.quantidade} x ${moeda(item.precoUnitario)}</small>
          </td>
          <td style="text-align:right;">${moeda(item.total)}</td>
        </tr>`,
    )
    .join("");

  const cabecalho = configuracao?.comprovanteCabecalho?.trim();
  const rodape = configuracao?.comprovanteRodape?.trim();
  const mostrarLogo = configuracao?.comprovanteIncluirLogo !== false;
  const nomeLoja = configuracao?.nomeLoja?.trim() || "BRINKPDV";
  const logo = mostrarLogo && configuracao?.logoLoja
    ? `<img class="logo" src="${escaparHtml(configuracao.logoLoja)}" alt="" />`
    : "";
  const fiscais = htmlDadosFiscais(configuracao);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Comprovante - ${escaparHtml(venda.id)}</title>
  <style>
    @page { size: ${papel.pageSize}; margin: 0; }
    body {
      font-family: Arial, sans-serif;
      margin: 0 auto;
      padding: 8px 8px ${papel.paddingBottom};
      background: #fff;
      color: #000;
      width: ${papel.bodyWidth};
      max-width: 100%;
      box-sizing: border-box;
    }
    .receipt { width: 100%; box-sizing: border-box; }
    .header { text-align: center; margin-bottom: 12px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
    .logo { max-width: 88px; max-height: 88px; display: block; margin: 0 auto 6px; }
    .store-name { font-size: 18px; font-weight: bold; margin: 0; }
    .fiscal { font-size: 11px; margin-top: 6px; line-height: 1.4; }
    .header-note { font-size: 12px; margin-top: 4px; white-space: pre-wrap; }
    .meta { font-size: 12px; margin: 10px 0; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    td { padding: 6px 0; vertical-align: top; border-bottom: 1px dotted #ccc; }
    .totals { margin-top: 12px; font-size: 13px; }
    .totals div { display: flex; justify-content: space-between; margin: 4px 0; }
    .total-row { font-weight: bold; font-size: 15px; border-top: 1px dashed #000; padding-top: 8px; margin-top: 8px; }
    .footer { margin-top: 14px; border-top: 1px dashed #000; padding-top: 10px; font-size: 11px; text-align: center; white-space: pre-wrap; }
    @media print { body { padding-left: 0; padding-right: 0; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      ${logo}
      <p class="store-name">${escaparHtml(nomeLoja)}</p>
      ${fiscais ? `<div class="fiscal">${fiscais}</div>` : ""}
      ${cabecalho ? `<div class="header-note">${escaparHtml(cabecalho)}</div>` : ""}
    </div>

    <div class="meta">
      <div><strong>Venda:</strong> ${escaparHtml(venda.id)}</div>
      <div><strong>Data:</strong> ${new Date(venda.criadoEm).toLocaleString("pt-BR")}</div>
      <div><strong>Pagamento:</strong> ${escaparHtml(venda.formaPagamento)}</div>
      ${venda.vendedorNome ? `<div><strong>Vendedor:</strong> ${escaparHtml(venda.vendedorNome)}</div>` : ""}
      ${venda.observacao ? `<div><strong>Obs.:</strong> ${escaparHtml(venda.observacao)}</div>` : ""}
    </div>

    <table><tbody>${linhas}</tbody></table>

    <div class="totals">
      <div><span>Subtotal</span><span>${moeda(venda.subtotal)}</span></div>
      <div><span>Desconto</span><span>${moeda(venda.descontoTotal)}</span></div>
      <div class="total-row"><span>Total</span><span>${moeda(venda.total)}</span></div>
    </div>

    ${rodape ? `<div class="footer">${escaparHtml(rodape)}</div>` : ""}
  </div>
</body>
</html>`;
}

export async function imprimirComprovante(venda: Venda, configuracao?: ConfiguracaoLoja | null) {
  const html = montarHtmlComprovante(venda, configuracao);
  const papel = estiloPapel(configuracao);

  if (Platform.OS === "web") {
    const janela = window.open("", "_blank", papel.janela);

    if (!janela) {
      return false;
    }

    janela.document.write(html);
    janela.document.close();
    janela.focus();
    janela.print();
    return true;
  }

  const { printAsync } = await import("expo-print");
  await printAsync({ html });
  return true;
}
