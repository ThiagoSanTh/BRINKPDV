export function moeda(valor: number) {
  return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

export function hora(iso: string) {
  const data = new Date(iso);
  return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function dataCurta(iso: string) {
  const data = iso.length <= 10 ? new Date(`${iso}T00:00:00`) : new Date(iso);
  return data.toLocaleDateString("pt-BR");
}

export function dataHora(iso: string) {
  return `${dataCurta(iso)} ${hora(iso)}`;
}

export function diaSemanaCurto(data: Date) {
  return data.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
}

export function paraNumero(texto: string) {
  const limpo = texto.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const numero = Number(limpo);
  return Number.isFinite(numero) ? numero : 0;
}
