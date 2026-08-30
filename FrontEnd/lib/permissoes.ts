export const funcoes = {
  administrador: "Administrador",
  gerente: "Gerente",
  vendedor: "Vendedor",
  tecnico: "Técnico",
} as const;

export type FuncaoUsuario = (typeof funcoes)[keyof typeof funcoes];

const rotasPorFuncao: Record<string, readonly string[]> = {
  Administrador: [
    "/",
    "/pos",
    "/daily-sales",
    "/service-orders",
    "/clients",
    "/salespersons",
    "/products",
    "/services",
    "/reports",
    "/settings",
  ],
  Gerente: [
    "/",
    "/pos",
    "/daily-sales",
    "/service-orders",
    "/clients",
    "/salespersons",
    "/products",
    "/services",
    "/reports",
    "/settings",
  ],
  Vendedor: ["/", "/pos", "/daily-sales", "/clients", "/products", "/services", "/settings"],
  Técnico: ["/", "/service-orders", "/clients", "/services", "/settings"],
};

export function rotaBase(rota: string) {
  if (!rota || rota === "/") {
    return "/";
  }

  return `/${rota.split("/").filter(Boolean)[0]}`;
}

export function podeAcessarRota(funcao: string | undefined, rota: string) {
  const permitidas = rotasPorFuncao[funcao ?? ""] ?? [];
  return permitidas.includes(rotaBase(rota));
}

export function funcoesQuePodeCriar(funcao: string | undefined) {
  if (funcao === funcoes.administrador) {
    return ["Administrador", "Gerente", "Vendedor", "Técnico"];
  }

  if (funcao === funcoes.gerente) {
    return ["Vendedor", "Técnico"];
  }

  return [];
}

export function podeCriarFuncao(ator: string | undefined, alvo: string) {
  return funcoesQuePodeCriar(ator).includes(alvo);
}

export function ehGestao(funcao: string | undefined) {
  return funcao === funcoes.administrador || funcao === funcoes.gerente;
}

export function podeVerVendas(funcao: string | undefined) {
  return funcao === funcoes.administrador || funcao === funcoes.gerente || funcao === funcoes.vendedor;
}

export function podeVerOs(funcao: string | undefined) {
  return funcao === funcoes.administrador || funcao === funcoes.gerente || funcao === funcoes.tecnico;
}

export function podeVerProdutos(funcao: string | undefined) {
  return podeVerVendas(funcao);
}

export function podeVerRelatorios(funcao: string | undefined) {
  return ehGestao(funcao);
}

export function podeVerSecaoConfig(funcao: string | undefined) {
  return ehGestao(funcao);
}
