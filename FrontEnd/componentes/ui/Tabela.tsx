import { ScrollView, StyleProp, Text, TextStyle, View, ViewStyle } from "react-native";

import { useTema } from "../../tema/TemaProvider";
import { espaco, fonte } from "../../tema/tokens";

const alinhamentoTexto = {
  "flex-start": "left",
  center: "center",
  "flex-end": "right",
} as const;

export function Tabela({
  children,
  larguraMinima,
}: {
  children: React.ReactNode;
  larguraMinima?: number;
}) {
  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator
      style={{ width: "100%" }}
      contentContainerStyle={{ flexGrow: 1, minWidth: larguraMinima ?? "100%" }}
    >
      <View style={{ flexGrow: 1, width: "100%", minWidth: larguraMinima }}>{children}</View>
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
          width: "100%",
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
  alinhamento = "center",
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
            textAlign: alinhamentoTexto[alinhamento],
            width: "100%",
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
        flexShrink: 1,
        flexBasis: 0,
        minWidth: 56,
        alignItems: alinhamento,
        justifyContent: "center",
      }}
    >
      {conteudo}
    </View>
  );
}
