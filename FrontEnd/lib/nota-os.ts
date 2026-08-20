import { Platform } from "react-native";

import { dataCurta, moeda } from "./formato";
import { escaparHtml, estiloPapel, htmlDadosFiscais } from "./impressao";
import { ConfiguracaoLoja, OrdemServico } from "./tipos";

export function montarHtmlNotaOs(ordem: OrdemServico, configuracao?: ConfiguracaoLoja | null) {
  const papel = estiloPapel(configuracao);
  const nomeLoja = configuracao?.nomeLoja?.trim() || "BRINKPDV";
  const aparelho = ordem.aparelho || `${ordem.marca} ${ordem.modelo}`.trim() || "—";
  const fiscais = htmlDadosFiscais(configuracao);
  const rodape = configuracao?.comprovanteRodape?.trim();
  const saida = ordem.dataSaida
    ? `<div class="linha"><span>Saída</span><span>${escaparHtml(dataCurta(ordem.dataSaida))}</span></div>`
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>OS ${escaparHtml(ordem.numero)}</title>
  <style>
    @page { size: ${papel.pageSize}; margin: 0; }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #000;
    }
    body {
      width: ${papel.bodyWidth};
      max-width: 100%;
      margin: 0 auto;
      padding: 4mm 2mm ${papel.paddingBottom};
      font-family: "Courier New", Courier, monospace;
      font-size: 13px;
      line-height: 1.35;
      text-align: center;
      box-sizing: border-box;
    }
    .nome {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 1px;
      margin: 0 0 4px;
    }
    .fiscal {
      font-size: 11px;
      margin: 0 0 6px;
      line-height: 1.35;
    }
    .titulo {
      font-size: 14px;
      font-weight: 700;
      margin: 0;
    }
    .numero {
      font-size: 16px;
      font-weight: 700;
      margin: 6px 0 8px;
    }
    .sep {
      margin: 8px 0;
      letter-spacing: 1px;
    }
    .bloco {
      text-align: left;
      margin: 6px 0;
    }
    .rotulo {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .valor {
      font-size: 14px;
      margin: 0 0 6px;
      word-break: break-word;
    }
    .linha {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      text-align: left;
      font-size: 13px;
      margin: 3px 0;
    }
    .assinatura {
      margin-top: 14px;
    }
    .assinatura p { margin: 4px 0; }
    .rodape {
      margin-top: 10px;
      font-size: 11px;
      white-space: pre-wrap;
    }
    @media print {
      body { padding-left: 0; padding-right: 0; }
    }
  </style>
</head>
<body>
  <p class="nome">${escaparHtml(nomeLoja)}</p>
  ${fiscais ? `<div class="fiscal">${fiscais}</div>` : ""}
  <p class="titulo">ORDEM DE SERVICO</p>
  <p class="numero">${escaparHtml(ordem.numero)}</p>
  <div class="sep">==========================</div>
  <div class="bloco">
    <div class="rotulo">Cliente</div>
    <div class="valor">${escaparHtml(ordem.cliente)}</div>
    <div class="rotulo">Telefone</div>
    <div class="valor">${escaparHtml(ordem.contatoCliente || "—")}</div>
    <div class="linha"><span>Entrada</span><span>${escaparHtml(dataCurta(ordem.data))}</span></div>
    <div class="linha"><span>Prazo</span><span>${escaparHtml(dataCurta(ordem.prazo))}</span></div>
    ${saida}
  </div>
  <div class="sep">--------------------------</div>
  <div class="bloco">
    <div class="rotulo">Aparelho</div>
    <div class="valor">${escaparHtml(aparelho)}</div>
    <div class="valor">Estado: ${escaparHtml(ordem.estadoAparelho || "—")}</div>
    <div class="rotulo">Defeito</div>
    <div class="valor">${escaparHtml(ordem.problema)}</div>
  </div>
  <div class="sep">--------------------------</div>
  <div class="bloco">
    <div class="linha"><span>Status</span><span>${escaparHtml(ordem.status)}</span></div>
    <div class="linha"><span>Prioridade</span><span>${escaparHtml(ordem.prioridade)}</span></div>
    <div class="linha"><span>Valor</span><span>${escaparHtml(moeda(ordem.valor))}</span></div>
  </div>
  <div class="sep">==========================</div>
  <div class="assinatura">
    <p>Assinatura do cliente</p>
    <p>__________________________</p>
  </div>
  ${rodape ? `<p class="rodape">${escaparHtml(rodape)}</p>` : ""}
</body>
</html>`;
}

export async function imprimirNotaOs(ordem: OrdemServico, configuracao?: ConfiguracaoLoja | null) {
  const html = montarHtmlNotaOs(ordem, configuracao);
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
