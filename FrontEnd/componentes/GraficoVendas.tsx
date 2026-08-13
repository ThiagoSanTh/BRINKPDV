import { Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

import { useTema } from "../tema/TemaProvider";
import { espaco, fonte } from "../tema/tokens";
import { Cartao } from "./ui/Cartao";

export function GraficoVendas({
  dados,
  titulo = "Vendas dos últimos 7 dias",
  largura,
}: {
  dados: { data: string; valor: number }[];
  titulo?: string;
  largura: number;
}) {
  const { cores } = useTema();

  const maximo = Math.max(...dados.map((ponto) => ponto.valor), 10);
  const pontos = dados.map((ponto) => ({
    value: ponto.valor,
    label: ponto.data,
    dataPointText: ponto.valor > 0 ? `R$ ${ponto.valor.toFixed(0)}` : "",
  }));

  const larguraGrafico = Math.max(largura - 120, 240);

  return (
    <Cartao testID="card-sales-chart">
      <View style={{ padding: espaco.xl, gap: espaco.lg }}>
        <Text style={{ color: cores.texto, fontSize: fonte.lg, fontWeight: "600" }}>{titulo}</Text>

        <LineChart
          data={pontos}
          height={240}
          width={larguraGrafico}
          initialSpacing={16}
          spacing={larguraGrafico / 7.5}
          thickness={2}
          color={cores.primaria}
          dataPointsColor={cores.primaria}
          dataPointsRadius={4}
          textColor={cores.suaveTexto}
          textFontSize={10}
          textShiftY={-6}
          hideRules={false}
          rulesColor={cores.borda}
          rulesType="dashed"
          yAxisColor={cores.borda}
          xAxisColor={cores.borda}
          yAxisTextStyle={{ color: cores.suaveTexto, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: cores.suaveTexto, fontSize: 10 }}
          noOfSections={4}
          maxValue={Math.ceil(maximo * 1.2)}
          yAxisLabelPrefix="R$ "
          curved
        />
      </View>
    </Cartao>
  );
}
