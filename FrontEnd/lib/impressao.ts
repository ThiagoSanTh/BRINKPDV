import { ConfiguracaoLoja } from "./tipos";

export type PapelImpressao = "58" | "80" | "a4";

export function escaparHtml(texto?: string | null) {
  return (texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function papelImpressao(configuracao?: ConfiguracaoLoja | null): PapelImpressao {
  const modelo = (configuracao?.impressoraModelo ?? "").toLowerCase();
  const largura = (configuracao?.impressoraLarguraPapel ?? "").replace(/mm/i, "").trim();

  if (modelo === "a4" || largura === "210") {
    return "a4";
  }

  if (modelo === "thermal-58mm" || largura === "58") {
    return "58";
  }

  return "80";
}

export function estiloPapel(configuracao?: ConfiguracaoLoja | null) {
  const papel = papelImpressao(configuracao);
  const corte = configuracao?.impressoraCorteAutomatico !== false;
  const paddingBottom = corte ? "14mm" : "4mm";

  if (papel === "a4") {
    return { pageSize: "A4", bodyWidth: "180mm", paddingBottom, janela: "width=800,height=1000" };
  }

  if (papel === "58") {
    return { pageSize: "58mm auto", bodyWidth: "50mm", paddingBottom, janela: "width=280,height=720" };
  }

  return { pageSize: "80mm auto", bodyWidth: "72mm", paddingBottom, janela: "width=360,height=720" };
}

export function htmlDadosFiscais(configuracao?: ConfiguracaoLoja | null) {
  if (!configuracao?.comprovanteMostrarDadosFiscais) {
    return "";
  }

  const cidadeEstado = [configuracao.cidade, configuracao.estado].filter(Boolean).join("/");
  const local = [cidadeEstado, configuracao.cep ? `CEP ${configuracao.cep}` : ""].filter(Boolean).join(" · ");
  const linhas = [
    configuracao.razaoSocial,
    configuracao.cnpj ? `CNPJ: ${configuracao.cnpj}` : "",
    configuracao.enderecoLoja,
    local,
    configuracao.telefoneLoja ? `Tel: ${configuracao.telefoneLoja}` : "",
  ]
    .map((linha) => linha?.trim())
    .filter(Boolean)
    .map((linha) => `<div>${escaparHtml(linha)}</div>`);

  return linhas.join("");
}
