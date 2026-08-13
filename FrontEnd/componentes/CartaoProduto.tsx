import { Package, Plus } from "lucide-react-native";
import { Image, Text, View } from "react-native";

import { useTema } from "../tema/TemaProvider";
import { espaco, fonte, raio } from "../tema/tokens";
import { Botao } from "./ui/Botao";
import { Cartao } from "./ui/Cartao";
import { Selo } from "./ui/Selo";

export function CartaoProduto({
  id,
  nome,
  preco,
  estoque,
  imagem,
  categoria,
  aoAdicionar,
  largura,
}: {
  id: string;
  nome: string;
  preco: number;
  estoque: number;
  imagem?: string | null;
  categoria?: string;
  aoAdicionar?: (id: string) => void;
  largura: number;
}) {
  const { cores } = useTema();
  const estoqueBaixo = estoque < 10;

  return (
    <Cartao testID={`card-product-${id}`} estilo={{ width: largura, overflow: "hidden" }}>
      <View
        style={{
          height: (largura * 3) / 4,
          backgroundColor: cores.suave,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {imagem ? (
          <Image source={{ uri: imagem }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        ) : (
          <Package size={48} color={cores.suaveTexto} />
        )}

        {estoqueBaixo ? (
          <View style={{ position: "absolute", top: espaco.sm, right: espaco.sm }}>
            <Selo texto="Estoque Baixo" variante="perigo" testID={`badge-low-stock-${id}`} />
          </View>
        ) : null}
      </View>

      <View style={{ padding: espaco.lg, gap: espaco.sm }}>
        {categoria ? (
          <Text
            style={{
              color: cores.suaveTexto,
              fontSize: fonte.xs,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {categoria}
          </Text>
        ) : null}

        <Text
          testID={`text-product-name-${id}`}
          numberOfLines={2}
          style={{ color: cores.texto, fontSize: fonte.md, fontWeight: "500", minHeight: 40 }}
        >
          {nome}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Text
              testID={`text-price-${id}`}
              style={{ color: cores.primaria, fontSize: fonte.xl, fontWeight: "700" }}
            >
              {`R$ ${preco.toFixed(2)}`}
            </Text>
            <Text testID={`text-stock-${id}`} style={{ color: cores.suaveTexto, fontSize: fonte.xs }}>
              {`Estoque: ${estoque}`}
            </Text>
          </View>

          <Botao
            testID={`button-add-to-cart-${id}`}
            tamanho="icone"
            onPress={() => aoAdicionar?.(id)}
            icone={<Plus size={16} color={cores.primariaTexto} />}
            estilo={{ borderRadius: raio.medio }}
          />
        </View>
      </View>
    </Cartao>
  );
}
