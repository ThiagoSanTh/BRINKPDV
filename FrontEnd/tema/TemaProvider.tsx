import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme, useWindowDimensions } from "react-native";

import { limiteDesktop, NomeTema, Paleta, paletas } from "./tokens";

const CHAVE_TEMA = "brinkpdv:tema";

type ContextoTema = {
  tema: NomeTema;
  cores: Paleta;
  alternarTema: () => void;
  ehDesktop: boolean;
  largura: number;
};

const Contexto = createContext<ContextoTema | null>(null);

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const esquemaSistema = useColorScheme();
  const { width } = useWindowDimensions();
  const [tema, setTema] = useState<NomeTema>("claro");
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_TEMA)
      .then((salvo) => {
        if (salvo === "claro" || salvo === "escuro") {
          setTema(salvo);
        } else if (esquemaSistema === "dark") {
          setTema("escuro");
        }
      })
      .finally(() => setCarregado(true));
  }, [esquemaSistema]);

  const alternarTema = useCallback(() => {
    setTema((atual) => {
      const proximo: NomeTema = atual === "claro" ? "escuro" : "claro";
      AsyncStorage.setItem(CHAVE_TEMA, proximo).catch(() => undefined);
      return proximo;
    });
  }, []);

  const valor = useMemo<ContextoTema>(
    () => ({
      tema,
      cores: paletas[tema],
      alternarTema,
      ehDesktop: width >= limiteDesktop,
      largura: width,
    }),
    [tema, alternarTema, width],
  );

  if (!carregado) {
    return null;
  }

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useTema() {
  const contexto = useContext(Contexto);

  if (!contexto) {
    throw new Error("useTema precisa estar dentro de TemaProvider.");
  }

  return contexto;
}
