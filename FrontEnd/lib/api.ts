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

export const api = {
  obter: <T>(caminho: string) => requisicao<T>(caminho),
  criar: <T>(caminho: string, corpo: unknown) =>
    requisicao<T>(caminho, { method: "POST", body: JSON.stringify(corpo) }),
  atualizar: <T>(caminho: string, corpo: unknown) =>
    requisicao<T>(caminho, { method: "PUT", body: JSON.stringify(corpo) }),
  remover: (caminho: string) => requisicao<void>(caminho, { method: "DELETE" }),
};
