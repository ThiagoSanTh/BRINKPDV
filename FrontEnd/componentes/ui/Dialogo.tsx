import { X } from "lucide-react-native";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { useTema } from "../../tema/TemaProvider";
import { espaco, fonte, raio } from "../../tema/tokens";

export function Dialogo({
  aberto,
  onFechar,
  titulo,
  descricao,
  icone,
  children,
  rodape,
  testID,
}: {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  descricao?: string;
  icone?: React.ReactNode;
  children?: React.ReactNode;
  rodape?: React.ReactNode;
  testID?: string;
}) {
  const { cores, largura } = useTema();

  return (
    <Modal visible={aberto} transparent animationType="fade" onRequestClose={onFechar}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          alignItems: "center",
          justifyContent: "center",
          padding: espaco.lg,
        }}
      >
        <View
          testID={testID}
          style={{
            width: Math.min(largura - espaco.xl, 560),
            maxHeight: "85%",
            backgroundColor: cores.cartao,
            borderRadius: raio.grande,
            borderWidth: 1,
            borderColor: cores.cartaoBorda,
            padding: espaco.xl,
            gap: espaco.lg,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: espaco.md }}>
            <View style={{ flex: 1, gap: espaco.xs }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: espaco.sm }}>
                {icone}
                <Text style={{ color: cores.texto, fontSize: fonte.lg, fontWeight: "700" }}>{titulo}</Text>
              </View>
              {descricao ? (
                <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>{descricao}</Text>
              ) : null}
            </View>
            <Pressable onPress={onFechar} testID="button-fechar-dialogo" hitSlop={8}>
              <X size={18} color={cores.suaveTexto} />
            </Pressable>
          </View>

          {children ? <ScrollView contentContainerStyle={{ gap: espaco.md }}>{children}</ScrollView> : null}

          {rodape ? (
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: espaco.sm }}>{rodape}</View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
