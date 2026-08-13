import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  CreditCard,
  DollarSign,
  Printer,
  ShoppingCart,
  Smartphone,
  Wallet,
  X,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Botao } from "../componentes/ui/Botao";
import { Cartao } from "../componentes/ui/Cartao";
import { Grade } from "../componentes/ui/Grade";
import { Selo } from "../componentes/ui/Selo";
import { CelulaTabela, LinhaTabela, Tabela } from "../componentes/ui/Tabela";
import { SubTitulo, TituloPagina } from "../componentes/ui/TituloPagina";
import { imprimirComprovante } from "../lib/comprovante";
import { chaves } from "../lib/consultas";
import { hora, moeda } from "../lib/formato";
import { colunas, useLarguraConteudo } from "../lib/layout";
import { ConfiguracaoLoja, Venda } from "../lib/tipos";
import { useTema } from "../tema/TemaProvider";
import { espaco, fonte, raio } from "../tema/tokens";

export default function TelaVendasDoDia() {
  const { cores, ehDesktop } = useTema();
  const largura = useLarguraConteudo();
  const [formaSelecionada, setFormaSelecionada] = useState<string | null>(null);

  const { data: vendas = [], isLoading } = useQuery<Venda[]>({ queryKey: chaves.vendasHoje });
  const { data: configuracao } = useQuery<ConfiguracaoLoja>({ queryKey: chaves.configuracaoLoja });

  const total = useMemo(() => vendas.reduce((soma, venda) => soma + venda.total, 0), [vendas]);

  const porForma = useMemo(
    () =>
      vendas.reduce<Record<string, number>>((acumulado, venda) => {
        acumulado[venda.formaPagamento] = (acumulado[venda.formaPagamento] ?? 0) + venda.total;
        return acumulado;
      }, {}),
    [vendas],
  );

  const filtradas = formaSelecionada
    ? vendas.filter((venda) => venda.formaPagamento === formaSelecionada)
    : vendas;

  const formas = [
    { nome: "Crédito", cor: cores.grafico1, icone: CreditCard },
    { nome: "Débito", cor: cores.grafico2, icone: CreditCard },
    { nome: "PIX", cor: cores.grafico3, icone: Smartphone },
    { nome: "Dinheiro", cor: cores.grafico4, icone: Wallet },
  ];

  const dataHoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (isLoading) {
    return (
      <View style={{ gap: espaco.xl }}>
        <TituloPagina titulo="Vendas do Dia" />
        <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: espaco.xl }}>
      <View style={{ gap: espaco.xs }}>
        <TituloPagina titulo="Vendas do Dia" />
        <View style={{ flexDirection: "row", alignItems: "center", gap: espaco.sm }}>
          <Calendar size={16} color={cores.suaveTexto} />
          <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>{dataHoje}</Text>
        </View>
      </View>

      <Grade colunas={colunas(largura, 320, 2)} largura={largura}>
        {[
          <Pressable key="total" testID="card-total-sales" onPress={() => setFormaSelecionada(null)}>
            <Cartao
              estilo={{
                borderColor: formaSelecionada === null ? cores.primaria : cores.cartaoBorda,
                borderWidth: formaSelecionada === null ? 2 : 1,
              }}
            >
              <ConteudoResumo
                titulo="Total de Vendas"
                valor={moeda(total)}
                destaque
                ativo={formaSelecionada === null}
                icone={<DollarSign size={24} color={cores.primaria} />}
              />
            </Cartao>
          </Pressable>,
          <Cartao key="transacoes" testID="card-total-transactions">
            <ConteudoResumo
              titulo="Transações"
              valor={String(vendas.length)}
              icone={<ShoppingCart size={24} color={cores.grafico2} />}
            />
          </Cartao>,
        ]}
      </Grade>

      <View style={{ gap: espaco.lg }}>
        <SubTitulo>Por Forma de Pagamento</SubTitulo>

        <Grade colunas={colunas(largura, 240, 4)} largura={largura}>
          {formas.map((forma) => {
            const selecionada = formaSelecionada === forma.nome;
            const valor = porForma[forma.nome] ?? 0;
            const Icone = forma.icone;

            return (
              <Pressable
                key={forma.nome}
                testID={`card-payment-${forma.nome.toLowerCase()}`}
                onPress={() => setFormaSelecionada(selecionada ? null : forma.nome)}
              >
                <Cartao
                  estilo={{
                    borderColor: selecionada ? cores.primaria : cores.cartaoBorda,
                    borderWidth: selecionada ? 2 : 1,
                  }}
                >
                  <ConteudoResumo
                    titulo={forma.nome}
                    valor={moeda(valor)}
                    ativo={selecionada}
                    percentual={total > 0 ? `${((valor / total) * 100).toFixed(1)}% do total` : "0% do total"}
                    icone={<Icone size={24} color={forma.cor} />}
                  />
                </Cartao>
              </Pressable>
            );
          })}
        </Grade>
      </View>

      <Cartao testID="card-sales-list">
        <View style={{ padding: espaco.xl, gap: espaco.lg }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: espaco.sm,
            }}
          >
            <Text style={{ color: cores.texto, fontSize: fonte.lg, fontWeight: "600" }}>
              {formaSelecionada ? `Vendas em ${formaSelecionada}` : "Lista de Vendas"}
            </Text>
            {formaSelecionada ? (
              <Botao
                testID="button-clear-filter"
                variante="contorno"
                tamanho="pequeno"
                titulo="Limpar Filtro"
                icone={<X size={14} color={cores.texto} />}
                onPress={() => setFormaSelecionada(null)}
              />
            ) : null}
          </View>

          {filtradas.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: espaco.xxl, gap: espaco.lg }}>
              <ShoppingCart size={48} color={cores.suaveTexto} />
              <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>
                {formaSelecionada
                  ? `Nenhuma venda realizada com ${formaSelecionada} hoje`
                  : "Nenhuma venda realizada hoje"}
              </Text>
            </View>
          ) : (
            <View style={{ borderWidth: 1, borderColor: cores.borda, borderRadius: raio.medio }}>
              <View style={{ paddingHorizontal: espaco.lg }}>
                <Tabela larguraMinima={ehDesktop ? undefined : 560}>
                  <LinhaTabela cabecalho>
                    <CelulaTabela cabecalho proporcao={1.2}>
                      Hora
                    </CelulaTabela>
                    <CelulaTabela cabecalho proporcao={2}>
                      Vendedor
                    </CelulaTabela>
                    <CelulaTabela cabecalho proporcao={1.5}>
                      Pagamento
                    </CelulaTabela>
                    <CelulaTabela cabecalho proporcao={1.5} alinhamento="flex-end">
                      Valor
                    </CelulaTabela>
                    <CelulaTabela cabecalho proporcao={1} alinhamento="flex-end">
                      Ações
                    </CelulaTabela>
                  </LinhaTabela>

                  {filtradas.map((venda) => (
                    <LinhaTabela key={venda.id} testID={`sale-row-${venda.id}`}>
                      <CelulaTabela proporcao={1.2} estiloTexto={{ fontWeight: "500" }}>
                        {hora(venda.criadoEm)}
                      </CelulaTabela>
                      <CelulaTabela proporcao={2}>{venda.vendedorNome ?? "-"}</CelulaTabela>
                      <CelulaTabela proporcao={1.5}>
                        <Selo
                          texto={venda.formaPagamento}
                          variante="contorno"
                          testID={`badge-payment-${venda.id}`}
                        />
                      </CelulaTabela>
                      <CelulaTabela
                        proporcao={1.5}
                        alinhamento="flex-end"
                        estiloTexto={{ color: cores.primaria, fontWeight: "600" }}
                      >
                        {moeda(venda.total)}
                      </CelulaTabela>
                      <CelulaTabela proporcao={1} alinhamento="flex-end">
                        <Botao
                          testID={`button-reprint-${venda.id}`}
                          variante="fantasma"
                          tamanho="icone"
                          onPress={() => imprimirComprovante(venda, configuracao)}
                          icone={<Printer size={16} color={cores.texto} />}
                        />
                      </CelulaTabela>
                    </LinhaTabela>
                  ))}
                </Tabela>
              </View>
            </View>
          )}
        </View>
      </Cartao>
    </View>
  );
}

function ConteudoResumo({
  titulo,
  valor,
  icone,
  ativo,
  destaque,
  percentual,
}: {
  titulo: string;
  valor: string;
  icone: React.ReactNode;
  ativo?: boolean;
  destaque?: boolean;
  percentual?: string;
}) {
  const { cores } = useTema();

  return (
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
        <View style={{ flexDirection: "row", alignItems: "center", gap: espaco.sm }}>
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
          {ativo ? <Selo texto="Ativo" variante="primario" /> : null}
        </View>
        <Text
          style={{
            color: destaque ? cores.primaria : cores.texto,
            fontSize: destaque ? fonte.xxxl : fonte.xxl,
            fontWeight: "700",
          }}
        >
          {valor}
        </Text>
        {percentual ? (
          <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>{percentual}</Text>
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
        {icone}
      </View>
    </View>
  );
}
