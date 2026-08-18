import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

import { useAvisos } from "../../componentes/ui/Avisos";
import { Botao } from "../../componentes/ui/Botao";
import { AreaTexto, Campo, Rotulo } from "../../componentes/ui/Campo";
import { Cartao } from "../../componentes/ui/Cartao";
import { Dialogo } from "../../componentes/ui/Dialogo";
import { Seletor } from "../../componentes/ui/Seletor";
import { TituloPagina } from "../../componentes/ui/TituloPagina";
import { api } from "../../lib/api";
import { chaves } from "../../lib/consultas";
import { paraNumero } from "../../lib/formato";
import {
  Cliente,
  OrdemServico,
  estadosAparelho,
  marcasAparelho,
  prioridadesOrdemServico,
  statusOrdemServico,
  tiposAparelho,
} from "../../lib/tipos";
import { useTema } from "../../tema/TemaProvider";
import { espaco, fonte } from "../../tema/tokens";

export default function TelaNovaOrdemServico() {
  const { cores, ehDesktop } = useTema();
  const { avisar } = useAvisos();
  const roteador = useRouter();
  const clienteConsultas = useQueryClient();
  const { clienteId: clienteIdParam, id: idParam } = useLocalSearchParams<{
    clienteId?: string;
    id?: string;
  }>();
  const idEdicao = Array.isArray(idParam) ? idParam[0] : idParam;
  const editando = Boolean(idEdicao);

  const { data: clientes = [] } = useQuery<Cliente[]>({ queryKey: chaves.clientes });
  const { data: ordemAtual } = useQuery<OrdemServico>({
    queryKey: ["/api/ordens-servico/", idEdicao],
    enabled: editando,
  });

  const [modoCliente, setModoCliente] = useState<"existente" | "novo">("existente");
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [nomeCliente, setNomeCliente] = useState("");
  const [telefoneCliente, setTelefoneCliente] = useState("");
  const [tipoAparelho, setTipoAparelho] = useState<string>("Smartphone");
  const [marca, setMarca] = useState<string>("Samsung");
  const [marcaOutra, setMarcaOutra] = useState("");
  const [modelo, setModelo] = useState("");
  const [estadoAparelho, setEstadoAparelho] = useState<string>("Bom");
  const [problema, setProblema] = useState("");
  const [prioridade, setPrioridade] = useState<string>("Média");
  const [status, setStatus] = useState<string>("Orçamento");
  const [prazo, setPrazo] = useState("");
  const [valor, setValor] = useState("");
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  useEffect(() => {
    const id = Array.isArray(clienteIdParam) ? clienteIdParam[0] : clienteIdParam;

    if (id && !editando) {
      setModoCliente("existente");
      setClienteId(id);
    }
  }, [clienteIdParam, editando]);

  useEffect(() => {
    if (editando || clienteId || clientes.length === 0) {
      return;
    }

    setClienteId(clientes[0].id);
  }, [clientes, clienteId, editando]);

  useEffect(() => {
    if (!ordemAtual) {
      return;
    }

    const marcaLista = marcasAparelho.includes(ordemAtual.marca as (typeof marcasAparelho)[number]);
    setClienteId(ordemAtual.clienteId);
    setNomeCliente(ordemAtual.cliente);
    setTelefoneCliente(ordemAtual.contatoCliente);
    setModoCliente("novo");
    setTipoAparelho(ordemAtual.tipoAparelho || "Smartphone");
    setMarca(marcaLista ? ordemAtual.marca : "Outra");
    setMarcaOutra(marcaLista ? "" : ordemAtual.marca);
    setModelo(ordemAtual.modelo);
    setEstadoAparelho(ordemAtual.estadoAparelho || "Bom");
    setProblema(ordemAtual.problema);
    setPrioridade(ordemAtual.prioridade);
    setStatus(ordemAtual.status);
    setPrazo(ordemAtual.prazo?.slice(0, 10) ?? "");
    setValor(String(ordemAtual.valor ?? 0).replace(".", ","));
  }, [ordemAtual]);

  const opcoesClientes = useMemo(
    () => clientes.map((cliente) => ({ valor: cliente.id, rotulo: `${cliente.nome} — ${cliente.telefone}` })),
    [clientes],
  );

  const criar = useMutation({
    mutationFn: (dados: unknown) => api.criar<OrdemServico>("/api/ordens-servico", dados),
    onSuccess: () => {
      clienteConsultas.invalidateQueries({ queryKey: chaves.ordensServico });
      clienteConsultas.invalidateQueries({ queryKey: chaves.clientes });
    },
  });

  const atualizar = useMutation({
    mutationFn: (dados: unknown) => api.atualizar<OrdemServico>(`/api/ordens-servico/${idEdicao}`, dados),
    onSuccess: () => {
      clienteConsultas.invalidateQueries({ queryKey: chaves.ordensServico });
      clienteConsultas.invalidateQueries({ queryKey: chaves.clientes });
    },
  });

  const excluir = useMutation({
    mutationFn: () => api.remover(`/api/ordens-servico/${idEdicao}`),
    onSuccess: () => {
      clienteConsultas.invalidateQueries({ queryKey: chaves.ordensServico });
      clienteConsultas.invalidateQueries({ queryKey: chaves.clientes });
    },
  });

  function preencherCliente(id: string) {
    setClienteId(id);
    const cliente = clientes.find((item) => item.id === id);

    if (cliente) {
      setNomeCliente(cliente.nome);
      setTelefoneCliente(cliente.telefone);
    }
  }

  function montarPayload() {
    const marcaFinal = marca === "Outra" ? marcaOutra.trim() : marca;

    return {
      clienteId: clienteId || null,
      cliente: nomeCliente.trim() || undefined,
      contatoCliente: telefoneCliente.trim() || undefined,
      tipoAparelho,
      marca: marcaFinal,
      modelo: modelo.trim(),
      estadoAparelho,
      problema: problema.trim(),
      prioridade,
      status,
      valor: paraNumero(valor),
      prazo: prazo || null,
    };
  }

  async function salvar() {
    const marcaFinal = marca === "Outra" ? marcaOutra.trim() : marca;
    const usandoCadastro = !editando && modoCliente === "existente";

    if (usandoCadastro && !clienteId) {
      avisar({
        titulo: "Cliente obrigatório",
        descricao: "Selecione um cliente ou cadastre um novo.",
        variante: "perigo",
      });
      return;
    }

    if ((!usandoCadastro || editando) && (!nomeCliente.trim() || !telefoneCliente.trim())) {
      avisar({
        titulo: "Cliente obrigatório",
        descricao: "Preencha nome e telefone do cliente.",
        variante: "perigo",
      });
      return;
    }

    if (!marcaFinal || !modelo.trim() || !problema.trim()) {
      avisar({
        titulo: "Campos obrigatórios faltando",
        descricao: "Preencha marca, modelo e defeito.",
        variante: "perigo",
      });
      return;
    }

    try {
      const dados = montarPayload();

      if (editando) {
        const ordem = await atualizar.mutateAsync(dados);
        avisar({ titulo: "Ordem atualizada", descricao: `${ordem.numero} foi salva.` });
      } else {
        const ordem = await criar.mutateAsync(
          usandoCadastro
            ? { ...dados, cliente: undefined, contatoCliente: undefined }
            : { ...dados, clienteId: null },
        );
        avisar({ titulo: "Ordem de Serviço criada", descricao: `${ordem.numero} foi salva com sucesso.` });
      }

      roteador.replace("/service-orders");
    } catch (erro) {
      avisar({
        titulo: editando ? "Erro ao atualizar ordem" : "Erro ao criar ordem",
        descricao: erro instanceof Error ? erro.message : "Não foi possível salvar a ordem de serviço.",
        variante: "perigo",
      });
    }
  }

  async function confirmarRemocao() {
    try {
      await excluir.mutateAsync();
      setConfirmarExclusao(false);
      avisar({ titulo: "Ordem excluída", descricao: "A OS foi removida." });
      roteador.replace("/service-orders");
    } catch (erro) {
      avisar({
        titulo: "Erro ao excluir",
        descricao: erro instanceof Error ? erro.message : "Não foi possível excluir a ordem.",
        variante: "perigo",
      });
    }
  }

  const salvando = criar.isPending || atualizar.isPending;

  return (
    <View style={{ gap: espaco.xl }}>
      <TituloPagina
        titulo={editando ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}
        descricao={
          editando
            ? "Altere qualquer informação da OS, inclusive cliente e telefone"
            : "Cadastro de manutenção — compartilhe no WhatsApp depois, se quiser"
        }
        acoes={
          <Botao
            testID="button-back-service-orders"
            variante="contorno"
            titulo="Voltar"
            icone={<ArrowLeft size={16} color={cores.texto} />}
            onPress={() => roteador.back()}
          />
        }
      />

      <Cartao>
        <View style={{ padding: espaco.xl, gap: espaco.lg }}>
          <Text style={{ color: cores.texto, fontSize: fonte.lg, fontWeight: "600" }}>Cliente</Text>

          {editando ? (
            <>
              {clientes.length > 0 ? (
                <View style={{ gap: espaco.sm }}>
                  <Rotulo>Carregar cliente cadastrado</Rotulo>
                  <Seletor
                    testID="select-client"
                    valor={clienteId}
                    onChange={preencherCliente}
                    opcoes={opcoesClientes}
                    placeholder="Manter os dados atuais"
                  />
                </View>
              ) : null}
              <View style={{ flexDirection: ehDesktop ? "row" : "column", gap: espaco.md }}>
                <View style={{ flex: 1, gap: espaco.sm }}>
                  <Rotulo>Nome *</Rotulo>
                  <Campo
                    testID="input-customer"
                    valor={nomeCliente}
                    onChange={setNomeCliente}
                    placeholder="Nome do cliente"
                  />
                </View>
                <View style={{ flex: 1, gap: espaco.sm }}>
                  <Rotulo>Telefone *</Rotulo>
                  <Campo
                    testID="input-customer-contact"
                    valor={telefoneCliente}
                    onChange={setTelefoneCliente}
                    placeholder="(11) 98765-4321"
                    teclado="phone-pad"
                  />
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={{ flexDirection: "row", gap: espaco.sm, flexWrap: "wrap" }}>
                <Botao
                  testID="button-client-existing"
                  titulo="Cliente cadastrado"
                  variante={modoCliente === "existente" ? "primario" : "contorno"}
                  onPress={() => setModoCliente("existente")}
                />
                <Botao
                  testID="button-client-new"
                  titulo="Cadastrar agora"
                  variante={modoCliente === "novo" ? "primario" : "contorno"}
                  onPress={() => setModoCliente("novo")}
                />
              </View>

              {modoCliente === "existente" ? (
                clientes.length === 0 ? (
                  <Text style={{ color: cores.suaveTexto }}>
                    Nenhum cliente cadastrado. Use “Cadastrar agora” para criar o primeiro.
                  </Text>
                ) : (
                  <View style={{ gap: espaco.sm }}>
                    <Rotulo>Cliente *</Rotulo>
                    <Seletor
                      testID="select-client"
                      valor={clienteId}
                      onChange={preencherCliente}
                      opcoes={opcoesClientes}
                      placeholder="Selecione o cliente"
                    />
                  </View>
                )
              ) : (
                <View style={{ flexDirection: ehDesktop ? "row" : "column", gap: espaco.md }}>
                  <View style={{ flex: 1, gap: espaco.sm }}>
                    <Rotulo>Nome *</Rotulo>
                    <Campo
                      testID="input-customer"
                      valor={nomeCliente}
                      onChange={setNomeCliente}
                      placeholder="Nome do cliente"
                    />
                  </View>
                  <View style={{ flex: 1, gap: espaco.sm }}>
                    <Rotulo>Telefone *</Rotulo>
                    <Campo
                      testID="input-customer-contact"
                      valor={telefoneCliente}
                      onChange={setTelefoneCliente}
                      placeholder="(11) 98765-4321"
                      teclado="phone-pad"
                    />
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </Cartao>

      <Cartao>
        <View style={{ padding: espaco.xl, gap: espaco.lg }}>
          <Text style={{ color: cores.texto, fontSize: fonte.lg, fontWeight: "600" }}>Aparelho</Text>

          <View style={{ flexDirection: ehDesktop ? "row" : "column", gap: espaco.md }}>
            <View style={{ flex: 1, gap: espaco.sm }}>
              <Rotulo>Tipo *</Rotulo>
              <Seletor
                testID="select-device-type"
                valor={tipoAparelho}
                onChange={setTipoAparelho}
                opcoes={tiposAparelho.map((item) => ({ valor: item, rotulo: item }))}
              />
            </View>
            <View style={{ flex: 1, gap: espaco.sm }}>
              <Rotulo>Marca *</Rotulo>
              <Seletor
                testID="select-device-brand"
                valor={marca}
                onChange={setMarca}
                opcoes={marcasAparelho.map((item) => ({ valor: item, rotulo: item }))}
              />
            </View>
          </View>

          {marca === "Outra" ? (
            <View style={{ gap: espaco.sm }}>
              <Rotulo>Marca (outra) *</Rotulo>
              <Campo
                testID="input-device-brand-other"
                valor={marcaOutra}
                onChange={setMarcaOutra}
                placeholder="Informe a marca"
              />
            </View>
          ) : null}

          <View style={{ flexDirection: ehDesktop ? "row" : "column", gap: espaco.md }}>
            <View style={{ flex: 1, gap: espaco.sm }}>
              <Rotulo>Modelo *</Rotulo>
              <Campo
                testID="input-device-model"
                valor={modelo}
                onChange={setModelo}
                placeholder="Ex: Galaxy S21"
              />
            </View>
            <View style={{ flex: 1, gap: espaco.sm }}>
              <Rotulo>Estado físico *</Rotulo>
              <Seletor
                testID="select-device-condition"
                valor={estadoAparelho}
                onChange={setEstadoAparelho}
                opcoes={estadosAparelho.map((item) => ({ valor: item, rotulo: item }))}
              />
            </View>
          </View>

          <View style={{ gap: espaco.sm }}>
            <Rotulo>Defeito / Observações *</Rotulo>
            <AreaTexto
              testID="input-issue"
              valor={problema}
              onChange={setProblema}
              placeholder="Descreva o problema relatado..."
            />
          </View>
        </View>
      </Cartao>

      <Cartao>
        <View style={{ padding: espaco.xl, gap: espaco.lg }}>
          <Text style={{ color: cores.texto, fontSize: fonte.lg, fontWeight: "600" }}>Atendimento</Text>

          <View style={{ flexDirection: ehDesktop ? "row" : "column", gap: espaco.md }}>
            <View style={{ flex: 1, gap: espaco.sm }}>
              <Rotulo>Status do conserto</Rotulo>
              <Seletor
                testID="select-status"
                valor={status}
                onChange={setStatus}
                opcoes={statusOrdemServico.map((item) => ({ valor: item, rotulo: item }))}
              />
            </View>
            <View style={{ flex: 1, gap: espaco.sm }}>
              <Rotulo>Prioridade</Rotulo>
              <Seletor
                testID="select-priority"
                valor={prioridade}
                onChange={setPrioridade}
                opcoes={prioridadesOrdemServico.map((item) => ({ valor: item, rotulo: item }))}
              />
            </View>
          </View>

          <View style={{ flexDirection: ehDesktop ? "row" : "column", gap: espaco.md }}>
            <View style={{ flex: 1, gap: espaco.sm }}>
              <Rotulo>Prazo</Rotulo>
              <Campo testID="input-deadline" valor={prazo} onChange={setPrazo} placeholder="AAAA-MM-DD" />
            </View>
            <View style={{ flex: 1, gap: espaco.sm }}>
              <Rotulo>Valor estimado</Rotulo>
              <Campo
                testID="input-value"
                valor={valor}
                onChange={setValor}
                placeholder="0,00"
                teclado="decimal-pad"
              />
            </View>
          </View>

          <View style={{ flexDirection: ehDesktop ? "row" : "column", gap: espaco.md }}>
            <Botao
              testID="button-save-service-order"
              titulo={editando ? "Salvar alterações" : "Salvar Ordem"}
              carregando={salvando}
              onPress={salvar}
            />
            {editando ? (
              <Botao
                testID="button-delete-service-order"
                titulo="Excluir OS"
                variante="perigo"
                onPress={() => setConfirmarExclusao(true)}
              />
            ) : null}
          </View>
        </View>
      </Cartao>

      <Dialogo
        aberto={confirmarExclusao}
        onFechar={() => setConfirmarExclusao(false)}
        titulo="Excluir ordem de serviço?"
        descricao="Essa ação não pode ser desfeita."
        testID="dialog-delete-service-order"
        rodape={
          <>
            <Botao variante="contorno" titulo="Cancelar" onPress={() => setConfirmarExclusao(false)} />
            <Botao
              testID="button-confirm-delete-service-order"
              variante="perigo"
              titulo="Excluir"
              carregando={excluir.isPending}
              onPress={confirmarRemocao}
            />
          </>
        }
      />
    </View>
  );
}
