import { Moon, Sun } from "lucide-react-native";

import { useTema } from "../tema/TemaProvider";
import { Botao } from "./ui/Botao";

export function AlternarTema() {
  const { tema, cores, alternarTema } = useTema();

  return (
    <Botao
      testID="button-theme-toggle"
      variante="contorno"
      tamanho="icone"
      onPress={alternarTema}
      icone={
        tema === "claro" ? <Moon size={16} color={cores.texto} /> : <Sun size={16} color={cores.texto} />
      }
    />
  );
}
