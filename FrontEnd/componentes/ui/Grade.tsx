import { View } from "react-native";

import { larguraColuna } from "../../lib/layout";
import { espaco } from "../../tema/tokens";

export function Grade({
  children,
  colunas,
  largura,
  espacamento = espaco.lg,
}: {
  children: React.ReactNode[];
  colunas: number;
  largura: number;
  espacamento?: number;
}) {
  const larguraItem = larguraColuna(largura, colunas, espacamento);

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: espacamento }}>
      {children.map((filho, indice) => (
        <View key={indice} style={{ width: colunas === 1 ? "100%" : larguraItem }}>
          {filho}
        </View>
      ))}
    </View>
  );
}
