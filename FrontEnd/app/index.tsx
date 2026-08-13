import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  AlertTriangle,
  CreditCard,
  DollarSign,
  Package,
  ShoppingCart,
  Smartphone,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { CartaoIndicador } from "../componentes/CartaoIndicador";
import { GraficoVendas } from "../componentes/GraficoVendas";
import { useAvisos } from "../componentes/ui/Avisos";
import { Botao } from "../componentes/ui/Botao";
import { AreaTexto, Campo, Rotulo } from "../componentes/ui/Campo";
import { Cartao } from "../componentes/ui/Cartao";
import { Dialogo } from "../componentes/ui/Dialogo";
import { Grade } from "../componentes/ui/Grade";
import { SubTitulo, TituloPagina } from "../componentes/ui/TituloPagina";
import { api } from "../lib/api";
import { chaves } from "../lib/consultas";
import { hora, moeda, paraNumero } from "../lib/formato";
import { colunas, useLarguraConteudo } from "../lib/layout";
import { OrdemServico, Produto, ResumoCaixa, Venda } from "../lib/tipos";
import { useTema } from "../tema/TemaProvider";
import { espaco, fonte, raio } from "../tema/tokens";

export default function TelaDashboard() {
  const { cores, ehDesktop } = useTema();
  const router = useRouter();
  const largura = useLarguraConteudo();
  const { avisar } = useAvisos();
  const clienteConsultas = useQueryClient();

  const [dialogoEntrada, setDialogoEntrada] = useState(false);
  const [dialogoSaida, setDialogoSaida] = useState(false);
  const [valorEntrada, setValorEntrada] = useState("");
  const [descricaoEntrada, setDescricaoEntrada] = useState("");
  const [valorSaida, setValorSaida] = useState("");
  const [descricaoSaida, setDescricaoSaida] = useState("");

  const { data: vendas = [], isFetched: vendasCarregadas } = useQuery<Venda[]>({
    queryKey: chaves.vendasHoje,
  });
  const { data: produtos = [], isFetched: produtosCarregados } = useQuery<Produto[]>({
    queryKey: chaves.produtos,
  });
  const { data: ordens = [] } = useQuery<OrdemServico[]>({ queryKey: chaves.ordensServico });
  const { data: caixa } = useQuery<ResumoCaixa>({ queryKey: chaves.caixa });

  const registrarMovimento = useMutation({
    mutationFn: (dados: { tipo: "entrada" | "saida"; valor: number; descricao?: string }) =>
      api.criar("/api/caixa/movimentos", dados),
    onSuccess: () => clienteConsultas.invalidateQueries({ queryKey: chaves.caixa }),
  });

  const totalVendas = useMemo(() => vendas.reduce((soma, venda) => soma + venda.total, 0), [vendas]);
  const estoqueBaixo = useMemo(() => produtos.filter((produto) => produto.estoque < 10).length, [produtos]);
  const recentes = useMemo(() => vendas.slice(0, 5), [vendas]);

  const porFormaPagamento = useMemo(
    () =>
      vendas.reduce<Record<string, number>>((acumulado, venda) => {
        acumulado[venda.formaPagamento] = (acumulado[venda.formaPagamento] ?? 0) + venda.total;
        return acumulado;
      }, {}),
    [vendas],
  );

  const dadosGrafico = useMemo(() => {
    const dias = Array.from({ length: 7 }, (_, indice) => {
      const data = new Date();
      data.setDate(data.getDate() - (6 - indice));
      return {
        data: data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        valor: 0,
      };
    });

    vendas.forEach((venda) => {
      const rotulo = new Date(venda.criadoEm).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
      const dia = dias.find((item) => item.data === rotulo);

      if (dia) {
        dia.valor += venda.total;
      }
    });

    return dias;
  }, [vendas]);

  const entradas = caixa?.entradas ?? 0;
  const saidas = caixa?.saidas ?? 0;
  const saldo = caixa?.saldo ?? 0;

  const colunasIndicadores = colunas(largura, 260, 4);
  const colunasPagamento = colunas(largura, 240, 4);

  async function confirmarMovimento(tipo: "entrada" | "saida") {
    const valor = paraNumero(tipo === "entrada" ? valorEntrada : valorSaida);

    if (valor <= 0) {
      avisar({ titulo: "Erro", descricao: "Digite um valor válido", variante: "perigo" });
      return;
    }

    try {
      await registrarMovimento.mutateAsync({
        tipo,
        valor,
        descricao: tipo === "entrada" ? descricaoEntrada : descricaoSaida,
      });

      if (tipo === "entrada") {
        setDialogoEntrada(false);
        setValorEntrada("");
        setDescricaoEntrada("");
        avisar({ titulo: "Entrada registrada", descricao: `${moeda(valor)} adicionado ao caixa` });
      } else {
        setDialogoSaida(false);
        setValorSaida("");
        setDescricaoSaida("");
        avisar({ titulo: "Saída registrada", descricao: `${moeda(valor)} retirado do caixa` });
      }
    } catch (erro) {
      avisar({
        titulo: "Erro",
        descricao: erro instanceof Error ? erro.message : "Falha ao registrar movimento",
        variante: "perigo",
      });
    }
  }

  return (
    <View style={{ gap: espaco.xl }}>
      <TituloPagina titulo="Dashboard" descricao="Visão geral do sistema PDV BRINKCELL" />

      <Grade colunas={colunasIndicadores} largura={largura}>
        {[
          <Pressable
            key="vendas"
            testID="clickable-card-sales-today"
            onPress={() => router.push("/reports")}
          >
            <CartaoIndicador titulo="Vendas Hoje" valor={moeda(totalVendas)} icone={DollarSign} />
          </Pressable>,
          <Pressable key="transacoes" testID="clickable-card-transactions" onPress={() => router.push("/pos")}>
            <CartaoIndicador
              titulo="Transações"
              valor={vendasCarregadas ? String(vendas.length) : "—"}
              icone={ShoppingCart}
            />
          </Pressable>,
          <Pressable key="produtos" testID="clickable-card-products" onPress={() => router.push("/products")}>
            <CartaoIndicador
              titulo="Produtos"
              valor={produtosCarregados ? String(produtos.length) : "—"}
              icone={Package}
            />
          </Pressable>,
          <Pressable
            key="estoque"
            testID="clickable-card-low-stock"
            onPress={() => router.push("/products")}
          >
            <CartaoIndicador
              titulo="Estoque Baixo"
              valor={produtosCarregados ? String(estoqueBaixo) : "—"}
              icone={AlertTriangle}
            />
          </Pressable>,
        ]}
      </Grade>

      <View style={{ gap: espaco.lg }}>
        <SubTitulo>Vendas por Forma de Pagamento</SubTitulo>

        <Grade colunas={colunasPagamento} largura={largura}>
          {[
            <CartaoPagamento
              key="credito"
              testID="card-sales-credit"
              titulo="Crédito"
              valor={porFormaPagamento["Crédito"] ?? 0}
              total={totalVendas}
              cor={cores.grafico1}
              icone={<CreditCard size={24} color={cores.grafico1} />}
            />,
            <CartaoPagamento
              key="debito"
              testID="card-sales-debit"
              titulo="Débito"
              valor={porFormaPagamento["Débito"] ?? 0}
              total={totalVendas}
              cor={cores.grafico2}
              icone={<CreditCard size={24} color={cores.grafico2} />}
            />,
            <CartaoPagamento
              key="pix"
              testID="card-sales-pix"
              titulo="PIX"
              valor={porFormaPagamento["PIX"] ?? 0}
              total={totalVendas}
              cor={cores.grafico3}
              icone={<Smartphone size={24} color={cores.grafico3} />}
            />,
            <CartaoPagamento
              key="dinheiro"
              testID="card-sales-cash"
              titulo="Dinheiro"
              valor={porFormaPagamento["Dinheiro"] ?? 0}
              total={totalVendas}
              cor={cores.grafico4}
              icone={<Wallet size={24} color={cores.grafico4} />}
            />,
          ]}
        </Grade>
      </View>

      <View style={{ flexDirection: ehDesktop ? "row" : "column", gap: espaco.xl }}>
        <View style={{ flex: 2 }}>
          <GraficoVendas dados={dadosGrafico} largura={ehDesktop ? largura * 0.62 : largura} />
        </View>

        <Cartao testID="card-recent-sales" estilo={{ flex: 1 }}>
          <View style={{ padding: espaco.xl, gap: espaco.lg }}>
            <Text style={{ color: cores.texto, fontSize: fonte.lg, fontWeight: "600" }}>Vendas Recentes</Text>

            {recentes.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: espaco.xxl, gap: espaco.md }}>
                <ShoppingCart size={48} color={cores.suaveTexto} />
                <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>
                  Nenhuma venda realizada hoje
                </Text>
              </View>
            ) : (
              <View>
                {recentes.map((venda) => (
                  <View
                    key={venda.id}
                    testID={`recent-sale-${venda.id}`}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingVertical: espaco.md,
                      borderBottomWidth: 1,
                      borderBottomColor: cores.borda,
                      gap: espaco.sm,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        numberOfLines={1}
                        style={{ color: cores.texto, fontSize: fonte.base, fontWeight: "500" }}
                      >
                        {venda.itens[0]?.nome ?? "Venda"}
                      </Text>
                      <Text style={{ color: cores.suaveTexto, fontSize: fonte.xs }}>
                        {hora(venda.criadoEm)}
                      </Text>
                    </View>
                    <Text style={{ color: cores.primaria, fontSize: fonte.base, fontWeight: "600" }}>
                      {moeda(venda.total)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Cartao>
      </View>

      <View style={{ flexDirection: ehDesktop ? "row" : "column", gap: espaco.xl }}>
        <Cartao testID="card-cash-register" estilo={{ flex: 1 }}>
          <View style={{ padding: espaco.xl, gap: espaco.lg }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ color: cores.texto, fontSize: fonte.lg, fontWeight: "600" }}>
                Caixa de Dinheiro
              </Text>
              <View
                style={{
                  height: 40,
                  width: 40,
                  borderRadius: raio.medio,
                  backgroundColor: cores.suave,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Wallet size={18} color={cores.primaria} />
              </View>
            </View>

            <LinhaCaixa
              icone={<TrendingUp size={16} color={cores.grafico2} />}
              rotulo="Entradas"
              valor={moeda(entradas)}
              cor={cores.grafico2}
              testID="text-cash-in"
            />
            <LinhaCaixa
              icone={<TrendingDown size={16} color={cores.perigo} />}
              rotulo="Saídas"
              valor={moeda(saidas)}
              cor={cores.perigo}
              testID="text-cash-out"
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: espaco.md,
              }}
            >
              <Text style={{ color: cores.texto, fontSize: fonte.base, fontWeight: "600" }}>
                Saldo em Caixa
              </Text>
              <Text
                testID="text-cash-balance"
                style={{ color: cores.primaria, fontSize: fonte.xxl, fontWeight: "700" }}
              >
                {moeda(saldo)}
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: espaco.sm }}>
              <Botao
                testID="button-cash-entry"
                variante="contorno"
                titulo="Entrada"
                icone={<TrendingUp size={16} color={cores.texto} />}
                onPress={() => setDialogoEntrada(true)}
                estilo={{ flex: 1 }}
              />
              <Botao
                testID="button-cash-withdrawal"
                variante="contorno"
                titulo="Saída"
                icone={<TrendingDown size={16} color={cores.texto} />}
                onPress={() => setDialogoSaida(true)}
                estilo={{ flex: 1 }}
              />
            </View>
          </View>
        </Cartao>

        <Cartao testID="card-quick-actions" estilo={{ flex: 1 }}>
          <View style={{ padding: espaco.xl, gap: espaco.lg }}>
            <Text style={{ color: cores.texto, fontSize: fonte.lg, fontWeight: "600" }}>Ações Rápidas</Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: espaco.md }}>
              <Botao
                testID="button-new-sale"
                titulo="Nova Venda"
                icone={<ShoppingCart size={16} color={cores.primariaTexto} />}
                onPress={() => router.push("/pos")}
              />
              <Botao
                testID="button-add-product"
                variante="contorno"
                titulo="Adicionar Produto"
                icone={<Package size={16} color={cores.texto} />}
                onPress={() => router.push("/products")}
              />
              <Botao
                testID="button-new-service-order"
                variante="contorno"
                titulo="Nova Ordem de Serviço"
                onPress={() => router.push("/service-orders/new")}
              />
              <Botao
                testID="button-view-reports"
                variante="contorno"
                titulo="Visualizar Relatórios"
                onPress={() => router.push("/reports")}
              />
            </View>
          </View>
        </Cartao>
      </View>

      <Dialogo
        aberto={dialogoEntrada}
        onFechar={() => setDialogoEntrada(false)}
        titulo="Entrada de Dinheiro"
        descricao="Registre uma entrada de dinheiro no caixa"
        testID="dialog-cash-entry"
        rodape={
          <>
            <Botao
              testID="button-cancel-entry"
              variante="contorno"
              titulo="Cancelar"
              onPress={() => setDialogoEntrada(false)}
            />
            <Botao
              testID="button-confirm-entry"
              titulo="Confirmar Entrada"
              onPress={() => confirmarMovimento("entrada")}
            />
          </>
        }
      >
        <View style={{ gap: espaco.sm }}>
          <Rotulo>Valor (R$)</Rotulo>
          <Campo
            testID="input-entry-amount"
            valor={valorEntrada}
            onChange={setValorEntrada}
            placeholder="0,00"
            teclado="decimal-pad"
            aoEnviar={() => confirmarMovimento("entrada")}
          />
        </View>
        <View style={{ gap: espaco.sm }}>
          <Rotulo>Descrição (opcional)</Rotulo>
          <AreaTexto
            testID="input-entry-description"
            valor={descricaoEntrada}
            onChange={setDescricaoEntrada}
            placeholder="Ex: Venda em dinheiro, Troco inicial..."
          />
        </View>
      </Dialogo>

      <Dialogo
        aberto={dialogoSaida}
        onFechar={() => setDialogoSaida(false)}
        titulo="Saída de Dinheiro"
        descricao="Registre uma retirada de dinheiro do caixa"
        testID="dialog-cash-withdrawal"
        rodape={
          <>
            <Botao
              testID="button-cancel-withdrawal"
              variante="contorno"
              titulo="Cancelar"
              onPress={() => setDialogoSaida(false)}
            />
            <Botao
              testID="button-confirm-withdrawal"
              titulo="Confirmar Saída"
              onPress={() => confirmarMovimento("saida")}
            />
          </>
        }
      >
        <View style={{ gap: espaco.sm }}>
          <Rotulo>Valor (R$)</Rotulo>
          <Campo
            testID="input-withdrawal-amount"
            valor={valorSaida}
            onChange={setValorSaida}
            placeholder="0,00"
            teclado="decimal-pad"
            aoEnviar={() => confirmarMovimento("saida")}
          />
        </View>
        <View style={{ gap: espaco.sm }}>
          <Rotulo>Descrição (opcional)</Rotulo>
          <AreaTexto
            testID="input-withdrawal-description"
            valor={descricaoSaida}
            onChange={setDescricaoSaida}
            placeholder="Ex: Despesa, Pagamento fornecedor..."
          />
        </View>
      </Dialogo>
    </View>
  );
}

function CartaoPagamento({
  titulo,
  valor,
  total,
  cor,
  icone,
  testID,
}: {
  titulo: string;
  valor: number;
  total: number;
  cor: string;
  icone: React.ReactNode;
  testID: string;
}) {
  const { cores } = useTema();
  const percentual = total > 0 ? ((valor / total) * 100).toFixed(1) : "0";

  return (
    <Cartao testID={testID}>
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
          <Text style={{ color: cores.texto, fontSize: fonte.xxl, fontWeight: "700" }}>{moeda(valor)}</Text>
          <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>{`${percentual}% do total`}</Text>
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
    </Cartao>
  );
}

function LinhaCaixa({
  icone,
  rotulo,
  valor,
  cor,
  testID,
}: {
  icone: React.ReactNode;
  rotulo: string;
  valor: string;
  cor: string;
  testID: string;
}) {
  const { cores } = useTema();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: espaco.md,
        borderBottomWidth: 1,
        borderBottomColor: cores.borda,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: espaco.sm }}>
        {icone}
        <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>{rotulo}</Text>
      </View>
      <Text testID={testID} style={{ color: cor, fontSize: fonte.base, fontWeight: "600" }}>
        {valor}
      </Text>
    </View>
  );
}
