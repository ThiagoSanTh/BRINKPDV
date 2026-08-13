export type Produto = {
  id: string;
  sku: string;
  nome: string;
  categoria: string;
  preco: number;
  precoCusto: number | null;
  estoque: number;
  codigoBarras: string | null;
  imagem: string | null;
  estoqueBaixo: boolean;
};

export type ItemVenda = {
  produtoId: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  desconto: number;
  total: number;
};

export type Venda = {
  id: string;
  vendedorId: string | null;
  vendedorNome: string | null;
  subtotal: number;
  descontoTotal: number;
  total: number;
  formaPagamento: string;
  observacao: string | null;
  criadoEm: string;
  itens: ItemVenda[];
};

export type Vendedor = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  comissao: number;
  totalVendas: number;
  ativo: boolean;
  dataEntrada: string;
};

export type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  observacoes: string | null;
  criadoEm: string;
};

export type ResultadoWhatsApp = {
  enviado: boolean;
  configurado: boolean;
  urlWhatsApp: string | null;
  mensagem: string;
};

export type OrdemServico = {
  id: string;
  numero: string;
  clienteId: string | null;
  cliente: string;
  contatoCliente: string;
  tipoAparelho: string;
  marca: string;
  modelo: string;
  aparelho: string;
  estadoAparelho: string;
  problema: string;
  status: string;
  prioridade: string;
  valor: number;
  data: string;
  prazo: string;
  dataSaida: string | null;
  whatsApp?: ResultadoWhatsApp | null;
};

export type Usuario = {
  id: string;
  nomeUsuario: string;
  email: string | null;
  funcao: string;
  ativo: boolean;
  criadoEm: string;
};

export type ConfiguracaoLoja = {
  id?: string | null;
  nomeLoja: string;
  logoLoja: string | null;
  telefoneLoja: string | null;
  enderecoLoja: string | null;
  razaoSocial: string | null;
  cnpj: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  comprovanteIncluirLogo: boolean;
  comprovanteCabecalho: string | null;
  comprovanteRodape: string | null;
  comprovanteMostrarDadosFiscais: boolean;
  impressoraNome: string | null;
  impressoraModelo: string | null;
  impressoraLarguraPapel: string | null;
  impressoraCorteAutomatico: boolean;
  alertaEstoqueBaixo: boolean;
  somFinalizacao: boolean;
  impressaoAutomatica: boolean;
  whatsAppToken?: string | null;
  whatsAppPhoneNumberId?: string | null;
  whatsAppConfigurado?: boolean;
};

export type MovimentoCaixa = {
  id: string;
  tipo: "entrada" | "saida";
  valor: number;
  descricao: string | null;
  criadoEm: string;
};

export type ResumoCaixa = {
  entradas: number;
  saidas: number;
  saldo: number;
  movimentos: MovimentoCaixa[];
};

export const formasPagamento = ["Dinheiro", "Crédito", "Débito", "PIX"] as const;

export const statusOrdemServico = [
  "Orçamento",
  "Aguardando aprovação",
  "Em Andamento",
  "Aguardando peça",
  "Pronto para retirada",
  "Entregue",
  "Cancelada",
] as const;

export const tiposAparelho = [
  "Smartphone",
  "Tablet",
  "Notebook",
  "Videogame/Console",
  "Smartwatch",
  "Fone/Headset",
  "TV/Monitor",
  "Câmera",
  "Controle",
  "Outro",
] as const;

export const estadosAparelho = [
  "Sem marcas",
  "Bom",
  "Arranhado",
  "Trincado",
  "Quebrado",
  "Molhado",
  "Não liga",
] as const;

export const marcasAparelho = [
  "Apple",
  "Samsung",
  "Motorola",
  "Xiaomi",
  "LG",
  "Sony",
  "Microsoft",
  "Nintendo",
  "Asus",
  "Lenovo",
  "Dell",
  "HP",
  "Positivo",
  "Multilaser",
  "JBL",
  "Outra",
] as const;

export const prioridadesOrdemServico = ["Baixa", "Média", "Alta"] as const;

export const funcoesUsuario = ["Administrador", "Gerente", "Vendedor", "Técnico"] as const;
