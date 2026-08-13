import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Banknote, Calendar, CreditCard, Download, Package, Smartphone } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Platform, Text, View } from "react-native";

import { GraficoVendas } from "../componentes/GraficoVendas";
import { useAvisos } from "../componentes/ui/Avisos";
import { Botao } from "../componentes/ui/Botao";
import { Campo, Rotulo } from "../componentes/ui/Campo";
import { Cartao } from "../componentes/ui/Cartao";
import { Dialogo } from "../componentes/ui/Dialogo";
import { Grade } from "../componentes/ui/Grade";
import { CelulaTabela, LinhaTabela, Tabela } from "../componentes/ui/Tabela";
import { TituloPagina } from "../componentes/ui/TituloPagina";
import { useAutenticacao } from "../lib/autenticacao";
import { chaves } from "../lib/consultas";
import { moeda } from "../lib/formato";
import { colunas, useLarguraConteudo } from "../lib/layout";
import { Venda } from "../lib/tipos";
import { useTema } from "../tema/TemaProvider";
import { espaco, fonte, raio } from "../tema/tokens";

type ProdutoAgregado = {
  nome: string;
  total: number;
  quantidade: number;
  receita: number;
  credito: number;
  debito: number;
  pix: number;
  dinheiro: number;
};

function rotuloData(texto: string) {
  return new Date(texto).toLocaleDateString("pt-BR");
}

