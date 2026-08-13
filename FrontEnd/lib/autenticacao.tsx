import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { api, definirToken } from "./api";
import { Usuario } from "./tipos";

const CHAVE_SESSAO = "brinkpdv:sessao";

type Sessao = {
  token: string;
  usuario: Usuario;
};

type ContextoAutenticacao = {
  usuario: Usuario | null;
  autenticado: boolean;
  carregando: boolean;
  entrar: (nomeUsuario: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
};

const Contexto = createContext<ContextoAutenticacao | null>(null);

export function AutenticacaoProvider({ children }: { children: React.ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_SESSAO)
      .then((salvo) => {
        if (!salvo) {
          return;
        }

        const recuperada = JSON.parse(salvo) as Sessao;
        definirToken(recuperada.token);
        setSessao(recuperada);
      })
      .catch(() => undefined)
      .finally(() => setCarregando(false));
  }, []);

  const entrar = useCallback(async (nomeUsuario: string, senha: string) => {
    const resposta = await api.criar<{ token: string; usuario: Usuario }>("/api/auth/login", {
      nomeUsuario,
      senha,
    });

    const nova: Sessao = { token: resposta.token, usuario: resposta.usuario };
    definirToken(nova.token);
    await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(nova));
    setSessao(nova);
  }, []);

  const sair = useCallback(async () => {
    definirToken(null);
    await AsyncStorage.removeItem(CHAVE_SESSAO);
    setSessao(null);
  }, []);

  const valor = useMemo<ContextoAutenticacao>(
    () => ({
      usuario: sessao?.usuario ?? null,
      autenticado: sessao !== null,
      carregando,
      entrar,
      sair,
    }),
    [sessao, carregando, entrar, sair],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAutenticacao() {
  const contexto = useContext(Contexto);

  if (!contexto) {
    throw new Error("useAutenticacao precisa estar dentro de AutenticacaoProvider.");
  }

  return contexto;
}
