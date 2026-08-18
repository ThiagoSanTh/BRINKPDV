import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { History, Pencil, Plus, Search, Trash2, Users } from "lucide-react-native";
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
import { chaves } from "../lib/consultas";
import { dataCurta } from "../lib/formato";
import { Cliente, OrdemServico } from "../lib/tipos";
import { useTema } from "../tema/TemaProvider";
import { espaco, fonte, raio } from "../tema/tokens";

export default function TelaClientes() {
  const { cores, ehDesktop } = useTema();
  const { avisar } = useAvisos();
  const roteador = useRouter();
  const clienteConsultas = useQueryClient();

  const [busca, setBusca] = useState("");
  const [dialogo, setDialogo] = useState(false);
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [selecionado, setSelecionado] = useState<Cliente | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const { data: clientes = [], isLoading } = useQuery<Cliente[]>({ queryKey: chaves.clientes });
  const { data: historico = [] } = useQuery<OrdemServico[]>({
    queryKey: selecionado ? chaves.historicoCliente(selecionado.id) : ["historico-vazio"],
    enabled: Boolean(selecionado) && historicoAberto,
  });

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase();
    return clientes.filter(
      (cliente) =>
        cliente.nome.toLowerCase().includes(termo) || cliente.telefone.includes(termo.replace(/\D/g, "")),
    );
  }, [clientes, busca]);

  function invalidar() {
    clienteConsultas.invalidateQueries({ queryKey: chaves.clientes });
  }

  const salvar = useMutation({
    mutationFn: async () => {
      const dados = { nome, telefone, observacoes };
      return selecionado
        ? api.atualizar<Cliente>(`/api/clientes/${selecionado.id}`, dados)
        : api.criar<Cliente>("/api/clientes", dados);
    },
    onSuccess: invalidar,
  });

  const excluir = useMutation({
    mutationFn: (id: string) => api.remover(`/api/clientes/${id}`),
    onSuccess: invalidar,
  });

  function abrirNovo() {
    setSelecionado(null);
    setNome("");
    setTelefone("");
    setObservacoes("");
    setDialogo(true);
  }

  function abrirEdicao(cliente: Cliente) {
    setSelecionado(cliente);
    setNome(cliente.nome);
    setTelefone(cliente.telefone);
    setObservacoes(cliente.observacoes ?? "");
    setDialogo(true);
  }

  async function confirmar() {
    try {
      await salvar.mutateAsync();
      avisar({
        titulo: selecionado ? "Cliente atualizado" : "Cliente cadastrado",
        descricao: `${nome} foi salvo com sucesso.`,
      });
      setDialogo(false);
    } catch (erro) {
      avisar({
        titulo: "Erro ao salvar cliente",
        descricao: erro instanceof Error ? erro.message : "Não foi possível salvar.",
        variante: "perigo",
      });
    }
  }

  return (
    <View style={{ gap: espaco.xl }}>
      <TituloPagina
        titulo="Clientes"
        descricao="Cadastro e histórico da oficina"
        acoes={
          <Botao
            testID="button-new-client"
            titulo="Novo Cliente"
            icone={<Plus size={16} color={cores.primariaTexto} />}
            onPress={abrirNovo}
          />
        }
      />

      <Cartao>
        <View style={{ padding: espaco.xl, gap: espaco.xl }}>
          <Campo
            testID="input-client-search"
            valor={busca}
            onChange={setBusca}
            placeholder="Buscar por nome ou telefone..."
            iconeEsquerda={<Search size={16} color={cores.suaveTexto} />}
          />

          <View style={{ borderWidth: 1, borderColor: cores.borda, borderRadius: raio.medio }}>
            {isLoading ? (
              <View style={{ padding: espaco.xxl, alignItems: "center" }}>
                <Text style={{ color: cores.suaveTexto }}>Carregando clientes...</Text>
              </View>
            ) : (
              <View style={{ paddingHorizontal: espaco.lg }}>
                <Tabela larguraMinima={ehDesktop ? 720 : 640}>
                  <LinhaTabela cabecalho>
                    <CelulaTabela cabecalho proporcao={2}>
                      Nome
                    </CelulaTabela>
                    <CelulaTabela cabecalho proporcao={1.4}>
                      Telefone
                    </CelulaTabela>
                    <CelulaTabela cabecalho proporcao={1.6}>
                      Observações
                    </CelulaTabela>
                    <CelulaTabela cabecalho proporcao={1.6}>
                      Ações
                    </CelulaTabela>
                  </LinhaTabela>

                  {filtrados.map((cliente) => (
                    <LinhaTabela key={cliente.id} testID={`row-client-${cliente.id}`}>
                      <CelulaTabela proporcao={2} estiloTexto={{ fontWeight: "600" }}>
                        {cliente.nome}
                      </CelulaTabela>
                      <CelulaTabela proporcao={1.4}>{cliente.telefone}</CelulaTabela>
                      <CelulaTabela proporcao={1.6}>{cliente.observacoes ?? "—"}</CelulaTabela>
                      <CelulaTabela proporcao={1.6}>
                        <View style={{ flexDirection: "row", gap: espaco.xs, justifyContent: "center" }}>
                          <Botao
                            testID={`button-history-${cliente.id}`}
                            variante="fantasma"
                            tamanho="icone"
                            onPress={() => {
                              setSelecionado(cliente);
                              setHistoricoAberto(true);
                            }}
                            icone={<History size={16} color={cores.texto} />}
                          />
                          <Botao
                            testID={`button-edit-client-${cliente.id}`}
                            variante="fantasma"
                            tamanho="icone"
                            onPress={() => abrirEdicao(cliente)}
                            icone={<Pencil size={16} color={cores.texto} />}
                          />
                          <Botao
                            testID={`button-delete-client-${cliente.id}`}
                            variante="fantasma"
                            tamanho="icone"
                            onPress={() => excluir.mutate(cliente.id)}
                            icone={<Trash2 size={16} color={cores.texto} />}
                          />
                        </View>
                      </CelulaTabela>
                    </LinhaTabela>
                  ))}
                </Tabela>
              </View>
            )}
          </View>

          {!isLoading && filtrados.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: espaco.xxl, gap: espaco.lg }}>
              <Users size={48} color={cores.suaveTexto} />
              <Text style={{ color: cores.suaveTexto }}>Nenhum cliente encontrado</Text>
            </View>
          ) : null}
        </View>
      </Cartao>

      <Dialogo
        aberto={dialogo}
        onFechar={() => setDialogo(false)}
        titulo={selecionado ? "Editar Cliente" : "Novo Cliente"}
        descricao="Nome e telefone com DDD para o WhatsApp da OS"
        testID="dialog-client"
        rodape={
          <>
            <Botao variante="contorno" titulo="Cancelar" onPress={() => setDialogo(false)} />
            <Botao
              testID="button-save-client"
              titulo="Salvar"
              carregando={salvar.isPending}
              onPress={confirmar}
            />
          </>
        }
      >
        <View style={{ gap: espaco.sm }}>
          <Rotulo>Nome *</Rotulo>
          <Campo testID="input-client-name" valor={nome} onChange={setNome} placeholder="Nome do cliente" />
        </View>
        <View style={{ gap: espaco.sm }}>
          <Rotulo>Telefone *</Rotulo>
          <Campo
            testID="input-client-phone"
            valor={telefone}
            onChange={setTelefone}
            placeholder="(11) 98765-4321"
            teclado="phone-pad"
          />
        </View>
        <View style={{ gap: espaco.sm }}>
          <Rotulo>Observações</Rotulo>
          <AreaTexto
            testID="input-client-notes"
            valor={observacoes}
            onChange={setObservacoes}
            placeholder="Preferências, aparelhos frequentes..."
          />
        </View>
      </Dialogo>

      <Dialogo
        aberto={historicoAberto}
        onFechar={() => setHistoricoAberto(false)}
        titulo={selecionado ? `Histórico de ${selecionado.nome}` : "Histórico"}
        descricao="Ordens de serviço deste cliente"
        testID="dialog-client-history"
        rodape={
          <>
            <Botao variante="contorno" titulo="Fechar" onPress={() => setHistoricoAberto(false)} />
            {selecionado ? (
              <Botao
                testID="button-new-os-from-client"
                titulo="Nova OS"
                onPress={() => {
                  setHistoricoAberto(false);
                  roteador.push(`/service-orders/new?clienteId=${selecionado.id}`);
                }}
              />
            ) : null}
          </>
        }
      >
        {historico.length === 0 ? (
          <Text style={{ color: cores.suaveTexto }}>Nenhuma ordem registrada para este cliente.</Text>
        ) : (
          historico.map((ordem) => (
            <View
              key={ordem.id}
              style={{
                borderWidth: 1,
                borderColor: cores.borda,
                borderRadius: raio.medio,
                padding: espaco.md,
                gap: espaco.xs,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: espaco.sm }}>
                <Text style={{ color: cores.texto, fontWeight: "700" }}>{ordem.numero}</Text>
                <Selo texto={ordem.status} variante={ordem.status === "Entregue" ? "sucesso" : "primario"} />
              </View>
              <Text style={{ color: cores.texto, fontSize: fonte.base }}>{ordem.aparelho}</Text>
              <Text style={{ color: cores.suaveTexto, fontSize: fonte.sm }}>{ordem.problema}</Text>
              <Text style={{ color: cores.suaveTexto, fontSize: fonte.sm }}>
                Entrada {dataCurta(ordem.data)}
                {ordem.dataSaida ? ` • Saída ${dataCurta(ordem.dataSaida)}` : ""}
              </Text>
            </View>
          ))
        )}
      </Dialogo>
    </View>
  );
}
