import { ActivityIndicator, Pressable, StyleProp, Text, View, ViewStyle } from "react-native";

import { useTema } from "../../tema/TemaProvider";
import { espaco, fonte, raio } from "../../tema/tokens";

export type VarianteBotao = "primario" | "contorno" | "fantasma" | "secundario" | "perigo";

export type TamanhoBotao = "pequeno" | "medio" | "grande" | "icone";

const alturas: Record<TamanhoBotao, number> = {
  pequeno: 32,
  medio: 40,
  grande: 48,
  icone: 36,
};

export function Botao({
  titulo,
  onPress,
  variante = "primario",
  tamanho = "medio",
  icone,
  desabilitado,
  carregando,
  estilo,
  testID,
  larguraTotal,
}: {
  titulo?: string;
  onPress?: () => void;
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
  icone?: React.ReactNode;
  desabilitado?: boolean;
  carregando?: boolean;
  estilo?: StyleProp<ViewStyle>;
  testID?: string;
  larguraTotal?: boolean;
}) {
  const { cores } = useTema();

  const fundos: Record<VarianteBotao, string> = {
    primario: cores.primaria,
    contorno: "transparent",
    fantasma: "transparent",
    secundario: cores.secundaria,
    perigo: cores.perigo,
  };

  const textos: Record<VarianteBotao, string> = {
    primario: cores.primariaTexto,
    contorno: cores.texto,
    fantasma: cores.texto,
    secundario: cores.secundariaTexto,
    perigo: cores.perigoTexto,
  };

  const inativo = desabilitado || carregando;

  return (
    <Pressable
      testID={testID}
      onPress={inativo ? undefined : onPress}
      style={({ pressed }) => [
        {
          minHeight: alturas[tamanho],
          paddingHorizontal: tamanho === "icone" ? 0 : tamanho === "pequeno" ? espaco.md : espaco.lg,
          width: tamanho === "icone" ? alturas.icone : larguraTotal ? "100%" : undefined,
          borderRadius: raio.medio,
          backgroundColor: fundos[variante],
          borderWidth: variante === "contorno" ? 1 : 0,
          borderColor: cores.borda,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: espaco.sm,
          opacity: inativo ? 0.5 : pressed ? 0.85 : 1,
        },
        estilo,
      ]}
    >
      {carregando ? (
        <ActivityIndicator size="small" color={textos[variante]} />
      ) : (
        <>
          {icone ? <View>{icone}</View> : null}
          {titulo ? (
            <Text
              style={{
                color: textos[variante],
                fontSize: tamanho === "pequeno" ? fonte.sm : fonte.base,
                fontWeight: "600",
              }}
            >
              {titulo}
            </Text>
          ) : null}
        </>
      )}
    </Pressable>
  );
}
