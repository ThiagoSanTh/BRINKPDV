import { Linking } from "react-native";

import { moeda } from "./formato";
import { OrdemServico } from "./tipos";

function somenteDigitos(telefone?: string | null) {
  return (telefone ?? "").replace(/\D/g, "");
}

export function telefoneWhatsApp(telefone?: string | null) {
  const digitos = somenteDigitos(telefone);

  if (digitos.length === 10 || digitos.length === 11) {
    return `55${digitos}`;
  }

  return digitos;
}

export function montarMensagemOs(ordem: OrdemServico) {
  const saida = ordem.dataSaida ? `\nSaída: ${formatarData(ordem.dataSaida)}` : "";
  const aparelho = ordem.aparelho || `${ordem.marca} ${ordem.modelo}`.trim();

  return (
    `*BRINKCELL - Ordem de Serviço*\n` +
    `OS: ${ordem.numero}\n` +
    `Cliente: ${ordem.cliente}\n` +
    `Aparelho: ${aparelho} (${ordem.tipoAparelho || "—"})\n` +
    `Estado: ${ordem.estadoAparelho || "—"}\n` +
    `Defeito: ${ordem.problema}\n` +
    `Status do conserto: ${ordem.status}\n` +
    `Valor: ${moeda(ordem.valor)}\n` +
    `Prazo: ${formatarData(ordem.prazo)}\n` +
    `Entrada: ${formatarData(ordem.data)}` +
    saida
  );
}

function formatarData(iso: string) {
  const data = iso.length <= 10 ? new Date(`${iso}T00:00:00`) : new Date(iso);
  return data.toLocaleDateString("pt-BR");
}

export async function compartilharOsWhatsApp(ordem: OrdemServico) {
  const destino = telefoneWhatsApp(ordem.contatoCliente);

  if (destino.length < 12) {
    throw new Error("A OS precisa de um telefone válido para abrir o WhatsApp.");
  }

  const url = `https://wa.me/${destino}?text=${encodeURIComponent(montarMensagemOs(ordem))}`;
  await Linking.openURL(url);
}
