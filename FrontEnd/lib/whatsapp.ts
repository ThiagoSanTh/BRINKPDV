import { Linking } from "react-native";

import { ResultadoWhatsApp } from "./tipos";

export async function abrirWhatsApp(resultado?: ResultadoWhatsApp | null) {
  if (!resultado) {
    return false;
  }

  if (resultado.enviado) {
    return true;
  }

  if (resultado.urlWhatsApp) {
    await Linking.openURL(resultado.urlWhatsApp);
    return true;
  }

  return false;
}
