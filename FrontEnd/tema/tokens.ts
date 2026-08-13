export type NomeTema = "claro" | "escuro";

export type Paleta = {
  fundo: string;
  texto: string;
  borda: string;
  cartao: string;
  cartaoTexto: string;
  cartaoBorda: string;
  barraLateral: string;
  barraLateralTexto: string;
  barraLateralBorda: string;
  barraLateralDestaque: string;
  barraLateralDestaqueTexto: string;
  primaria: string;
  primariaTexto: string;
  secundaria: string;
  secundariaTexto: string;
  suave: string;
  suaveTexto: string;
  destaque: string;
  destaqueTexto: string;
  perigo: string;
  perigoTexto: string;
  campo: string;
  foco: string;
  grafico1: string;
  grafico2: string;
  grafico3: string;
  grafico4: string;
  grafico5: string;
  sucesso: string;
  alerta: string;
  sombra: string;
};

export const paletas: Record<NomeTema, Paleta> = {
  claro: {
    fundo: "hsl(0, 0%, 98%)",
    texto: "hsl(220, 15%, 20%)",
    borda: "hsl(220, 15%, 88%)",
    cartao: "hsl(0, 0%, 100%)",
    cartaoTexto: "hsl(220, 15%, 20%)",
    cartaoBorda: "hsl(220, 10%, 92%)",
    barraLateral: "hsl(220, 5%, 94%)",
    barraLateralTexto: "hsl(220, 15%, 20%)",
    barraLateralBorda: "hsl(220, 8%, 86%)",
    barraLateralDestaque: "hsl(220, 8%, 90%)",
    barraLateralDestaqueTexto: "hsl(220, 15%, 25%)",
    primaria: "hsl(220, 85%, 35%)",
    primariaTexto: "hsl(220, 85%, 98%)",
    secundaria: "hsl(220, 8%, 88%)",
    secundariaTexto: "hsl(220, 15%, 25%)",
    suave: "hsl(220, 10%, 92%)",
    suaveTexto: "hsl(220, 10%, 45%)",
    destaque: "hsl(220, 15%, 90%)",
    destaqueTexto: "hsl(220, 15%, 25%)",
    perigo: "hsl(0, 70%, 50%)",
    perigoTexto: "hsl(0, 70%, 98%)",
    campo: "hsl(220, 20%, 75%)",
    foco: "hsl(220, 85%, 35%)",
    grafico1: "hsl(220, 85%, 35%)",
    grafico2: "hsl(160, 60%, 40%)",
    grafico3: "hsl(280, 60%, 45%)",
    grafico4: "hsl(40, 75%, 45%)",
    grafico5: "hsl(10, 70%, 50%)",
    sucesso: "hsl(160, 60%, 40%)",
    alerta: "hsl(40, 75%, 45%)",
    sombra: "rgba(45, 51, 61, 0.10)",
  },
  escuro: {
    fundo: "hsl(220, 15%, 12%)",
    texto: "hsl(220, 5%, 95%)",
    borda: "hsl(220, 10%, 22%)",
    cartao: "hsl(220, 15%, 16%)",
    cartaoTexto: "hsl(220, 5%, 95%)",
    cartaoBorda: "hsl(220, 10%, 22%)",
    barraLateral: "hsl(220, 15%, 14%)",
    barraLateralTexto: "hsl(220, 5%, 95%)",
    barraLateralBorda: "hsl(220, 10%, 22%)",
    barraLateralDestaque: "hsl(220, 15%, 20%)",
    barraLateralDestaqueTexto: "hsl(220, 5%, 95%)",
    primaria: "hsl(220, 80%, 60%)",
    primariaTexto: "hsl(220, 80%, 98%)",
    secundaria: "hsl(220, 15%, 22%)",
    secundariaTexto: "hsl(220, 5%, 95%)",
    suave: "hsl(220, 12%, 20%)",
    suaveTexto: "hsl(220, 5%, 70%)",
    destaque: "hsl(220, 15%, 20%)",
    destaqueTexto: "hsl(220, 5%, 95%)",
    perigo: "hsl(0, 70%, 50%)",
    perigoTexto: "hsl(0, 70%, 98%)",
    campo: "hsl(220, 15%, 35%)",
    foco: "hsl(220, 80%, 60%)",
    grafico1: "hsl(220, 80%, 70%)",
    grafico2: "hsl(160, 60%, 65%)",
    grafico3: "hsl(280, 60%, 70%)",
    grafico4: "hsl(40, 75%, 65%)",
    grafico5: "hsl(10, 70%, 65%)",
    sucesso: "hsl(160, 60%, 55%)",
    alerta: "hsl(40, 75%, 60%)",
    sombra: "rgba(0, 0, 0, 0.4)",
  },
};

export const raio = {
  pequeno: 6,
  medio: 8,
  grande: 12,
  cheio: 999,
};

export const espaco = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const fonte = {
  xs: 12,
  sm: 13,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

export const larguraBarraLateral = 256;

export const limiteDesktop = 1024;
