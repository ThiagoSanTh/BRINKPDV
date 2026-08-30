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

async function requisicaoArquivo(caminho: string): Promise<{ blob: Blob; nomeArquivo: string; manifest?: unknown }> {
  const cabecalhos: Record<string, string> = {
    Accept: "application/octet-stream",
  };

  if (tokenAtual) {
    cabecalhos.Authorization = `Bearer ${tokenAtual}`;
  }

  const resposta = await fetch(`${URL_API}${caminho}`, { headers: cabecalhos });

  if (!resposta.ok) {
    const texto = await resposta.text();
    const dados = texto ? JSON.parse(texto) : null;
    throw new ErroApi(resposta.status, dados?.mensagem ?? `Falha na requisição (${resposta.status}).`);
  }

  const disposicao = resposta.headers.get("content-disposition") ?? "";
  const nome = disposicao.match(/filename\*=UTF-8''([^;]+)/)?.[1]
    ?? disposicao.match(/filename="?([^"]+)"?/)?.[1]
    ?? "BRINKPDV_Backup.brinkbackup";

  const manifestHeader = resposta.headers.get("x-brinkpdv-backup-manifest");
  const manifest = manifestHeader ? JSON.parse(decodeURIComponent(manifestHeader)) : undefined;

  return { blob: await resposta.blob(), nomeArquivo: decodeURIComponent(nome), manifest };
}

async function enviarArquivo<T>(caminho: string, arquivo: File): Promise<T> {
  const corpo = new FormData();
  corpo.append("arquivo", arquivo);

  const cabecalhos: Record<string, string> = {
    Accept: "application/json",
  };

  if (tokenAtual) {
    cabecalhos.Authorization = `Bearer ${tokenAtual}`;
  }

  const resposta = await fetch(`${URL_API}${caminho}`, {
    method: "POST",
    headers: cabecalhos,
    body: corpo,
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
  baixarArquivo: requisicaoArquivo,
  enviarArquivo,
};
