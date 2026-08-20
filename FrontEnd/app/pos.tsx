import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Barcode, CreditCard, Grid3x3, List, Package, Plus, Search } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

import { CartaoProduto } from "../componentes/CartaoProduto";
import { ItemCarrinho } from "../componentes/ItemCarrinho";
import { useAvisos } from "../componentes/ui/Avisos";
import { Botao } from "../componentes/ui/Botao";
import { AreaTexto, Campo, Rotulo } from "../componentes/ui/Campo";
import { Cartao } from "../componentes/ui/Cartao";
import { Dialogo } from "../componentes/ui/Dialogo";
import { Selo } from "../componentes/ui/Selo";
import { Seletor } from "../componentes/ui/Seletor";
import { CelulaTabela, LinhaTabela, Tabela } from "../componentes/ui/Tabela";
import { TituloPagina } from "../componentes/ui/TituloPagina";
import { api } from "../lib/api";
import { imprimirComprovante } from "../lib/comprovante";
import { chaves } from "../lib/consultas";
import { moeda, paraNumero } from "../lib/formato";
import { colunas, larguraColuna, useLarguraConteudo } from "../lib/layout";
import { tocarSomFinalizacao } from "../lib/som";
import { ConfiguracaoLoja, formasPagamento, Produto, Venda, Vendedor } from "../lib/tipos";
import { useTema } from "../tema/TemaProvider";
import { espaco, fonte } from "../tema/tokens";

type ItemCarrinhoLocal = {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  desconto: number;
};

