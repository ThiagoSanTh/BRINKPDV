import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2, Users } from "lucide-react-native";
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
import { dataCurta, moeda, paraNumero } from "../lib/formato";
import { colunas, useLarguraConteudo } from "../lib/layout";
import { Vendedor } from "../lib/tipos";
import { useTema } from "../tema/TemaProvider";
import { espaco, fonte, raio } from "../tema/tokens";

type Formulario = {
  nome: string;
  email: string;
  telefone: string;
  comissao: string;
  dataEntrada: string;
};

const formularioVazio: Formulario = { nome: "", email: "", telefone: "", comissao: "", dataEntrada: "" };

export default function TelaVendedores() {
  const { cores, ehDesktop } = useTema();
  const largura = useLarguraConteudo();
  const { avisar } = useAvisos();
  const clienteConsultas = useQueryClient();

  const [busca, setBusca] = useState("");
  const [dialogoNovo, setDialogoNovo] = useState(false);
  const [dialogoEditar, setDialogoEditar] = useState(false);
  const [dialogoExcluir, setDialogoExcluir] = useState(false);
  const [selecionado, setSelecionado] = useState<Vendedor | null>(null);
  const [formulario, setFormulario] = useState<Formulario>(formularioVazio);

  const { data: vendedores = [] } = useQuery<Vendedor[]>({ queryKey: chaves.vendedores });

  function invalidar() {
    clienteConsultas.invalidateQueries({ queryKey: chaves.vendedores });
  }

  const criar = useMutation({
    mutationFn: (dados: unknown) => api.criar<Vendedor>("/api/vendedores", dados),
    onSuccess: invalidar,
  });

  const atualizar = useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: unknown }) =>
      api.atualizar<Vendedor>(`/api/vendedores/${id}`, dados),
    onSuccess: invalidar,
  });

  const excluir = useMutation({
    mutationFn: (id: string) => api.remover(`/api/vendedores/${id}`),
    onSuccess: invalidar,
  });

  const filtrados = useMemo(
    () =>
      vendedores.filter((vendedor) => {
        const termo = busca.toLowerCase();
        return (
          vendedor.nome.toLowerCase().includes(termo) ||
          vendedor.email.toLowerCase().includes(termo) ||
          vendedor.telefone.includes(busca)
        );
      }),
    [vendedores, busca],
  );

  const ativos = vendedores.filter((vendedor) => vendedor.ativo).length;
  const comissoes = vendedores.reduce(
    (soma, vendedor) => soma + (vendedor.totalVendas * vendedor.comissao) / 100,
    0,
  );

  function validar() {
    if (!formulario.nome || !formulario.email || !formulario.comissao) {
      avisar({
        titulo: "Campos obrigatórios faltando",
        descricao: "Preencha: Nome, E-mail e Comissão",
        variante: "perigo",
      });
      return false;
    }

    return true;
  }

  function corpo() {
    return {
      nome: formulario.nome,
      email: formulario.email,
      telefone: formulario.telefone,
      comissao: paraNumero(formulario.comissao),
      ativo: selecionado?.ativo ?? true,
      dataEntrada: formulario.dataEntrada || null,
    };
  }

  async function salvarNovo() {
    if (!validar()) {
      return;
    }

    try {
      await criar.mutateAsync(corpo());
      avisar({ titulo: "Vendedor cadastrado!", descricao: `${formulario.nome} foi adicionado com sucesso` });
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
      await atualizar.mutateAsync({ id: selecionado.id, dados: corpo() });
      avisar({ titulo: "Vendedor atualizado!", descricao: `${formulario.nome} foi atualizado com sucesso` });
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
      avisar({ titulo: "Vendedor removido", descricao: `${selecionado.nome} foi removido do sistema` });
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

  const campos = (prefixo: string) => (
    <>
      <View style={{ gap: espaco.sm }}>
        <Rotulo>Nome Completo</Rotulo>
        <Campo
          testID={`input-${prefixo}name`}
          valor={formulario.nome}
          onChange={(texto) => setFormulario((atual) => ({ ...atual, nome: texto }))}
          placeholder="Nome do vendedor"
        />
      </View>

      <View style={{ gap: espaco.sm }}>
        <Rotulo>E-mail</Rotulo>
        <Campo
          testID={`input-${prefixo}email`}
          valor={formulario.email}
          onChange={(texto) => setFormulario((atual) => ({ ...atual, email: texto }))}
          placeholder="email@exemplo.com"
          teclado="email-address"
        />
      </View>

      <View style={{ gap: espaco.sm }}>
        <Rotulo>Telefone</Rotulo>
        <Campo
          testID={`input-${prefixo}phone`}
          valor={formulario.telefone}
          onChange={(texto) => setFormulario((atual) => ({ ...atual, telefone: texto }))}
          placeholder="(11) 99999-9999"
          teclado="phone-pad"
        />
      </View>

      <View style={{ gap: espaco.sm }}>
        <Rotulo>Comissão (%)</Rotulo>
        <Campo
          testID={`input-${prefixo}commission`}
          valor={formulario.comissao}
          onChange={(texto) => setFormulario((atual) => ({ ...atual, comissao: texto }))}
          placeholder="Ex: 5.0"
          teclado="decimal-pad"
        />
        <Text style={{ color: cores.suaveTexto, fontSize: fonte.xs }}>
          Percentual de comissão sobre vendas
        </Text>
      </View>

      <View style={{ gap: espaco.sm }}>
        <Rotulo>Data de Entrada</Rotulo>
        <Campo
          testID={`input-${prefixo}entry-date`}
          valor={formulario.dataEntrada}
          onChange={(texto) => setFormulario((atual) => ({ ...atual, dataEntrada: texto }))}
          placeholder="AAAA-MM-DD"
        />
      </View>
    </>
  );

  return (
    <View style={{ gap: espaco.xl }}>
      <TituloPagina
        titulo="Vendedores"
        descricao="Gerenciar vendedores e comissões"
        acoes={
          <Botao
            testID="button-new-salesperson"
            titulo="Novo Vendedor"
            icone={<Plus size={16} color={cores.primariaTexto} />}
            onPress={() => {
              setFormulario(formularioVazio);
              setSelecionado(null);
              setDialogoNovo(true);
            }}
          />
        }
      />

      <Grade colunas={colunas(largura, 260, 3)} largura={largura}>
        {[
          <CartaoResumo key="total" titulo="Total de Vendedores" valor={String(vendedores.length)} />,
          <CartaoResumo key="ativos" titulo="Vendedores Ativos" valor={String(ativos)} cor={cores.grafico2} />,
          <CartaoResumo key="comissoes" titulo="Comissões Pagas" valor={moeda(comissoes)} cor={cores.primaria} />,
        ]}
      </Grade>

      <Cartao>
        <View style={{ padding: espaco.xl, gap: espaco.xl }}>
          <Campo
            testID="input-salesperson-search"
            valor={busca}
            onChange={setBusca}
            placeholder="Buscar por nome, e-mail ou telefone..."
            iconeEsquerda={<Search size={16} color={cores.suaveTexto} />}
          />

          <View style={{ borderWidth: 1, borderColor: cores.borda, borderRadius: raio.medio }}>
            <View style={{ paddingHorizontal: espaco.lg }}>
              <Tabela larguraMinima={ehDesktop ? 1000 : 900}>
                <LinhaTabela cabecalho>
                  <CelulaTabela cabecalho proporcao={2}>
                    Nome
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={2.2}>
                    E-mail
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={1.6}>
                    Telefone
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={1.2}>
                    Comissão (%)
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={1.4}>
                    Vendas Totais
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={1.6}>
                    Comissão a Receber
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={1.4}>
                    Data de Entrada
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={1}>
                    Status
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={1.2}>
                    Ações
                  </CelulaTabela>
                </LinhaTabela>

                {filtrados.map((vendedor) => (
                  <LinhaTabela key={vendedor.id} testID={`row-salesperson-${vendedor.id}`}>
                    <CelulaTabela proporcao={2} estiloTexto={{ fontWeight: "500" }}>
                      {vendedor.nome}
                    </CelulaTabela>
                    <CelulaTabela proporcao={2.2} estiloTexto={{ color: cores.suaveTexto }}>
                      {vendedor.email}
                    </CelulaTabela>
                    <CelulaTabela proporcao={1.6} estiloTexto={{ color: cores.suaveTexto }}>
                      {vendedor.telefone}
                    </CelulaTabela>
                    <CelulaTabela
                      proporcao={1.2}
                      estiloTexto={{ fontWeight: "600" }}
                    >
                      {`${vendedor.comissao.toFixed(1)}%`}
                    </CelulaTabela>
                    <CelulaTabela proporcao={1.4}>
                      {moeda(vendedor.totalVendas)}
                    </CelulaTabela>
                    <CelulaTabela
                      proporcao={1.6}
                      estiloTexto={{ color: cores.primaria, fontWeight: "600" }}
                    >
                      {moeda((vendedor.totalVendas * vendedor.comissao) / 100)}
                    </CelulaTabela>
                    <CelulaTabela proporcao={1.4} estiloTexto={{ color: cores.suaveTexto }}>
                      {dataCurta(vendedor.dataEntrada)}
                    </CelulaTabela>
                    <CelulaTabela proporcao={1}>
                      <Selo
                        texto={vendedor.ativo ? "Ativo" : "Inativo"}
                        variante={vendedor.ativo ? "primario" : "suave"}
                      />
                    </CelulaTabela>
                    <CelulaTabela proporcao={1.2}>
                      <View style={{ flexDirection: "row", gap: espaco.sm, justifyContent: "center" }}>
                        <Botao
                          testID={`button-edit-${vendedor.id}`}
                          variante="fantasma"
                          tamanho="icone"
                          onPress={() => {
                            setSelecionado(vendedor);
                            setFormulario({
                              nome: vendedor.nome,
                              email: vendedor.email,
                              telefone: vendedor.telefone,
                              comissao: String(vendedor.comissao),
                              dataEntrada: vendedor.dataEntrada.slice(0, 10),
                            });
                            setDialogoEditar(true);
                          }}
                          icone={<Pencil size={16} color={cores.texto} />}
                        />
                        <Botao
                          testID={`button-delete-${vendedor.id}`}
                          variante="fantasma"
                          tamanho="icone"
                          onPress={() => {
                            setSelecionado(vendedor);
                            setDialogoExcluir(true);
                          }}
                          icone={<Trash2 size={16} color={cores.texto} />}
                        />
                      </View>
                    </CelulaTabela>
                  </LinhaTabela>
                ))}
              </Tabela>
            </View>
          </View>

          {filtrados.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: espaco.xxl, gap: espaco.lg }}>
              <Users size={48} color={cores.suaveTexto} />
              <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>
                Nenhum vendedor encontrado
              </Text>
            </View>
          ) : null}
        </View>
      </Cartao>

      <Dialogo
        aberto={dialogoNovo}
        onFechar={() => setDialogoNovo(false)}
        titulo="Novo Vendedor"
        testID="dialog-new-salesperson"
        rodape={
          <>
            <Botao variante="contorno" titulo="Cancelar" onPress={() => setDialogoNovo(false)} />
            <Botao
              testID="button-save-salesperson"
              titulo="Salvar Vendedor"
              carregando={criar.isPending}
              onPress={salvarNovo}
            />
          </>
        }
      >
        {campos("")}
      </Dialogo>

      <Dialogo
        aberto={dialogoEditar}
        onFechar={() => setDialogoEditar(false)}
        titulo="Editar Vendedor"
        testID="dialog-edit-salesperson"
        rodape={
          <>
            <Botao variante="contorno" titulo="Cancelar" onPress={() => setDialogoEditar(false)} />
            <Botao
              testID="button-update-salesperson"
              titulo="Atualizar Vendedor"
              carregando={atualizar.isPending}
              onPress={salvarEdicao}
            />
          </>
        }
      >
        {campos("edit-")}
      </Dialogo>

      <Dialogo
        aberto={dialogoExcluir}
        onFechar={() => setDialogoExcluir(false)}
        titulo="Confirmar Exclusão"
        descricao={`Tem certeza que deseja excluir o vendedor ${selecionado?.nome ?? ""}? Esta ação não pode ser desfeita.`}
        testID="dialog-delete-salesperson"
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

function CartaoResumo({ titulo, valor, cor }: { titulo: string; valor: string; cor?: string }) {
  const { cores } = useTema();

  return (
    <Cartao>
      <View style={{ padding: espaco.lg, gap: espaco.sm }}>
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
        <Text style={{ color: cor ?? cores.texto, fontSize: fonte.xxl, fontWeight: "700" }}>{valor}</Text>
      </View>
    </Cartao>
  );
}
