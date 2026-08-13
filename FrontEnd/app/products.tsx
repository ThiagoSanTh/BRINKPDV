import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Pencil, Plus, Search, Tag, Trash2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";

import { useAvisos } from "../componentes/ui/Avisos";
import { Botao } from "../componentes/ui/Botao";
import { Campo, Rotulo } from "../componentes/ui/Campo";
import { Cartao } from "../componentes/ui/Cartao";
import { Dialogo } from "../componentes/ui/Dialogo";
import { Grade } from "../componentes/ui/Grade";
import { Selo } from "../componentes/ui/Selo";
import { CelulaTabela, LinhaTabela, Tabela } from "../componentes/ui/Tabela";
import { TituloPagina } from "../componentes/ui/TituloPagina";
import { api } from "../lib/api";
import { chaves } from "../lib/consultas";
import { moeda, paraNumero } from "../lib/formato";
import { colunas, useLarguraConteudo } from "../lib/layout";
import { Produto } from "../lib/tipos";
import { useTema } from "../tema/TemaProvider";
import { espaco, fonte, raio } from "../tema/tokens";

type Formulario = {
  sku: string;
  nome: string;
  categoria: string;
  preco: string;
  precoCusto: string;
  estoque: string;
  codigoBarras: string;
};

const formularioVazio: Formulario = {
  sku: "",
  nome: "",
  categoria: "",
  preco: "",
  precoCusto: "",
  estoque: "",
  codigoBarras: "",
};

