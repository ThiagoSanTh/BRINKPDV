import { useState } from "react";
import { KeyboardTypeOptions, StyleProp, Text, TextInput, View, ViewStyle } from "react-native";

import { useTema } from "../../tema/TemaProvider";
import { espaco, fonte, raio } from "../../tema/tokens";

export function Rotulo({ children }: { children: React.ReactNode }) {
  const { cores } = useTema();

  return (
    <Text style={{ color: cores.texto, fontSize: fonte.base, fontWeight: "500" }}>{children}</Text>
  );
}

export function Campo({
  valor,
  onChange,
  placeholder,
  iconeEsquerda,
  iconeDireita,
  segredo,
  teclado,
  testID,
  estilo,
  multilinhas,
  aoEnviar,
  autoFoco,
  editavel = true,
}: {
  valor: string;
  onChange: (texto: string) => void;
  placeholder?: string;
  iconeEsquerda?: React.ReactNode;
  iconeDireita?: React.ReactNode;
  segredo?: boolean;
  teclado?: KeyboardTypeOptions;
  testID?: string;
  estilo?: StyleProp<ViewStyle>;
  multilinhas?: boolean;
  aoEnviar?: () => void;
  autoFoco?: boolean;
  editavel?: boolean;
}) {
  const { cores } = useTema();
  const [focado, setFocado] = useState(false);

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: multilinhas ? "flex-start" : "center",
          gap: espaco.sm,
          minHeight: multilinhas ? 88 : 40,
          paddingHorizontal: espaco.md,
          paddingVertical: multilinhas ? espaco.sm : 0,
          borderWidth: 1,
          borderColor: focado ? cores.foco : cores.campo,
          borderRadius: raio.medio,
          backgroundColor: cores.cartao,
          opacity: editavel ? 1 : 0.6,
        },
        estilo,
      ]}
    >
      {iconeEsquerda}
      <TextInput
        testID={testID}
        value={valor}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={cores.suaveTexto}
        secureTextEntry={segredo}
        keyboardType={teclado}
        multiline={multilinhas}
        autoFocus={autoFoco}
        editable={editavel}
        onFocus={() => setFocado(true)}
        onBlur={() => setFocado(false)}
        onSubmitEditing={aoEnviar}
        style={{
          flex: 1,
          color: cores.texto,
          fontSize: fonte.base,
          paddingVertical: multilinhas ? espaco.xs : 0,
          minHeight: multilinhas ? 72 : 38,
          outlineStyle: "none",
        } as never}
      />
      {iconeDireita}
    </View>
  );
}

export function AreaTexto(props: Parameters<typeof Campo>[0]) {
  return <Campo {...props} multilinhas />;
}
