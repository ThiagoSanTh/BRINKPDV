import { StyleProp, Text, TextStyle, View, ViewStyle } from "react-native";

import { useTema } from "../../tema/TemaProvider";
import { espaco, fonte, raio } from "../../tema/tokens";

export function Cartao({
  children,
  estilo,
  testID,
}: {
  children: React.ReactNode;
  estilo?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const { cores } = useTema();

  return (
    <View
      testID={testID}
      style={[
        {
          backgroundColor: cores.cartao,
          borderColor: cores.cartaoBorda,
          borderWidth: 1,
          borderRadius: raio.grande,
        },
        estilo,
      ]}
    >
      {children}
    </View>
  );
}

export function CartaoCabecalho({
  children,
  estilo,
}: {
  children: React.ReactNode;
  estilo?: StyleProp<ViewStyle>;
}) {
  return <View style={[{ padding: espaco.lg, gap: espaco.xs }, estilo]}>{children}</View>;
}

export function CartaoTitulo({
  children,
  estilo,
  testID,
}: {
  children: React.ReactNode;
  estilo?: StyleProp<TextStyle>;
  testID?: string;
}) {
  const { cores } = useTema();

  return (
    <Text
      testID={testID}
      style={[{ color: cores.cartaoTexto, fontSize: fonte.md, fontWeight: "600" }, estilo]}
    >
      {children}
    </Text>
  );
}

export function CartaoDescricao({ children }: { children: React.ReactNode }) {
  const { cores } = useTema();

  return <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>{children}</Text>;
}

export function CartaoConteudo({
  children,
  estilo,
}: {
  children: React.ReactNode;
  estilo?: StyleProp<ViewStyle>;
}) {
  return <View style={[{ paddingHorizontal: espaco.lg, paddingBottom: espaco.lg }, estilo]}>{children}</View>;
}