export default function TelaProdutos() {
  const { cores, ehDesktop } = useTema();
  const largura = useLarguraConteudo();
  const { avisar } = useAvisos();
  const clienteConsultas = useQueryClient();

  const [busca, setBusca] = useState("");
  const [dialogoNovo, setDialogoNovo] = useState(false);
  const [dialogoEditar, setDialogoEditar] = useState(false);
  const [dialogoExcluir, setDialogoExcluir] = useState(false);
  const [selecionado, setSelecionado] = useState<Produto | null>(null);
  const [formulario, setFormulario] = useState<Formulario>(formularioVazio);

  const { data: produtos = [] } = useQuery<Produto[]>({ queryKey: chaves.produtos });

  function invalidar() {
    clienteConsultas.invalidateQueries({ queryKey: chaves.produtos });
  }

  const criar = useMutation({
    mutationFn: (dados: unknown) => api.criar<Produto>("/api/produtos", dados),
    onSuccess: invalidar,
  });

  const atualizar = useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: unknown }) =>
      api.atualizar<Produto>(`/api/produtos/${id}`, dados),
    onSuccess: invalidar,
  });

  const excluir = useMutation({
    mutationFn: (id: string) => api.remover(`/api/produtos/${id}`),
    onSuccess: invalidar,
  });

  const filtrados = useMemo(
    () =>
      produtos.filter((produto) => {
        const termo = busca.toLowerCase();
        return (
          produto.nome.toLowerCase().includes(termo) ||
          produto.sku.toLowerCase().includes(termo) ||
          produto.categoria.toLowerCase().includes(termo)
        );
      }),
    [produtos, busca],
  );

  const categorias = useMemo(() => {
    const mapa = produtos.reduce<
      Record<string, { nome: string; quantidade: number; valorTotal: number; estoqueTotal: number }>
    >((acumulado, produto) => {
      const nome = produto.categoria.trim();
      const chave = nome.toLowerCase();

      if (!acumulado[chave]) {
        acumulado[chave] = { nome, quantidade: 0, valorTotal: 0, estoqueTotal: 0 };
      }

      acumulado[chave].quantidade += 1;
      acumulado[chave].valorTotal += produto.preco * produto.estoque;
      acumulado[chave].estoqueTotal += produto.estoque;

      return acumulado;
    }, {});

    return Object.values(mapa).sort((a, b) => b.quantidade - a.quantidade);
  }, [produtos]);

  function corpoFormulario() {
    return {
      sku: formulario.sku,
      nome: formulario.nome,
      categoria: formulario.categoria || "Sem Categoria",
      preco: paraNumero(formulario.preco),
      precoCusto: formulario.precoCusto ? paraNumero(formulario.precoCusto) : 0,
      estoque: formulario.estoque ? Math.trunc(paraNumero(formulario.estoque)) : 0,
      codigoBarras: formulario.codigoBarras || null,
      imagem: selecionado?.imagem ?? null,
    };
  }

  function validar() {
    if (!formulario.sku || !formulario.nome || !formulario.preco) {
      avisar({
        titulo: "Campos obrigatórios faltando",
        descricao: "Preencha: SKU, Nome e Preço de Venda",
        variante: "perigo",
      });
      return false;
    }

    if (paraNumero(formulario.preco) < 0 || paraNumero(formulario.precoCusto) < 0) {
      avisar({
        titulo: "Valores inválidos",
        descricao: "Preços não podem ser negativos",
        variante: "perigo",
      });
      return false;
    }

    return true;
  }

  async function salvarNovo() {
    if (!validar()) {
      return;
    }

    try {
      await criar.mutateAsync(corpoFormulario());
      avisar({ titulo: "Produto cadastrado!", descricao: `${formulario.nome} foi adicionado com sucesso` });
      setDialogoNovo(false);
      setFormulario(formularioVazio);
    } catch (erro) {
      avisar({
        titulo: "Erro ao salvar",
        descricao: erro instanceof Error ? erro.message : "Tente novamente",
        variante: "perigo",
      });
    }
  }

  async function salvarEdicao() {
    if (!selecionado || !validar()) {
      return;
    }

    try {
      await atualizar.mutateAsync({ id: selecionado.id, dados: corpoFormulario() });
      avisar({ titulo: "Produto atualizado!", descricao: `${formulario.nome} foi atualizado com sucesso` });
      setDialogoEditar(false);
      setFormulario(formularioVazio);
      setSelecionado(null);
    } catch (erro) {
      avisar({
        titulo: "Erro ao atualizar",
        descricao: erro instanceof Error ? erro.message : "Tente novamente",
        variante: "perigo",
      });
    }
  }

  async function confirmarExclusao() {
    if (!selecionado) {
      return;
    }

    try {
      await excluir.mutateAsync(selecionado.id);
      avisar({ titulo: "Produto excluído", descricao: `${selecionado.nome} foi removido do estoque` });
    } catch (erro) {
      avisar({
        titulo: "Erro ao excluir",
        descricao: erro instanceof Error ? erro.message : "Tente novamente",
        variante: "perigo",
      });
    } finally {
      setDialogoExcluir(false);
      setSelecionado(null);
    }
  }

  const camposFormulario = (prefixo: string) => (
    <>
      <View style={{ flexDirection: ehDesktop ? "row" : "column", gap: espaco.md }}>
        <View style={{ flex: 1, gap: espaco.sm }}>
          <Rotulo>SKU *</Rotulo>
          <Campo
            testID={`input-${prefixo}sku`}
            valor={formulario.sku}
            onChange={(texto) => setFormulario((atual) => ({ ...atual, sku: texto }))}
            placeholder="ELE-001"
          />
        </View>
        <View style={{ flex: 1, gap: espaco.sm }}>
          <Rotulo>Categoria</Rotulo>
          <Campo
            testID={`input-${prefixo}category`}
            valor={formulario.categoria}
            onChange={(texto) => setFormulario((atual) => ({ ...atual, categoria: texto }))}
            placeholder="Eletrônicos"
          />
        </View>
      </View>

      <View style={{ gap: espaco.sm }}>
        <Rotulo>Nome do Produto *</Rotulo>
        <Campo
          testID={`input-${prefixo}name`}
          valor={formulario.nome}
          onChange={(texto) => setFormulario((atual) => ({ ...atual, nome: texto }))}
          placeholder="Nome do produto"
        />
      </View>

      <View style={{ flexDirection: ehDesktop ? "row" : "column", gap: espaco.md }}>
        <View style={{ flex: 1, gap: espaco.sm }}>
          <Rotulo>Preço de Custo (R$)</Rotulo>
          <Campo
            testID={`input-${prefixo}cost-price`}
            valor={formulario.precoCusto}
            onChange={(texto) => setFormulario((atual) => ({ ...atual, precoCusto: texto }))}
            placeholder="0,00"
            teclado="decimal-pad"
          />
        </View>
        <View style={{ flex: 1, gap: espaco.sm }}>
          <Rotulo>Preço de Venda (R$) *</Rotulo>
          <Campo
            testID={`input-${prefixo}price`}
            valor={formulario.preco}
            onChange={(texto) => setFormulario((atual) => ({ ...atual, preco: texto }))}
            placeholder="0,00"
            teclado="decimal-pad"
          />
        </View>
      </View>

      <View style={{ flexDirection: ehDesktop ? "row" : "column", gap: espaco.md }}>
        <View style={{ flex: 1, gap: espaco.sm }}>
          <Rotulo>{prefixo ? "Estoque" : "Estoque Inicial"}</Rotulo>
          <Campo
            testID={`input-${prefixo}stock`}
            valor={formulario.estoque}
            onChange={(texto) => setFormulario((atual) => ({ ...atual, estoque: texto }))}
            placeholder="0"
            teclado="number-pad"
          />
        </View>
        <View style={{ flex: 1, gap: espaco.sm }}>
          <Rotulo>Código de Barras</Rotulo>
          <Campo
            testID={`input-${prefixo}barcode`}
            valor={formulario.codigoBarras}
            onChange={(texto) => setFormulario((atual) => ({ ...atual, codigoBarras: texto }))}
            placeholder="7891234567890"
          />
        </View>
      </View>
    </>
  );

  return (
    <View style={{ gap: espaco.xl }}>
      <TituloPagina
        titulo="Produtos"
        descricao="Gerenciar catálogo de produtos"
        acoes={
          <Botao
            testID="button-add-product"
            titulo="Novo Produto"
            icone={<Plus size={16} color={cores.primariaTexto} />}
            onPress={() => {
              setFormulario(formularioVazio);
              setDialogoNovo(true);
            }}
          />
        }
      />

      {categorias.length > 0 ? (
        <Grade colunas={colunas(largura, 240, 4)} largura={largura} espacamento={espaco.md}>
          {categorias.map((categoria) => (
            <Cartao key={categoria.nome} testID={`card-category-${categoria.nome}`}>
              <View style={{ padding: espaco.md, gap: espaco.sm }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: espaco.sm }}>
                  <View style={{ padding: 6, borderRadius: raio.pequeno, backgroundColor: cores.suave }}>
                    <Tag size={14} color={cores.primaria} />
                  </View>
                  <Text
                    numberOfLines={1}
                    style={{ color: cores.texto, fontSize: fonte.base, fontWeight: "600", flex: 1 }}
                  >
                    {categoria.nome}
                  </Text>
                  <Selo texto={String(categoria.quantidade)} />
                </View>

                <View style={{ gap: espaco.xs }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>Estoque</Text>
                    <Text style={{ color: cores.texto, fontSize: fonte.base, fontWeight: "500" }}>
                      {`${categoria.estoqueTotal} un.`}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>Valor Total</Text>
                    <Text style={{ color: cores.primaria, fontSize: fonte.base, fontWeight: "600" }}>
                      {moeda(categoria.valorTotal)}
                    </Text>
                  </View>
                </View>
              </View>
            </Cartao>
          ))}
        </Grade>
      ) : null}

      <Cartao>
        <View style={{ padding: espaco.xl, gap: espaco.xl }}>
          <Campo
            testID="input-product-search"
            valor={busca}
            onChange={setBusca}
            placeholder="Buscar por nome, SKU ou categoria..."
            iconeEsquerda={<Search size={16} color={cores.suaveTexto} />}
          />

          <View style={{ borderWidth: 1, borderColor: cores.borda, borderRadius: raio.medio }}>
            <View style={{ paddingHorizontal: espaco.lg }}>
              <Tabela larguraMinima={ehDesktop ? 900 : 780}>
                <LinhaTabela cabecalho>
                  <CelulaTabela cabecalho proporcao={1.2}>
                    SKU
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={2.4}>
                    Produto
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={1.6}>
                    Categoria
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={1.3} alinhamento="flex-end">
                    Preço Custo
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={1.3} alinhamento="flex-end">
                    Preço Venda
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={1} alinhamento="flex-end">
                    Margem
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={1} alinhamento="flex-end">
                    Estoque
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={1.2} alinhamento="flex-end">
                    Ações
                  </CelulaTabela>
                </LinhaTabela>

                {filtrados.map((produto) => {
                  const custo = produto.precoCusto ?? 0;
                  const margem = custo > 0 ? ((produto.preco - custo) / custo) * 100 : 0;

                  return (
                    <LinhaTabela key={produto.id} testID={`row-product-${produto.id}`}>
                      <CelulaTabela proporcao={1.2}>{produto.sku}</CelulaTabela>
                      <CelulaTabela proporcao={2.4} estiloTexto={{ fontWeight: "500" }}>
                        {produto.nome}
                      </CelulaTabela>
                      <CelulaTabela proporcao={1.6}>
                        <Selo texto={produto.categoria} />
                      </CelulaTabela>
                      <CelulaTabela
                        proporcao={1.3}
                        alinhamento="flex-end"
                        estiloTexto={{ color: cores.suaveTexto }}
                      >
                        {moeda(custo)}
                      </CelulaTabela>
                      <CelulaTabela
                        proporcao={1.3}
                        alinhamento="flex-end"
                        estiloTexto={{ fontWeight: "600" }}
                      >
                        {moeda(produto.preco)}
                      </CelulaTabela>
                      <CelulaTabela proporcao={1} alinhamento="flex-end">
                        {custo > 0 ? (
                          <Selo
                            texto={`${margem.toFixed(1)}%`}
                            variante={margem >= 30 ? "primario" : margem >= 0 ? "suave" : "perigo"}
                          />
                        ) : (
                          <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>-</Text>
                        )}
                      </CelulaTabela>
                      <CelulaTabela proporcao={1} alinhamento="flex-end">
                        {produto.estoque < 10 ? (
                          <Selo texto={String(produto.estoque)} variante="perigo" />
                        ) : (
                          <Text style={{ color: cores.texto, fontSize: fonte.base, fontWeight: "500" }}>
                            {produto.estoque}
                          </Text>
                        )}
                      </CelulaTabela>
                      <CelulaTabela proporcao={1.2} alinhamento="flex-end">
                        <View style={{ flexDirection: "row", gap: espaco.sm }}>
                          <Botao
                            testID={`button-edit-${produto.id}`}
                            variante="fantasma"
                            tamanho="icone"
                            onPress={() => {
                              setSelecionado(produto);
                              setFormulario({
                                sku: produto.sku,
                                nome: produto.nome,
                                categoria: produto.categoria,
                                preco: String(produto.preco),
                                precoCusto: produto.precoCusto ? String(produto.precoCusto) : "",
                                estoque: String(produto.estoque),
                                codigoBarras: produto.codigoBarras ?? "",
                              });
                              setDialogoEditar(true);
                            }}
                            icone={<Pencil size={16} color={cores.texto} />}
                          />
                          <Botao
                            testID={`button-delete-${produto.id}`}
                            variante="fantasma"
                            tamanho="icone"
                            onPress={() => {
                              setSelecionado(produto);
                              setDialogoExcluir(true);
                            }}
                            icone={<Trash2 size={16} color={cores.texto} />}
                          />
                        </View>
                      </CelulaTabela>
                    </LinhaTabela>
                  );
                })}
              </Tabela>
            </View>
          </View>

          {filtrados.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: espaco.xxl, gap: espaco.lg }}>
              <Package size={48} color={cores.suaveTexto} />
              <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>Nenhum produto encontrado</Text>
            </View>
          ) : null}
        </View>
      </Cartao>

      <Dialogo
        aberto={dialogoNovo}
        onFechar={() => setDialogoNovo(false)}
        titulo="Novo Produto"
        testID="dialog-new-product"
        rodape={
          <>
            <Botao variante="contorno" titulo="Cancelar" onPress={() => setDialogoNovo(false)} />
            <Botao
              testID="button-save-product"
              titulo="Salvar Produto"
              carregando={criar.isPending}
              onPress={salvarNovo}
            />
          </>
        }
      >
        {camposFormulario("")}
      </Dialogo>

      <Dialogo
        aberto={dialogoEditar}
        onFechar={() => setDialogoEditar(false)}
        titulo="Editar Produto"
        testID="dialog-edit-product"
        rodape={
          <>
            <Botao variante="contorno" titulo="Cancelar" onPress={() => setDialogoEditar(false)} />
            <Botao
              testID="button-update-product"
              titulo="Atualizar Produto"
              carregando={atualizar.isPending}
              onPress={salvarEdicao}
            />
          </>
        }
      >
        {camposFormulario("edit-")}
      </Dialogo>

      <Dialogo
        aberto={dialogoExcluir}
        onFechar={() => setDialogoExcluir(false)}
        titulo="Confirmar Exclusão"
        descricao={`Tem certeza que deseja excluir o produto ${selecionado?.nome ?? ""}?`}
        testID="dialog-delete-product"
        rodape={
          <>
            <Botao variante="contorno" titulo="Cancelar" onPress={() => setDialogoExcluir(false)} />
            <Botao
              testID="button-confirm-delete"
              variante="perigo"
              titulo="Excluir"
              carregando={excluir.isPending}
              onPress={confirmarExclusao}
            />
          </>
        }
      />
    </View>
  );
}
