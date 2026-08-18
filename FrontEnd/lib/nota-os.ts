import { Platform } from "react-native";

import { dataCurta, moeda } from "./formato";
import { OrdemServico } from "./tipos";

function escapar(texto?: string | null) {
  return (texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function montarHtmlNotaOs(ordem: OrdemServico) {
  const aparelho = ordem.aparelho || `${ordem.marca} ${ordem.modelo}`.trim() || "—";
  const saida = ordem.dataSaida
    ? `<div class="linha"><span>Saída</span><span>${escapar(dataCurta(ordem.dataSaida))}</span></div>`
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>OS ${escapar(ordem.numero)}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #000;
    }
    body {
      width: 72mm;
      max-width: 72mm;
      margin: 0 auto;
      padding: 4mm 0;
      font-family: "Courier New", Courier, monospace;
      font-size: 13px;
      line-height: 1.35;
      text-align: center;
    }
    .nome {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 1px;
      margin: 0 0 4px;
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
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <p class="nome">BRINKCELL</p>
  <p class="titulo">ORDEM DE SERVICO</p>
  <p class="numero">${escapar(ordem.numero)}</p>
  <div class="sep">==========================</div>
  <div class="bloco">
    <div class="rotulo">Cliente</div>
    <div class="valor">${escapar(ordem.cliente)}</div>
    <div class="rotulo">Telefone</div>
    <div class="valor">${escapar(ordem.contatoCliente || "—")}</div>
    <div class="linha"><span>Entrada</span><span>${escapar(dataCurta(ordem.data))}</span></div>
    <div class="linha"><span>Prazo</span><span>${escapar(dataCurta(ordem.prazo))}</span></div>
    ${saida}
  </div>
  <div class="sep">--------------------------</div>
  <div class="bloco">
    <div class="rotulo">Aparelho</div>
    <div class="valor">${escapar(aparelho)}</div>
    <div class="valor">Estado: ${escapar(ordem.estadoAparelho || "—")}</div>
    <div class="rotulo">Defeito</div>
    <div class="valor">${escapar(ordem.problema)}</div>
  </div>
  <div class="sep">--------------------------</div>
  <div class="bloco">
    <div class="linha"><span>Status</span><span>${escapar(ordem.status)}</span></div>
    <div class="linha"><span>Prioridade</span><span>${escapar(ordem.prioridade)}</span></div>
    <div class="linha"><span>Valor</span><span>${escapar(moeda(ordem.valor))}</span></div>
  </div>
  <div class="sep">==========================</div>
  <div class="assinatura">
    <p>Assinatura do cliente</p>
    <p>__________________________</p>
  </div>
</body>
</html>`;
}

export async function imprimirNotaOs(ordem: OrdemServico) {
  const html = montarHtmlNotaOs(ordem);

  if (Platform.OS === "web") {
    const janela = window.open("", "_blank", "width=360,height=720");

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
