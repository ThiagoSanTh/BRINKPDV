import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2, Wrench } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";

import { useAvisos } from "../componentes/ui/Avisos";
import { Botao } from "../componentes/ui/Botao";
import { AreaTexto, Campo, Rotulo } from "../componentes/ui/Campo";
import { Cartao } from "../componentes/ui/Cartao";
import { Dialogo } from "../componentes/ui/Dialogo";
import { Selo } from "../componentes/ui/Selo";
import { CelulaTabela, LinhaTabela, Tabela } from "../componentes/ui/Tabela";
import { TituloPagina } from "../componentes/ui/TituloPagina";
import { api } from "../lib/api";
import { useAutenticacao } from "../lib/autenticacao";
import { chaves } from "../lib/consultas";
import { moeda, paraNumero } from "../lib/formato";
import { ehGestao } from "../lib/permissoes";
import { Servico } from "../lib/tipos";
import { useTema } from "../tema/TemaProvider";
import { espaco, fonte, raio } from "../tema/tokens";

type Formulario = {
  nome: string;
  descricao: string;
  precoPadrao: string;
  ativo: boolean;
};

const formularioVazio: Formulario = {
  nome: "",
  descricao: "",
  precoPadrao: "",
  ativo: true,
};

export default function TelaServicos() {
  const { cores, ehDesktop } = useTema();
  const { avisar } = useAvisos();
  const { usuario } = useAutenticacao();
  const clienteConsultas = useQueryClient();
  const gestao = ehGestao(usuario?.funcao);

  const [busca, setBusca] = useState("");
  const [dialogoNovo, setDialogoNovo] = useState(false);
  const [dialogoEditar, setDialogoEditar] = useState(false);
  const [dialogoExcluir, setDialogoExcluir] = useState(false);
  const [selecionado, setSelecionado] = useState<Servico | null>(null);
  const [formulario, setFormulario] = useState<Formulario>(formularioVazio);

  const { data: servicos = [] } = useQuery<Servico[]>({ queryKey: chaves.servicos });

  function invalidar() {
    clienteConsultas.invalidateQueries({ queryKey: chaves.servicos });
  }

  const criar = useMutation({
    mutationFn: (dados: unknown) => api.criar<Servico>("/api/servicos", dados),
    onSuccess: invalidar,
  });

  const atualizar = useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: unknown }) =>
      api.atualizar<Servico>(`/api/servicos/${id}`, dados),
    onSuccess: invalidar,
  });

  const excluir = useMutation({
    mutationFn: (id: string) => api.remover(`/api/servicos/${id}`),
    onSuccess: invalidar,
  });

  const filtrados = useMemo(
    () =>
      servicos.filter((servico) => {
        const termo = busca.toLowerCase();
        return (
          servico.nome.toLowerCase().includes(termo) ||
          (servico.descricao ?? "").toLowerCase().includes(termo)
        );
      }),
    [servicos, busca],
  );

  function corpoFormulario() {
    const preco = formulario.precoPadrao.trim();

    return {
      nome: formulario.nome.trim(),
      descricao: formulario.descricao.trim() || null,
      precoPadrao: preco ? paraNumero(preco) : null,
      ativo: formulario.ativo,
    };
  }

  function validar() {
    if (!formulario.nome.trim()) {
      avisar({
        titulo: "Campo obrigatório",
        descricao: "Informe o nome do serviço.",
        variante: "perigo",
      });
      return false;
    }

    if (formulario.precoPadrao.trim() && paraNumero(formulario.precoPadrao) < 0) {
      avisar({
        titulo: "Preço inválido",
        descricao: "O preço padrão não pode ser negativo.",
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
      avisar({ titulo: "Serviço cadastrado!", descricao: `${formulario.nome} foi adicionado com sucesso` });
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
      avisar({ titulo: "Serviço atualizado!", descricao: `${formulario.nome} foi atualizado com sucesso` });
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
      avisar({ titulo: "Serviço excluído", descricao: `${selecionado.nome} foi removido do catálogo` });
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

  function abrirEdicao(servico: Servico) {
    setSelecionado(servico);
    setFormulario({
      nome: servico.nome,
      descricao: servico.descricao ?? "",
      precoPadrao: servico.precoPadrao != null ? String(servico.precoPadrao).replace(".", ",") : "",
      ativo: servico.ativo,
    });
    setDialogoEditar(true);
  }

  const camposFormulario = (prefixo: string) => (
    <>
      <View style={{ gap: espaco.sm }}>
        <Rotulo>Nome do Serviço *</Rotulo>
        <Campo
          testID={`input-${prefixo}name`}
          valor={formulario.nome}
          onChange={(texto) => setFormulario((atual) => ({ ...atual, nome: texto }))}
          placeholder="Ex: Troca de tela"
        />
      </View>

      <View style={{ gap: espaco.sm }}>
        <Rotulo>Descrição</Rotulo>
        <AreaTexto
          testID={`input-${prefixo}description`}
          valor={formulario.descricao}
          onChange={(texto) => setFormulario((atual) => ({ ...atual, descricao: texto }))}
          placeholder="Detalhes do serviço..."
        />
      </View>

      <View style={{ gap: espaco.sm }}>
        <Rotulo>Preço Padrão (R$)</Rotulo>
        <Campo
          testID={`input-${prefixo}price`}
          valor={formulario.precoPadrao}
          onChange={(texto) => setFormulario((atual) => ({ ...atual, precoPadrao: texto }))}
          placeholder="Opcional — deixe vazio para definir na OS"
          teclado="decimal-pad"
        />
        <Text style={{ color: cores.suaveTexto, fontSize: fonte.xs }}>
          Se não informado, o valor será definido ao adicionar o serviço na ordem de serviço.
        </Text>
      </View>
    </>
  );

  return (
    <View style={{ gap: espaco.xl }}>
      <TituloPagina
        titulo="Serviços"
        descricao="Catálogo de serviços para ordens de serviço"
        acoes={
          gestao ? (
            <Botao
              testID="button-add-service"
              titulo="Novo Serviço"
              icone={<Plus size={16} color={cores.primariaTexto} />}
              onPress={() => {
                setFormulario(formularioVazio);
                setDialogoNovo(true);
              }}
            />
          ) : undefined
        }
      />

      <Cartao>
        <View style={{ padding: espaco.xl, gap: espaco.xl }}>
          <Campo
            testID="input-service-search"
            valor={busca}
            onChange={setBusca}
            placeholder="Buscar por nome ou descrição..."
            iconeEsquerda={<Search size={16} color={cores.suaveTexto} />}
          />

          <View style={{ borderWidth: 1, borderColor: cores.borda, borderRadius: raio.medio }}>
            <View style={{ paddingHorizontal: espaco.lg }}>
              <Tabela larguraMinima={ehDesktop ? 720 : 600}>
                <LinhaTabela cabecalho>
                  <CelulaTabela cabecalho proporcao={2}>
                    Serviço
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={2.5}>
                    Descrição
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={1.5}>
                    Preço Padrão
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={1}>
                    Status
                  </CelulaTabela>
                  {gestao ? (
                    <CelulaTabela cabecalho proporcao={1}>
                      Ações
                    </CelulaTabela>
                  ) : null}
                </LinhaTabela>

                {filtrados.map((servico) => (
                  <LinhaTabela key={servico.id} testID={`row-service-${servico.id}`}>
                    <CelulaTabela proporcao={2} estiloTexto={{ fontWeight: "500" }}>
                      {servico.nome}
                    </CelulaTabela>
                    <CelulaTabela proporcao={2.5} estiloTexto={{ color: cores.suaveTexto }}>
                      {servico.descricao || "—"}
                    </CelulaTabela>
                    <CelulaTabela proporcao={1.5}>
                      {servico.precoPadrao != null ? (
                        <Text style={{ color: cores.texto, fontSize: fonte.base, fontWeight: "600" }}>
                          {moeda(servico.precoPadrao)}
                        </Text>
                      ) : (
                        <Text style={{ color: cores.suaveTexto, fontSize: fonte.base, fontStyle: "italic" }}>
                          A definir na OS
                        </Text>
                      )}
                    </CelulaTabela>
                    <CelulaTabela proporcao={1}>
                      <Selo
                        texto={servico.ativo ? "Ativo" : "Inativo"}
                        variante={servico.ativo ? "primario" : "suave"}
                      />
                    </CelulaTabela>
                    {gestao ? (
                      <CelulaTabela proporcao={1}>
                        <View style={{ flexDirection: "row", gap: espaco.sm, justifyContent: "center" }}>
                          <Botao
                            testID={`button-edit-${servico.id}`}
                            variante="fantasma"
                            tamanho="icone"
                            onPress={() => abrirEdicao(servico)}
                            icone={<Pencil size={16} color={cores.texto} />}
                          />
                          <Botao
                            testID={`button-delete-${servico.id}`}
                            variante="fantasma"
                            tamanho="icone"
                            onPress={() => {
                              setSelecionado(servico);
                              setDialogoExcluir(true);
                            }}
                            icone={<Trash2 size={16} color={cores.texto} />}
                          />
                        </View>
                      </CelulaTabela>
                    ) : null}
                  </LinhaTabela>
                ))}
              </Tabela>
            </View>
          </View>

          {filtrados.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: espaco.xxl, gap: espaco.lg }}>
              <Wrench size={48} color={cores.suaveTexto} />
              <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>Nenhum serviço encontrado</Text>
            </View>
          ) : null}
        </View>
      </Cartao>

      <Dialogo
        aberto={dialogoNovo}
        onFechar={() => setDialogoNovo(false)}
        titulo="Novo Serviço"
        testID="dialog-new-service"
        rodape={
          <>
            <Botao variante="contorno" titulo="Cancelar" onPress={() => setDialogoNovo(false)} />
            <Botao
              testID="button-save-service"
              titulo="Salvar Serviço"
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
        titulo="Editar Serviço"
        testID="dialog-edit-service"
        rodape={
          <>
            <Botao variante="contorno" titulo="Cancelar" onPress={() => setDialogoEditar(false)} />
            <Botao
              testID="button-update-service"
              titulo="Atualizar Serviço"
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
        descricao={`Tem certeza que deseja excluir o serviço ${selecionado?.nome ?? ""}?`}
        testID="dialog-delete-service"
        rodape={
          <>
            <Botao variante="contorno" titulo="Cancelar" onPress={() => setDialogoExcluir(false)} />
            <Botao
              testID="button-confirm-delete-service"
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
