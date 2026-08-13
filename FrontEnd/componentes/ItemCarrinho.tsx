import { Minus, Plus, Trash2 } from "lucide-react-native";
import { Text, View } from "react-native";

import { moeda, paraNumero } from "../lib/formato";
import { useTema } from "../tema/TemaProvider";
import { espaco, fonte, raio } from "../tema/tokens";
import { Botao } from "./ui/Botao";
import { Campo } from "./ui/Campo";

export function ItemCarrinho({
  id,
  nome,
  preco,
  quantidade,
  desconto,
  aoIncrementar,
  aoDecrementar,
  aoRemover,
  aoMudarDesconto,
  aoMudarPreco,
}: {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  desconto: number;
  aoIncrementar: (id: string) => void;
  aoDecrementar: (id: string) => void;
  aoRemover: (id: string) => void;
  aoMudarDesconto: (id: string, valor: number) => void;
  aoMudarPreco: (id: string, valor: number) => void;
}) {
  const { cores } = useTema();
  const subtotal = preco * quantidade;
  const total = Math.max(0, subtotal - desconto);

  return (
    <View
      testID={`cart-item-${id}`}
      style={{
        borderWidth: 1,
        borderColor: cores.borda,
        borderRadius: raio.medio,
        padding: espaco.md,
        gap: espaco.md,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: espaco.sm }}>
        <View style={{ flex: 1, gap: espaco.xs }}>
          <Text
            testID={`text-cart-item-name-${id}`}
            numberOfLines={1}
            style={{ color: cores.texto, fontSize: fonte.base, fontWeight: "500" }}
          >
            {nome}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: espaco.xs }}>
            <Text style={{ color: cores.suaveTexto, fontSize: fonte.xs }}>R$</Text>
            <Campo
              testID={`input-item-price-${id}`}
              valor={String(preco)}
              onChange={(texto) => aoMudarPreco(id, paraNumero(texto))}
              teclado="decimal-pad"
              estilo={{ width: 90, minHeight: 28, paddingHorizontal: espaco.sm }}
            />
            <Text style={{ color: cores.suaveTexto, fontSize: fonte.xs }}>/ un</Text>
          </View>
        </View>

        <Botao
          testID={`button-remove-${id}`}
          variante="fantasma"
          tamanho="icone"
          onPress={() => aoRemover(id)}
          icone={<Trash2 size={16} color={cores.texto} />}
        />
      </View>

      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: espaco.sm, flexWrap: "wrap" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: espaco.xs }}>
          <Botao
            testID={`button-decrement-${id}`}
            variante="contorno"
            tamanho="icone"
            onPress={() => aoDecrementar(id)}
            icone={<Minus size={12} color={cores.texto} />}
            estilo={{ height: 32, width: 32, minHeight: 32 }}
          />
          <Text
            testID={`text-quantity-${id}`}
            style={{ color: cores.texto, fontSize: fonte.base, width: 32, textAlign: "center" }}
          >
            {quantidade}
          </Text>
          <Botao
            testID={`button-increment-${id}`}
            variante="contorno"
            tamanho="icone"
            onPress={() => aoIncrementar(id)}
            icone={<Plus size={12} color={cores.texto} />}
            estilo={{ height: 32, width: 32, minHeight: 32 }}
          />
        </View>

        <View style={{ flex: 1, minWidth: 140, gap: espaco.xs }}>
          <Text style={{ color: cores.suaveTexto, fontSize: fonte.xs }}>Desconto no item</Text>
          <Campo
            testID={`input-discount-${id}`}
            valor={String(desconto)}
            onChange={(texto) => aoMudarDesconto(id, paraNumero(texto))}
            teclado="decimal-pad"
            estilo={{ minHeight: 32 }}
          />
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>{`Subtotal: ${moeda(subtotal)}`}</Text>
        <Text
          testID={`text-total-${id}`}
          style={{ color: cores.primaria, fontSize: fonte.base, fontWeight: "600" }}
        >
          {moeda(total)}
        </Text>
      </View>
    </View>
  );
}
