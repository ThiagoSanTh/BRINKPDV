import { Text, View } from "react-native";

import { useTema } from "../../tema/TemaProvider";
import { espaco, fonte } from "../../tema/tokens";

export function TituloPagina({
  titulo,
  descricao,
  acoes,
}: {
  titulo: string;
  descricao?: string;
  acoes?: React.ReactNode;
}) {
  const { cores, ehDesktop } = useTema();

  return (
    <View
      style={{
        flexDirection: ehDesktop ? "row" : "column",
        alignItems: ehDesktop ? "flex-end" : "stretch",
        justifyContent: "space-between",
        gap: espaco.md,
      }}
    >
      <View style={{ gap: espaco.xs, flex: 1 }}>
        <Text
          testID="text-page-title"
          style={{ color: cores.texto, fontSize: fonte.xxxl, fontWeight: "700" }}
        >
          {titulo}
        </Text>
        {descricao ? (
          <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>{descricao}</Text>
        ) : null}
      </View>
      {acoes ? (
        <View style={{ flexDirection: "row", gap: espaco.sm, flexWrap: "wrap" }}>{acoes}</View>
      ) : null}
    </View>
  );
}

export function SubTitulo({ children }: { children: React.ReactNode }) {
  const { cores } = useTema();

  return (
    <Text style={{ color: cores.texto, fontSize: fonte.xl, fontWeight: "600" }}>{children}</Text>
  );
}
