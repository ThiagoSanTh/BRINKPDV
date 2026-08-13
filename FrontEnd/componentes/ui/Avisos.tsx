import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Text, View } from "react-native";

import { useTema } from "../../tema/TemaProvider";
import { espaco, fonte, raio } from "../../tema/tokens";

type Aviso = {
  id: number;
  titulo: string;
  descricao?: string;
  variante: "padrao" | "perigo";
};

type ContextoAvisos = {
  avisar: (aviso: { titulo: string; descricao?: string; variante?: "padrao" | "perigo" }) => void;
};

const Contexto = createContext<ContextoAvisos | null>(null);

export function AvisosProvider({ children }: { children: React.ReactNode }) {
  const { cores } = useTema();
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  const avisar = useCallback<ContextoAvisos["avisar"]>(({ titulo, descricao, variante = "padrao" }) => {
    const id = Date.now() + Math.random();
    setAvisos((atuais) => [...atuais, { id, titulo, descricao, variante }]);
    setTimeout(() => setAvisos((atuais) => atuais.filter((aviso) => aviso.id !== id)), 4000);
  }, []);

  const valor = useMemo(() => ({ avisar }), [avisar]);

  return (
    <Contexto.Provider value={valor}>
      {children}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: espaco.lg,
          bottom: espaco.lg,
          gap: espaco.sm,
          maxWidth: 380,
        }}
      >
        {avisos.map((aviso) => (
          <View
            key={aviso.id}
            testID="aviso"
            style={{
              backgroundColor: aviso.variante === "perigo" ? cores.perigo : cores.cartao,
              borderColor: aviso.variante === "perigo" ? cores.perigo : cores.cartaoBorda,
              borderWidth: 1,
              borderRadius: raio.medio,
              paddingHorizontal: espaco.lg,
              paddingVertical: espaco.md,
              gap: 2,
              shadowColor: cores.sombra,
              shadowOpacity: 1,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }}
          >
            <Text
              style={{
                color: aviso.variante === "perigo" ? cores.perigoTexto : cores.texto,
                fontSize: fonte.base,
                fontWeight: "600",
              }}
            >
              {aviso.titulo}
            </Text>
            {aviso.descricao ? (
              <Text
                style={{
                  color: aviso.variante === "perigo" ? cores.perigoTexto : cores.suaveTexto,
                  fontSize: fonte.sm,
                }}
              >
                {aviso.descricao}
              </Text>
            ) : null}
          </View>
        ))}
      </View>
    </Contexto.Provider>
  );
}

export function useAvisos() {
  const contexto = useContext(Contexto);

  if (!contexto) {
    throw new Error("useAvisos precisa estar dentro de AvisosProvider.");
  }

  return contexto;
}
