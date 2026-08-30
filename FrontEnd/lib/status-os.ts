export const filtroEmAndamento = "__em_andamento__";

export function estaEncerradaOs(status: string) {
  return status === "Entregue" || status === "Cancelada" || status === "Concluída";
}

export function estaEmAndamentoOs(status: string) {
  return !estaEncerradaOs(status);
}
