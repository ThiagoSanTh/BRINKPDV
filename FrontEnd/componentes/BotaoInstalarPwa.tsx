import { Download } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

import { useTema } from "../tema/TemaProvider";
import { Botao } from "./ui/Botao";

type EventoInstalacao = Event & {
  prompt: () => Promise<void>;
};

export function BotaoInstalarPwa() {
  const { cores } = useTema();
  const [evento, setEvento] = useState<EventoInstalacao | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      return;
    }

    const aoPedir = (pedido: Event) => {
      pedido.preventDefault();
      setEvento(pedido as EventoInstalacao);
    };

    window.addEventListener("beforeinstallprompt", aoPedir);
    return () => window.removeEventListener("beforeinstallprompt", aoPedir);
  }, []);

  if (!evento) {
    return null;
  }

  return (
    <Botao
      testID="button-install-pwa"
      variante="contorno"
      tamanho="pequeno"
      titulo="Instalar"
      icone={<Download size={14} color={cores.texto} />}
      onPress={async () => {
        await evento.prompt();
        setEvento(null);
      }}
    />
  );
}
