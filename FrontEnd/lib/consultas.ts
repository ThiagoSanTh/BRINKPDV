import { QueryClient } from "@tanstack/react-query";

import { api } from "./api";

export const clienteConsultas = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: ({ queryKey }) => api.obter(queryKey.join("")),
      staleTime: 15_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

export const chaves = {
  produtos: ["/api/produtos"],
  categoriasProdutos: ["/api/produtos/categorias"],
  servicos: ["/api/servicos"],
  vendas: ["/api/vendas"],
  vendasHoje: ["/api/vendas/hoje"],
  vendedores: ["/api/vendedores"],
  ordensServico: ["/api/ordens-servico"],
  clientes: ["/api/clientes"],
  historicoCliente: (id: string) => ["/api/clientes/", id, "/ordens"],
  usuarios: ["/api/usuarios"],
  configuracaoLoja: ["/api/configuracao-loja"],
  caixa: ["/api/caixa"],
};
