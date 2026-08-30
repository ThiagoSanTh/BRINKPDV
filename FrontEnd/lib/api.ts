export const URL_API = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5080";

let tokenAtual: string | null = null;

export function definirToken(token: string | null) {
  tokenAtual = token;
}

export class ErroApi extends Error {
  constructor(
    public status: number,
    mensagem: string,
  ) {
    super(mensagem);
  }
}

async function requisicao<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const cabecalhos: Record<string, string> = {
    Accept: "application/json",
    ...(opcoes.body ? { "Content-Type": "application/json" } : {}),
    ...((opcoes.headers as Record<string, string>) ?? {}),
  };

  if (tokenAtual) {
    cabecalhos.Authorization = `Bearer ${tokenAtual}`;
  }

  const resposta = await fetch(`${URL_API}${caminho}`, { ...opcoes, headers: cabecalhos });

  if (resposta.status === 204) {
    return undefined as T;
  }

  const texto = await resposta.text();
  const dados = texto ? JSON.parse(texto) : null;

  if (!resposta.ok) {
    throw new ErroApi(resposta.status, dados?.mensagem ?? `Falha na requisição (${resposta.status}).`);
  }

  return dados as T;
}

function extrairNomeArquivo(cabecalho: string | null) {
  if (!cabecalho) {
    return "download";
  }

  const correspondencia = cabecalho.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);

  if (!correspondencia?.[1]) {
    return "download";
  }

  return correspondencia[1].replace(/['"]/g, "");
}

async function baixarArquivo(caminho: string, metodo: "GET" | "POST" = "POST") {
  const cabecalhos: Record<string, string> = {};

  if (tokenAtual) {
    cabecalhos.Authorization = `Bearer ${tokenAtual}`;
  }

  const resposta = await fetch(`${URL_API}${caminho}`, { method: metodo, headers: cabecalhos });

  if (!resposta.ok) {
    const texto = await resposta.text();
    const dados = texto ? JSON.parse(texto) : null;
    throw new ErroApi(resposta.status, dados?.mensagem ?? `Falha na requisição (${resposta.status}).`);
  }

  const blob = await resposta.blob();

  return {
    blob,
    nomeArquivo: extrairNomeArquivo(resposta.headers.get("Content-Disposition")),
  };
}

async function enviarArquivo<T>(caminho: string, arquivo: Blob, nomeArquivo: string) {
  const formulario = new FormData();
  formulario.append("arquivo", arquivo, nomeArquivo);

  const cabecalhos: Record<string, string> = {
    Accept: "application/json",
  };

  if (tokenAtual) {
    cabecalhos.Authorization = `Bearer ${tokenAtual}`;
  }

  const resposta = await fetch(`${URL_API}${caminho}`, {
    method: "POST",
    headers: cabecalhos,
    body: formulario,
  });

  const texto = await resposta.text();
  const dados = texto ? JSON.parse(texto) : null;

  if (!resposta.ok) {
    throw new ErroApi(resposta.status, dados?.mensagem ?? `Falha na requisição (${resposta.status}).`);
  }

  return dados as T;
}

export const api = {
  obter: <T>(caminho: string) => requisicao<T>(caminho),
  criar: <T>(caminho: string, corpo: unknown) =>
    requisicao<T>(caminho, { method: "POST", body: JSON.stringify(corpo) }),
  atualizar: <T>(caminho: string, corpo: unknown) =>
    requisicao<T>(caminho, { method: "PUT", body: JSON.stringify(corpo) }),
  remover: (caminho: string) => requisicao<void>(caminho, { method: "DELETE" }),
  baixar: baixarArquivo,
  enviarArquivo,
};