export default function TelaRelatorios() {
  const { cores, ehDesktop } = useTema();
  const largura = useLarguraConteudo();
  const roteador = useRouter();
  const { avisar } = useAvisos();
  const { usuario } = useAutenticacao();
  const podeVerRelatorios = usuario?.funcao === "Administrador" || usuario?.funcao === "Gerente";

  const [dialogoPeriodo, setDialogoPeriodo] = useState(false);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [periodo, setPeriodo] = useState<{ inicio: string; fim: string } | null>(null);

  const { data: vendas = [] } = useQuery<Venda[]>({ queryKey: chaves.vendas });

  const vendasFiltradas = useMemo(() => {
    if (!periodo) {
      return vendas;
    }

    const de = new Date(periodo.inicio);
    const ate = new Date(periodo.fim);
    ate.setHours(23, 59, 59, 999);

    return vendas.filter((venda) => {
      const criacao = new Date(venda.criadoEm);
      return criacao >= de && criacao <= ate;
    });
  }, [vendas, periodo]);

  const dadosGrafico = useMemo(() => {
    const ultimosSete = Array.from({ length: 7 }, (_, indice) => {
      const data = new Date();
      data.setDate(data.getDate() - (6 - indice));

      return {
        data: data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        valor: 0,
      };
    });

    vendasFiltradas.forEach((venda) => {
      const chave = new Date(venda.criadoEm).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
      const ponto = ultimosSete.find((item) => item.data === chave);

      if (ponto) {
        ponto.valor += venda.total;
      }
    });

    return ultimosSete;
  }, [vendasFiltradas]);

  const produtos = useMemo<ProdutoAgregado[]>(() => {
    const agrupados: Record<string, ProdutoAgregado> = {};

    vendasFiltradas.forEach((venda) => {
      (venda.itens ?? []).forEach((item) => {
        agrupados[item.nome] ??= {
          nome: item.nome,
          total: 0,
          quantidade: 0,
          receita: 0,
          credito: 0,
          debito: 0,
          pix: 0,
          dinheiro: 0,
        };

        const bruto = item.quantidade * item.precoUnitario;
        const registro = agrupados[item.nome];

        registro.total += bruto;
        registro.quantidade += item.quantidade;
        registro.receita += Math.max(0, bruto - (item.desconto ?? 0));

        if (venda.formaPagamento === "Crédito") registro.credito += bruto;
        if (venda.formaPagamento === "Débito") registro.debito += bruto;
        if (venda.formaPagamento === "PIX") registro.pix += bruto;
        if (venda.formaPagamento === "Dinheiro") registro.dinheiro += bruto;
      });
    });

    return Object.values(agrupados);
  }, [vendasFiltradas]);

  const totalPeriodo = vendasFiltradas.reduce((soma, venda) => soma + venda.total, 0);
  const transacoes = vendasFiltradas.length;
  const ticket = transacoes > 0 ? totalPeriodo / transacoes : 0;
  const quantidadeProdutos = produtos.reduce((soma, item) => soma + item.quantidade, 0);

  const mensal = useMemo(() => {
    const agora = new Date();
    const primeiro = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const ultimo = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59, 999);

    const doMes = vendas.filter((venda) => {
      const data = new Date(venda.criadoEm);
      return data >= primeiro && data <= ultimo;
    });

    const porForma = doMes.reduce<Record<string, number>>((acumulado, venda) => {
      acumulado[venda.formaPagamento] = (acumulado[venda.formaPagamento] ?? 0) + venda.total;
      return acumulado;
    }, {});

    return {
      total: doMes.reduce((soma, venda) => soma + venda.total, 0),
      credito: porForma["Crédito"] ?? 0,
      debito: porForma["Débito"] ?? 0,
      pix: porForma.PIX ?? 0,
      dinheiro: porForma.Dinheiro ?? 0,
    };
  }, [vendas]);

  function percentual(valor: number) {
    return mensal.total > 0 ? ((valor / mensal.total) * 100).toFixed(1) : "0.0";
  }

  function aplicarPeriodo() {
    if (!inicio || !fim) {
      avisar({ titulo: "Erro", descricao: "Selecione as datas de início e fim", variante: "perigo" });
      return;
    }

    if (new Date(inicio) > new Date(fim)) {
      avisar({
        titulo: "Erro",
        descricao: "Data inicial não pode ser maior que data final",
        variante: "perigo",
      });
      return;
    }

    setPeriodo({ inicio, fim });
    setDialogoPeriodo(false);
    avisar({ titulo: "Período atualizado", descricao: `${rotuloData(inicio)} até ${rotuloData(fim)}` });
  }

  function exportar() {
    const linhas = [
      ["Produto", "Quantidade", "Receita"],
      ...produtos.map((item) => [item.nome, item.total.toFixed(2), item.receita.toFixed(2)]),
    ];
    const csv = linhas.map((linha) => linha.join(",")).join("\n");

    if (Platform.OS === "web") {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.setAttribute("href", url);
      link.setAttribute("download", `relatorio_vendas_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    avisar({ titulo: "Relatório exportado", descricao: "O arquivo CSV foi baixado com sucesso" });
  }

  if (!podeVerRelatorios) {
    return (
      <View style={{ gap: espaco.xl }}>
        <TituloPagina titulo="Relatórios" descricao="Acesso restrito à gerência" />
        <Cartao>
          <View style={{ padding: espaco.xxl, alignItems: "center", gap: espaco.md }}>
            <Text style={{ color: cores.texto, fontSize: fonte.lg, fontWeight: "600" }}>
              Sem permissão
            </Text>
            <Text style={{ color: cores.suaveTexto, fontSize: fonte.base, textAlign: "center" }}>
              Apenas Administrador e Gerente podem ver os relatórios.
            </Text>
            <Botao titulo="Voltar" variante="contorno" onPress={() => roteador.replace("/")} />
          </View>
        </Cartao>
      </View>
    );
  }

  return (
    <View style={{ gap: espaco.xl }}>
      <TituloPagina
        titulo="Relatórios"
        descricao={
          periodo
            ? `${rotuloData(periodo.inicio)} até ${rotuloData(periodo.fim)}`
            : "Análises e estatísticas de vendas"
        }
        acoes={
          <>
            <Botao
              testID="button-select-period"
              variante="contorno"
              titulo="Selecionar Período"
              icone={<Calendar size={16} color={cores.texto} />}
              onPress={() => setDialogoPeriodo(true)}
            />
            <Botao
              testID="button-export-report"
              titulo="Exportar"
              icone={<Download size={16} color={cores.primariaTexto} />}
              onPress={exportar}
            />
          </>
        }
      />

      {periodo ? (
        <Cartao testID="card-period-products">
          <View style={{ padding: espaco.xl, gap: espaco.lg }}>
            <Text style={{ color: cores.texto, fontSize: fonte.lg, fontWeight: "600" }}>
              Produtos Vendidos no Período - {rotuloData(periodo.inicio)} até {rotuloData(periodo.fim)}
            </Text>

            {produtos.length === 0 ? (
              <Vazio texto="Nenhum produto vendido no período selecionado" />
            ) : (
              <View style={{ borderWidth: 1, borderColor: cores.borda, borderRadius: raio.medio, paddingHorizontal: espaco.lg }}>
                <Tabela larguraMinima={860}>
                  <LinhaTabela cabecalho>
                    <CelulaTabela cabecalho proporcao={2}>
                      Produto
                    </CelulaTabela>
                    <CelulaTabela cabecalho proporcao={1.2} alinhamento="flex-end">
                      Total
                    </CelulaTabela>
                    <CelulaTabela cabecalho proporcao={1.2} alinhamento="flex-end">
                      Crédito
                    </CelulaTabela>
                    <CelulaTabela cabecalho proporcao={1.2} alinhamento="flex-end">
                      Débito
                    </CelulaTabela>
                    <CelulaTabela cabecalho proporcao={1.2} alinhamento="flex-end">
                      PIX
                    </CelulaTabela>
                    <CelulaTabela cabecalho proporcao={1.2} alinhamento="flex-end">
                      Dinheiro
                    </CelulaTabela>
                  </LinhaTabela>

                  {produtos.map((item) => (
                    <LinhaTabela key={item.nome} testID={`row-period-product-${item.nome}`}>
                      <CelulaTabela proporcao={2} estiloTexto={{ fontWeight: "500" }}>
                        {item.nome}
                      </CelulaTabela>
                      <CelulaTabela
                        proporcao={1.2}
                        alinhamento="flex-end"
                        estiloTexto={{ color: cores.primaria, fontWeight: "700" }}
                      >
                        {moeda(item.total)}
                      </CelulaTabela>
                      <CelulaTabela
                        proporcao={1.2}
                        alinhamento="flex-end"
                        estiloTexto={{ color: cores.grafico1 }}
                      >
                        {moeda(item.credito)}
                      </CelulaTabela>
                      <CelulaTabela
                        proporcao={1.2}
                        alinhamento="flex-end"
                        estiloTexto={{ color: cores.grafico2 }}
                      >
                        {moeda(item.debito)}
                      </CelulaTabela>
                      <CelulaTabela
                        proporcao={1.2}
                        alinhamento="flex-end"
                        estiloTexto={{ color: cores.grafico3 }}
                      >
                        {moeda(item.pix)}
                      </CelulaTabela>
                      <CelulaTabela
                        proporcao={1.2}
                        alinhamento="flex-end"
                        estiloTexto={{ color: cores.grafico4 }}
                      >
                        {moeda(item.dinheiro)}
                      </CelulaTabela>
                    </LinhaTabela>
                  ))}
                </Tabela>
              </View>
            )}
          </View>
        </Cartao>
      ) : null}

      <GraficoVendas dados={dadosGrafico} largura={largura} />

      <Grade colunas={ehDesktop ? 2 : 1} largura={largura}>
        {[
          <Cartao key="top" testID="card-top-products">
            <View style={{ padding: espaco.xl, gap: espaco.lg }}>
              <Text style={{ color: cores.texto, fontSize: fonte.lg, fontWeight: "600" }}>
                Produtos Mais Vendidos
              </Text>

              {produtos.length === 0 ? (
                <Vazio texto="Nenhum produto vendido no período" />
              ) : (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: cores.borda,
                    borderRadius: raio.medio,
                    paddingHorizontal: espaco.lg,
                  }}
                >
                  <Tabela>
                    <LinhaTabela cabecalho>
                      <CelulaTabela cabecalho proporcao={2}>
                        Produto
                      </CelulaTabela>
                      <CelulaTabela cabecalho proporcao={0.8} alinhamento="flex-end">
                        Qtd
                      </CelulaTabela>
                      <CelulaTabela cabecalho proporcao={1.2} alinhamento="flex-end">
                        Receita
                      </CelulaTabela>
                    </LinhaTabela>

                    {produtos.map((item) => (
                      <LinhaTabela key={item.nome}>
                        <CelulaTabela proporcao={2} estiloTexto={{ fontWeight: "500" }}>
                          {item.nome}
                        </CelulaTabela>
                        <CelulaTabela proporcao={0.8} alinhamento="flex-end">
                          {String(item.quantidade)}
                        </CelulaTabela>
                        <CelulaTabela
                          proporcao={1.2}
                          alinhamento="flex-end"
                          estiloTexto={{ color: cores.primaria }}
                        >
                          {moeda(item.receita)}
                        </CelulaTabela>
                      </LinhaTabela>
                    ))}
                  </Tabela>
                </View>
              )}
            </View>
          </Cartao>,

          <Cartao key="resumo" testID="card-summary">
            <View style={{ padding: espaco.xl, gap: espaco.lg }}>
              <Text style={{ color: cores.texto, fontSize: fonte.lg, fontWeight: "600" }}>
                Resumo do Período
              </Text>

              <LinhaResumo titulo="Total de Vendas" valor={moeda(totalPeriodo)} destaque separador />
              <LinhaResumo titulo="Total de Transações" valor={String(transacoes)} separador />
              <LinhaResumo titulo="Ticket Médio" valor={moeda(ticket)} separador />
              <LinhaResumo titulo="Produtos Vendidos" valor={String(quantidadeProdutos)} />
            </View>
          </Cartao>,
        ]}
      </Grade>

      <Cartao testID="card-monthly-closure">
        <View style={{ padding: espaco.xl, gap: espaco.xl }}>
          <Text style={{ color: cores.texto, fontSize: fonte.lg, fontWeight: "600" }}>
            Fechamento Mensal -{" "}
            {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </Text>

          <Grade colunas={colunas(largura, 200, 4)} largura={largura}>
            {[
              <CartaoForma
                key="credito"
                titulo="Crédito"
                valor={mensal.credito}
                percentual={percentual(mensal.credito)}
                icone={<CreditCard size={16} color={cores.grafico1} />}
              />,
              <CartaoForma
                key="debito"
                titulo="Débito"
                valor={mensal.debito}
                percentual={percentual(mensal.debito)}
                icone={<CreditCard size={16} color={cores.grafico2} />}
              />,
              <CartaoForma
                key="pix"
                titulo="PIX"
                valor={mensal.pix}
                percentual={percentual(mensal.pix)}
                icone={<Smartphone size={16} color={cores.grafico3} />}
              />,
              <CartaoForma
                key="dinheiro"
                titulo="Dinheiro"
                valor={mensal.dinheiro}
                percentual={percentual(mensal.dinheiro)}
                icone={<Banknote size={16} color={cores.grafico4} />}
              />,
            ]}
          </Grade>

          <View style={{ borderTopWidth: 1, borderTopColor: cores.borda, paddingTop: espaco.xl, gap: espaco.lg }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: cores.texto, fontSize: fonte.lg, fontWeight: "600" }}>
                Total do Mês:
              </Text>
              <Text
                testID="text-monthly-total"
                style={{ color: cores.primaria, fontSize: fonte.xxxl, fontWeight: "700" }}
              >
                {moeda(mensal.total)}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                borderTopWidth: 1,
                borderTopColor: cores.borda,
                paddingTop: espaco.lg,
              }}
            >
              <Text style={{ color: cores.suaveTexto, fontSize: fonte.base, fontWeight: "500" }}>
                Lucro Total:
              </Text>
              <Text
                testID="text-total-profit"
                style={{ color: cores.grafico2, fontSize: fonte.xxl, fontWeight: "700" }}
              >
                {moeda(mensal.total)}
              </Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: cores.suaveTexto, fontSize: fonte.base, fontWeight: "500" }}>
                Margem de Lucro:
              </Text>
              <Text
                testID="text-profit-margin"
                style={{ color: cores.grafico2, fontSize: fonte.xxl, fontWeight: "700" }}
              >
                {mensal.total > 0 ? "100%" : "0%"}
              </Text>
            </View>
          </View>
        </View>
      </Cartao>

      <Dialogo
        aberto={dialogoPeriodo}
        onFechar={() => setDialogoPeriodo(false)}
        titulo="Selecionar Período"
        icone={<Calendar size={20} color={cores.texto} />}
        testID="dialog-select-period"
        rodape={
          <>
            <Botao
              testID="button-cancel-period"
              variante="contorno"
              titulo="Cancelar"
              onPress={() => setDialogoPeriodo(false)}
            />
            <Botao testID="button-apply-period" titulo="Aplicar" onPress={aplicarPeriodo} />
          </>
        }
      >
        <View style={{ gap: espaco.sm }}>
          <Rotulo>Data Inicial</Rotulo>
          <Campo testID="input-start-date" valor={inicio} onChange={setInicio} placeholder="AAAA-MM-DD" />
        </View>
        <View style={{ gap: espaco.sm }}>
          <Rotulo>Data Final</Rotulo>
          <Campo testID="input-end-date" valor={fim} onChange={setFim} placeholder="AAAA-MM-DD" />
        </View>
      </Dialogo>
    </View>
  );
}

function Vazio({ texto }: { texto: string }) {
  const { cores } = useTema();

  return (
    <View style={{ alignItems: "center", paddingVertical: espaco.xxl, gap: espaco.lg }}>
      <Package size={48} color={cores.suaveTexto} />
      <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>{texto}</Text>
    </View>
  );
}

function LinhaResumo({
  titulo,
  valor,
  destaque,
  separador,
}: {
  titulo: string;
  valor: string;
  destaque?: boolean;
  separador?: boolean;
}) {
  const { cores } = useTema();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: espaco.md,
        borderBottomWidth: separador ? 1 : 0,
        borderBottomColor: cores.borda,
      }}
    >
      <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>{titulo}</Text>
      <Text
        style={{
          color: destaque ? cores.primaria : cores.texto,
          fontSize: fonte.xl,
          fontWeight: "700",
        }}
      >
        {valor}
      </Text>
    </View>
  );
}

function CartaoForma({
  titulo,
  valor,
  percentual,
  icone,
}: {
  titulo: string;
  valor: number;
  percentual: string;
  icone: React.ReactNode;
}) {
  const { cores } = useTema();

  return (
    <Cartao>
      <View style={{ padding: espaco.lg, gap: espaco.xs }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: espaco.sm }}>
          {icone}
          <Text style={{ color: cores.suaveTexto, fontSize: fonte.base, fontWeight: "500" }}>{titulo}</Text>
        </View>
        <Text style={{ color: cores.texto, fontSize: fonte.xxl, fontWeight: "700" }}>{moeda(valor)}</Text>
        <Text style={{ color: cores.suaveTexto, fontSize: fonte.sm }}>{percentual}% do total</Text>
      </View>
    </Cartao>
  );
}
