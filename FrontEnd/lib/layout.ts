import { espaco, larguraBarraLateral } from "../tema/tokens";
import { useTema } from "../tema/TemaProvider";

export function useLarguraConteudo() {
  const { largura, ehDesktop } = useTema();
  const recheio = ehDesktop ? espaco.xl * 2 : espaco.md * 2;

  return Math.max(largura - (ehDesktop ? larguraBarraLateral : 0) - recheio, 280);
}

export function colunas(largura: number, minimo: number, maximo = 4) {
  return Math.max(1, Math.min(maximo, Math.floor(largura / minimo)));
}

export function larguraColuna(largura: number, quantidade: number, espacamento = espaco.lg) {
  return (largura - espacamento * (quantidade - 1)) / quantidade;
}
