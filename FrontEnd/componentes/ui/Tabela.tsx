import { ScrollView, StyleProp, Text, TextStyle, View, ViewStyle } from "react-native";

import { useTema } from "../../tema/TemaProvider";
import { espaco, fonte } from "../../tema/tokens";

export function Tabela({
  children,
  larguraMinima,
}: {
  children: React.ReactNode;
  larguraMinima?: number;
}) {
  if (!larguraMinima) {
    return <View>{children}</View>;
  }

  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator
      style={{ width: "100%" }}
      contentContainerStyle={{ minWidth: larguraMinima }}
    >
      <View style={{ width: larguraMinima, minWidth: larguraMinima }}>{children}</View>
    </ScrollView>
  );
}

export function LinhaTabela({
  children,
  cabecalho,
  estilo,
  testID,
}: {
  children: React.ReactNode;
  cabecalho?: boolean;
  estilo?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const { cores } = useTema();

  return (
    <View
      testID={testID}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: espaco.sm,
          paddingVertical: cabecalho ? espaco.sm : espaco.md,
          borderBottomWidth: 1,
          borderBottomColor: cores.borda,
        },
        estilo,
      ]}
    >
      {children}
    </View>
  );
}

export function CelulaTabela({
  children,
  proporcao = 1,
  alinhamento = "flex-start",
  cabecalho,
  estiloTexto,
  testID,
}: {
  children: React.ReactNode;
  proporcao?: number;
  alinhamento?: "flex-start" | "center" | "flex-end";
  cabecalho?: boolean;
  estiloTexto?: StyleProp<TextStyle>;
  testID?: string;
}) {
  const { cores } = useTema();

  const conteudo =
    typeof children === "string" || typeof children === "number" ? (
      <Text
        testID={testID}
        numberOfLines={2}
        style={[
          {
            color: cabecalho ? cores.suaveTexto : cores.texto,
            fontSize: cabecalho ? fonte.xs : fonte.base,
            fontWeight: cabecalho ? "600" : "400",
            textTransform: cabecalho ? "uppercase" : "none",
          },
          estiloTexto,
        ]}
      >
        {children}
      </Text>
    ) : (
      children
    );

  return (
    <View
      style={{
        flexGrow: proporcao,
        flexShrink: 0,
        flexBasis: 0,
        minWidth: 72 * proporcao,
        alignItems: alinhamento,
        justifyContent: "center",
      }}
    >
      {conteudo}
    </View>
  );
}
