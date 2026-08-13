import { LucideIcon } from "lucide-react-native";
import { Text, View } from "react-native";

import { useTema } from "../tema/TemaProvider";
import { espaco, fonte, raio } from "../tema/tokens";
import { Cartao } from "./ui/Cartao";

export function CartaoIndicador({
  titulo,
  valor,
  icone: Icone,
  tendencia,
  testID,
}: {
  titulo: string;
  valor: string | number;
  icone: LucideIcon;
  tendencia?: { valor: number; positiva: boolean };
  testID?: string;
}) {
  const { cores } = useTema();

  return (
    <Cartao testID={testID ?? `card-stats-${titulo.toLowerCase().replace(/\s+/g, "-")}`}>
      <View
        style={{
          padding: espaco.xl,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: espaco.lg,
        }}
      >
        <View style={{ flex: 1, gap: espaco.xs }}>
          <Text
            style={{
              color: cores.suaveTexto,
              fontSize: fonte.base,
              fontWeight: "500",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {titulo}
          </Text>
          <Text style={{ color: cores.texto, fontSize: fonte.xxxl, fontWeight: "700" }}>{valor}</Text>
          {tendencia ? (
            <Text
              style={{
                color: tendencia.positiva ? cores.grafico2 : cores.perigo,
                fontSize: fonte.base,
              }}
            >
              {`${tendencia.positiva ? "+" : ""}${tendencia.valor}% desde ontem`}
            </Text>
          ) : null}
        </View>

        <View
          style={{
            height: 48,
            width: 48,
            borderRadius: raio.medio,
            backgroundColor: cores.suave,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icone size={24} color={cores.primaria} />
        </View>
      </View>
    </Cartao>
  );
}