export default function TelaPdv() {
  const { cores, ehDesktop } = useTema();
  const larguraTotal = useLarguraConteudo();
  const { avisar } = useAvisos();
  const clienteConsultas = useQueryClient();

  const [busca, setBusca] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [carrinho, setCarrinho] = useState<ItemCarrinhoLocal[]>([]);
  const [modo, setModo] = useState<"lista" | "grade">("lista");
  const [vendedorId, setVendedorId] = useState<string | null>(null);
  const [dialogoDetalhes, setDialogoDetalhes] = useState(false);
  const [dialogoPagamento, setDialogoPagamento] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState<string>("Dinheiro");
  const [observacao, setObservacao] = useState("");
  const [valorRecebido, setValorRecebido] = useState("");

  const { data: produtos = [], isLoading: carregandoProdutos } = useQuery<Produto[]>({
    queryKey: chaves.produtos,
  });
  const { data: vendedores = [] } = useQuery<Vendedor[]>({ queryKey: chaves.vendedores });
  const { data: configuracao } = useQuery<ConfiguracaoLoja>({ queryKey: chaves.configuracaoLoja });

  useEffect(() => {
    if (!vendedorId && vendedores.length > 0) {
      setVendedorId(vendedores[0].id);
    }
  }, [vendedores, vendedorId]);

  const registrarVenda = useMutation({
    mutationFn: (dados: unknown) => api.criar<Venda>("/api/vendas", dados),
    onSuccess: () => {
      clienteConsultas.invalidateQueries({ queryKey: chaves.produtos });
      clienteConsultas.invalidateQueries({ queryKey: chaves.vendas });
      clienteConsultas.invalidateQueries({ queryKey: chaves.vendasHoje });
      clienteConsultas.invalidateQueries({ queryKey: chaves.vendedores });
    },
  });

  const categorias = useMemo(
    () => ["todas", ...Array.from(new Set(produtos.map((produto) => produto.categoria)))],
    [produtos],
  );

  const codigoNormalizado = codigoBarras.trim().toLowerCase();

  const filtrados = useMemo(
    () =>
      produtos.filter((produto) => {
        const termo = busca.toLowerCase();
        const casaBusca =
          produto.nome.toLowerCase().includes(termo) ||
          produto.categoria.toLowerCase().includes(termo) ||
          produto.sku.toLowerCase().includes(termo);

        const casaCodigo = codigoNormalizado
          ? [produto.sku, produto.id, produto.codigoBarras]
              .filter(Boolean)
              .map((valor) => String(valor).toLowerCase())
              .some((valor) => valor.includes(codigoNormalizado))
          : true;

        const casaCategoria = categoria === "todas" ? true : produto.categoria === categoria;

        return casaBusca && casaCodigo && casaCategoria;
      }),
    [produtos, busca, codigoNormalizado, categoria],
  );

  function adicionar(produtoId: string) {
    const produto = produtos.find((item) => item.id === produtoId);

    if (!produto) {
      return;
    }

    setCarrinho((atual) => {
      const existente = atual.find((item) => item.id === produtoId);

      if (existente) {
        return atual.map((item) =>
          item.id === produtoId ? { ...item, quantidade: item.quantidade + 1 } : item,
        );
      }

      return [
        ...atual,
        { id: produto.id, nome: produto.nome, preco: produto.preco, quantidade: 1, desconto: 0 },
      ];
    });
  }

  function lerCodigoBarras() {
    const encontrado = filtrados[0] ?? produtos.find((produto) => produto.codigoBarras === codigoBarras);

    if (!encontrado) {
      return;
    }

    adicionar(encontrado.id);
    setCodigoBarras("");
  }

  const subtotal = carrinho.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
  const descontoTotal = carrinho.reduce((soma, item) => soma + item.desconto, 0);
  const total = Math.max(0, subtotal - descontoTotal);
  const troco = valorRecebido ? paraNumero(valorRecebido) - total : 0;

  async function finalizar() {
    if (carrinho.length === 0) {
      return;
    }

    try {
      const venda = await registrarVenda.mutateAsync({
        vendedorId,
        formaPagamento,
        observacao,
        itens: carrinho.map((item) => ({
          produtoId: item.id,
          quantidade: item.quantidade,
          precoUnitario: item.preco,
          desconto: item.desconto,
        })),
      });

      if (configuracao?.somFinalizacao) {
        tocarSomFinalizacao();
      }

      if (configuracao?.impressaoAutomatica !== false) {
        const impresso = await imprimirComprovante(venda, configuracao);

        if (!impresso) {
          avisar({
            titulo: "Impressão bloqueada",
            descricao: "O navegador impediu a janela de impressão. Autorize pop-ups ou reimprima em Vendas do Dia.",
            variante: "perigo",
          });
        }
      }

      setCarrinho([]);
      setDialogoPagamento(false);
      setDialogoDetalhes(false);
      setObservacao("");
      setValorRecebido("");
      setFormaPagamento("Dinheiro");

      avisar({ titulo: "Venda registrada", descricao: `Total ${moeda(venda.total)}` });
    } catch (erro) {
      avisar({
        titulo: "Erro ao finalizar venda",
        descricao: erro instanceof Error ? erro.message : "Tente novamente",
        variante: "perigo",
      });
    }
  }

  const larguraLista = ehDesktop ? larguraTotal - 384 - espaco.lg : larguraTotal;
  const colunasProdutos = colunas(larguraLista, 200, 4);
  const filtroAtivo = Boolean(busca || codigoBarras || categoria !== "todas");

  return (
    <View style={{ flexDirection: ehDesktop ? "row" : "column", gap: espaco.lg }}>
      <View style={{ flex: 1, gap: espaco.lg }}>
        <TituloPagina titulo="PDV / Ponto de Venda" descricao="Selecione produtos para adicionar à venda" />

        <View style={{ flexDirection: "row", alignItems: "center", gap: espaco.md, flexWrap: "wrap" }}>
          <Rotulo>Vendedor:</Rotulo>
          <View style={{ width: ehDesktop ? 256 : "100%" }}>
            <Seletor
              testID="select-salesperson"
              valor={vendedorId}
              onChange={setVendedorId}
              placeholder="Selecione o vendedor"
              opcoes={vendedores.map((vendedor) => ({ valor: vendedor.id, rotulo: vendedor.nome }))}
            />
          </View>
        </View>

        <View style={{ gap: espaco.md }}>
          <View style={{ flexDirection: "row", gap: espaco.sm }}>
            <Campo
              testID="input-product-search"
              valor={busca}
              onChange={setBusca}
              placeholder="Buscar produtos por nome ou categoria..."
              iconeEsquerda={<Search size={16} color={cores.suaveTexto} />}
              iconeDireita={
                busca ? (
                  <Botao
                    testID="button-clear-search"
                    variante="fantasma"
                    tamanho="pequeno"
                    titulo="Limpar"
                    onPress={() => setBusca("")}
                  />
                ) : undefined
              }
              estilo={{ flex: 1 }}
            />
            <Botao
              testID="button-toggle-view"
              variante="contorno"
              tamanho="icone"
              onPress={() => setModo(modo === "grade" ? "lista" : "grade")}
              icone={
                modo === "grade" ? (
                  <List size={18} color={cores.texto} />
                ) : (
                  <Grid3x3 size={18} color={cores.texto} />
                )
              }
            />
          </View>

          <View style={{ flexDirection: ehDesktop ? "row" : "column", gap: espaco.sm }}>
            <Campo
              testID="input-barcode-search"
              valor={codigoBarras}
              onChange={setCodigoBarras}
              placeholder="Digite ou escaneie o código de barras..."
              aoEnviar={lerCodigoBarras}
              iconeEsquerda={<Barcode size={16} color={cores.suaveTexto} />}
              iconeDireita={
                codigoBarras ? (
                  <Botao
                    testID="button-clear-barcode"
                    variante="fantasma"
                    tamanho="pequeno"
                    titulo="Limpar"
                    onPress={() => setCodigoBarras("")}
                  />
                ) : undefined
              }
              estilo={{ flex: 1 }}
            />
            <View style={{ width: ehDesktop ? 192 : "100%" }}>
              <Seletor
                testID="select-category-filter"
                valor={categoria}
                onChange={setCategoria}
                opcoes={categorias.map((item) => ({
                  valor: item,
                  rotulo: item === "todas" ? "Todas Categorias" : item,
                }))}
              />
            </View>
          </View>

          {filtroAtivo ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: espaco.sm }}>
              <Selo
                testID="badge-search-results"
                texto={`${filtrados.length} ${filtrados.length === 1 ? "produto encontrado" : "produtos encontrados"}`}
              />
              <View style={{ flex: 1 }} />
              <Botao
                testID="button-clear-all-filters"
                variante="fantasma"
                tamanho="pequeno"
                titulo="Limpar Todos os Filtros"
                onPress={() => {
                  setBusca("");
                  setCodigoBarras("");
                  setCategoria("todas");
                }}
              />
            </View>
          ) : null}
        </View>

        {carregandoProdutos ? (
          <View style={{ alignItems: "center", paddingVertical: espaco.xxl, gap: espaco.lg }}>
            <Package size={48} color={cores.suaveTexto} />
            <Text style={{ color: cores.suaveTexto, fontSize: fonte.md, fontWeight: "500" }}>
              Carregando produtos...
            </Text>
          </View>
        ) : filtrados.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: espaco.xxl, gap: espaco.sm }}>
            <Package size={48} color={cores.suaveTexto} />
            <Text style={{ color: cores.suaveTexto, fontSize: fonte.md, fontWeight: "500" }}>
              Nenhum produto encontrado
            </Text>
            <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>
              Cadastre produtos na seção &quot;Produtos&quot; para começar a vender
            </Text>
          </View>
        ) : modo === "grade" ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: espaco.lg }}>
            {filtrados.map((produto) => (
              <CartaoProduto
                key={produto.id}
                id={produto.id}
                nome={produto.nome}
                preco={produto.preco}
                estoque={produto.estoque}
                imagem={produto.imagem}
                categoria={produto.categoria}
                aoAdicionar={adicionar}
                largura={larguraColuna(larguraLista, colunasProdutos)}
                alertaEstoqueBaixo={configuracao?.alertaEstoqueBaixo !== false}
              />
            ))}
          </View>
        ) : (
          <Cartao>
            <View style={{ paddingHorizontal: espaco.lg }}>
              <Tabela larguraMinima={ehDesktop ? undefined : 560}>
                <LinhaTabela cabecalho>
                  <CelulaTabela cabecalho proporcao={3}>
                    Produto
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={2}>
                    Categoria
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={1.5} alinhamento="flex-end">
                    Preço
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={1} alinhamento="flex-end">
                    Estoque
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={1} alinhamento="flex-end">
                    Ação
                  </CelulaTabela>
                </LinhaTabela>

                {filtrados.map((produto) => (
                  <LinhaTabela key={produto.id} testID={`product-row-${produto.id}`}>
                    <CelulaTabela proporcao={3} estiloTexto={{ fontWeight: "500" }}>
                      {produto.nome}
                    </CelulaTabela>
                    <CelulaTabela proporcao={2}>
                      <Selo texto={produto.categoria} variante="contorno" />
                    </CelulaTabela>
                    <CelulaTabela proporcao={1.5} alinhamento="flex-end">
                      {moeda(produto.preco)}
                    </CelulaTabela>
                    <CelulaTabela proporcao={1} alinhamento="flex-end">
                      {configuracao?.alertaEstoqueBaixo !== false && produto.estoque < 10 ? (
                        <Selo texto={String(produto.estoque)} variante="perigo" />
                      ) : (
                        <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>
                          {produto.estoque}
                        </Text>
                      )}
                    </CelulaTabela>
                    <CelulaTabela proporcao={1} alinhamento="flex-end">
                      <Botao
                        testID={`button-add-${produto.id}`}
                        variante="fantasma"
                        tamanho="icone"
                        onPress={() => adicionar(produto.id)}
                        icone={<Plus size={16} color={cores.texto} />}
                      />
                    </CelulaTabela>
                  </LinhaTabela>
                ))}
              </Tabela>
            </View>
          </Cartao>
        )}
      </View>

      <Cartao testID="card-shopping-cart" estilo={{ width: ehDesktop ? 384 : "100%" }}>
        <View style={{ padding: espaco.xl, borderBottomWidth: 1, borderBottomColor: cores.borda }}>
          <Text style={{ color: cores.texto, fontSize: fonte.xl, fontWeight: "700" }}>Carrinho</Text>
          <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>
            {`${carrinho.length} ${carrinho.length === 1 ? "item" : "itens"}`}
          </Text>
        </View>

        <View style={{ padding: espaco.xl, gap: espaco.md }}>
          {carrinho.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: espaco.xl, gap: espaco.xs }}>
              <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>Carrinho vazio</Text>
              <Text style={{ color: cores.suaveTexto, fontSize: fonte.sm }}>
                Adicione produtos para iniciar a venda
              </Text>
            </View>
          ) : (
            carrinho.map((item) => (
              <ItemCarrinho
                key={item.id}
                id={item.id}
                nome={item.nome}
                preco={item.preco}
                quantidade={item.quantidade}
                desconto={item.desconto}
                aoIncrementar={(id) =>
                  setCarrinho((atual) =>
                    atual.map((linha) =>
                      linha.id === id ? { ...linha, quantidade: linha.quantidade + 1 } : linha,
                    ),
                  )
                }
                aoDecrementar={(id) =>
                  setCarrinho((atual) =>
                    atual.map((linha) =>
                      linha.id === id && linha.quantidade > 1
                        ? { ...linha, quantidade: linha.quantidade - 1 }
                        : linha,
                    ),
                  )
                }
                aoRemover={(id) => setCarrinho((atual) => atual.filter((linha) => linha.id !== id))}
                aoMudarDesconto={(id, valor) =>
                  setCarrinho((atual) =>
                    atual.map((linha) =>
                      linha.id === id ? { ...linha, desconto: Math.max(0, valor) } : linha,
                    ),
                  )
                }
                aoMudarPreco={(id, valor) =>
                  setCarrinho((atual) =>
                    atual.map((linha) =>
                      linha.id === id ? { ...linha, preco: Math.max(0.01, valor) } : linha,
                    ),
                  )
                }
              />
            ))
          )}
        </View>

        {carrinho.length > 0 ? (
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: cores.borda,
              padding: espaco.xl,
              gap: espaco.lg,
            }}
          >
            <View style={{ gap: espaco.sm }}>
              <LinhaResumo rotulo="Subtotal" valor={moeda(subtotal)} />
              <LinhaResumo rotulo="Desconto" valor={moeda(descontoTotal)} />
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: cores.texto, fontSize: fonte.lg, fontWeight: "700" }}>Total</Text>
                <Text
                  testID="text-cart-total"
                  style={{ color: cores.primaria, fontSize: fonte.lg, fontWeight: "700" }}
                >
                  {moeda(total)}
                </Text>
              </View>
            </View>

            <Botao
              testID="button-checkout"
              titulo="Finalizar Venda"
              tamanho="grande"
              larguraTotal
              icone={<CreditCard size={18} color={cores.primariaTexto} />}
              onPress={() => setDialogoDetalhes(true)}
            />
          </View>
        ) : null}
      </Cartao>

      <Dialogo
        aberto={dialogoDetalhes}
        onFechar={() => setDialogoDetalhes(false)}
        titulo="Detalhes da Venda"
        testID="dialog-observation"
        rodape={
          <>
            <Botao
              testID="button-cancel-observation"
              variante="contorno"
              titulo="Cancelar"
              onPress={() => setDialogoDetalhes(false)}
            />
            <Botao
              testID="button-proceed-payment"
              titulo="Prosseguir para Pagamento"
              onPress={() => {
                setDialogoDetalhes(false);
                setDialogoPagamento(true);
              }}
            />
          </>
        }
      >
        <View style={{ gap: espaco.sm }}>
          <Rotulo>Forma de Pagamento</Rotulo>
          <Seletor
            testID="select-payment-method"
            valor={formaPagamento}
            onChange={setFormaPagamento}
            opcoes={formasPagamento.map((forma) => ({ valor: forma, rotulo: forma }))}
          />
        </View>

        <View style={{ gap: espaco.sm }}>
          <Rotulo>Observações (opcional)</Rotulo>
          <AreaTexto
            testID="textarea-observation"
            valor={observacao}
            onChange={setObservacao}
            placeholder="Digite observações sobre a venda..."
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            borderTopWidth: 1,
            borderTopColor: cores.borda,
            paddingTop: espaco.md,
          }}
        >
          <Text style={{ color: cores.texto, fontSize: fonte.lg, fontWeight: "600" }}>Total:</Text>
          <Text style={{ color: cores.primaria, fontSize: fonte.lg, fontWeight: "700" }}>{moeda(total)}</Text>
        </View>
      </Dialogo>

      <Dialogo
        aberto={dialogoPagamento}
        onFechar={() => setDialogoPagamento(false)}
        titulo="Finalizar Pagamento"
        testID="dialog-payment"
        rodape={
          <>
            <Botao
              testID="button-back-to-observation"
              variante="contorno"
              titulo="Voltar"
              onPress={() => {
                setDialogoPagamento(false);
                setDialogoDetalhes(true);
              }}
            />
            <Botao
              testID="button-confirm-payment"
              titulo={configuracao?.impressaoAutomatica === false ? "Confirmar" : "Confirmar e Imprimir"}
              carregando={registrarVenda.isPending}
              desabilitado={formaPagamento === "Dinheiro" && (!valorRecebido || paraNumero(valorRecebido) < total)}
              onPress={finalizar}
            />
          </>
        }
      >
        <LinhaResumo rotulo="Forma de Pagamento:" valor={formaPagamento} />
        {observacao ? <LinhaResumo rotulo="Observação:" valor={observacao} /> : null}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            borderTopWidth: 1,
            borderTopColor: cores.borda,
            paddingTop: espaco.md,
          }}
        >
          <Text style={{ color: cores.texto, fontSize: fonte.lg }}>Total a Pagar:</Text>
          <Text style={{ color: cores.primaria, fontSize: fonte.lg, fontWeight: "700" }}>{moeda(total)}</Text>
        </View>

        {formaPagamento === "Dinheiro" ? (
          <>
            <View style={{ gap: espaco.sm }}>
              <Rotulo>Valor Recebido</Rotulo>
              <Campo
                testID="input-payment-amount"
                valor={valorRecebido}
                onChange={setValorRecebido}
                placeholder="0,00"
                teclado="decimal-pad"
              />
            </View>

            {valorRecebido && troco >= 0 ? (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: cores.texto, fontSize: fonte.lg }}>Troco:</Text>
                <Text
                  testID="text-change"
                  style={{ color: cores.grafico2, fontSize: fonte.lg, fontWeight: "700" }}
                >
                  {moeda(troco)}
                </Text>
              </View>
            ) : null}
          </>
        ) : null}
      </Dialogo>
    </View>
  );
}

function LinhaResumo({ rotulo, valor }: { rotulo: string; valor: string }) {
  const { cores } = useTema();

  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: espaco.sm }}>
      <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>{rotulo}</Text>
      <Text style={{ color: cores.texto, fontSize: fonte.base, fontWeight: "500" }}>{valor}</Text>
    </View>
  );
}
