import { Text, View } from "react-native";

import { useTema } from "../../tema/TemaProvider";
import { espaco, fonte, raio } from "../../tema/tokens";

export type VarianteSelo = "primario" | "suave" | "contorno" | "perigo" | "sucesso" | "alerta";

export function Selo({
  texto,
  variante = "suave",
  testID,
}: {
  texto: string;
  variante?: VarianteSelo;
  testID?: string;
}) {
  const { cores } = useTema();

  const fundos: Record<VarianteSelo, string> = {
    primario: cores.primaria,
    suave: cores.suave,
    contorno: "transparent",
    perigo: cores.perigo,
    sucesso: cores.sucesso,
    alerta: cores.alerta,
  };

  const textos: Record<VarianteSelo, string> = {
    primario: cores.primariaTexto,
    suave: cores.suaveTexto,
    contorno: cores.texto,
    perigo: cores.perigoTexto,
    sucesso: "hsl(0, 0%, 100%)",
    alerta: "hsl(0, 0%, 100%)",
  };

  return (
    <View
      testID={testID}
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: espaco.sm,
        paddingVertical: 3,
        borderRadius: raio.cheio,
        backgroundColor: fundos[variante],
        borderWidth: variante === "contorno" ? 1 : 0,
        borderColor: cores.borda,
      }}
    >
      <Text style={{ color: textos[variante], fontSize: fonte.xs, fontWeight: "600" }}>{texto}</Text>
    </View>
  );
}
