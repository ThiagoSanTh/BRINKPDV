import { Check, ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { useTema } from "../../tema/TemaProvider";
import { espaco, fonte, raio } from "../../tema/tokens";

export function Seletor<T extends string>({
  valor,
  opcoes,
  onChange,
  placeholder = "Selecione",
  testID,
}: {
  valor: T | null;
  opcoes: readonly { valor: T; rotulo: string }[];
  onChange: (valor: T) => void;
  placeholder?: string;
  testID?: string;
}) {
  const { cores, largura } = useTema();
  const [aberto, setAberto] = useState(false);

  const selecionada = opcoes.find((opcao) => opcao.valor === valor);

  return (
    <>
      <Pressable
        testID={testID}
        onPress={() => setAberto(true)}
        style={{
          minHeight: 40,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: espaco.md,
          borderWidth: 1,
          borderColor: cores.campo,
          borderRadius: raio.medio,
          backgroundColor: cores.cartao,
        }}
      >
        <Text
          style={{ color: selecionada ? cores.texto : cores.suaveTexto, fontSize: fonte.base }}
          numberOfLines={1}
        >
          {selecionada?.rotulo ?? placeholder}
        </Text>
        <ChevronDown size={16} color={cores.suaveTexto} />
      </Pressable>

      <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
        <Pressable
          onPress={() => setAberto(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            alignItems: "center",
            justifyContent: "center",
            padding: espaco.lg,
          }}
        >
          <View
            style={{
              width: Math.min(largura - espaco.xl, 420),
              maxHeight: "70%",
              backgroundColor: cores.cartao,
              borderRadius: raio.grande,
              borderWidth: 1,
              borderColor: cores.cartaoBorda,
              paddingVertical: espaco.sm,
            }}
          >
            <ScrollView>
              {opcoes.map((opcao) => (
                <Pressable
                  key={opcao.valor}
                  testID={`opcao-${opcao.valor}`}
                  onPress={() => {
                    onChange(opcao.valor);
                    setAberto(false);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: espaco.lg,
                    paddingVertical: espaco.md,
                  }}
                >
                  <Text style={{ color: cores.texto, fontSize: fonte.base }}>{opcao.rotulo}</Text>
                  {opcao.valor === valor ? <Check size={16} color={cores.primaria} /> : null}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
