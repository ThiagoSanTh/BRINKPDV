import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { CheckCircle, Eye, Pencil, Plus, Printer, Search, Share2, Wrench } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useAvisos } from "../../componentes/ui/Avisos";
import { Botao } from "../../componentes/ui/Botao";
import { Campo, Rotulo } from "../../componentes/ui/Campo";
import { Cartao } from "../../componentes/ui/Cartao";
import { Dialogo } from "../../componentes/ui/Dialogo";
import { Grade } from "../../componentes/ui/Grade";
import { Selo, VarianteSelo } from "../../componentes/ui/Selo";
import { Seletor } from "../../componentes/ui/Seletor";
import { CelulaTabela, LinhaTabela, Tabela } from "../../componentes/ui/Tabela";
import { TituloPagina } from "../../componentes/ui/TituloPagina";
import { api } from "../../lib/api";
import { chaves } from "../../lib/consultas";
import { dataCurta, moeda } from "../../lib/formato";
import { colunas, useLarguraConteudo } from "../../lib/layout";
import { imprimirNotaOs } from "../../lib/nota-os";
import { ConfiguracaoLoja, OrdemServico, statusOrdemServico } from "../../lib/tipos";
import { compartilharOsWhatsApp } from "../../lib/whatsapp";
import { useTema } from "../../tema/TemaProvider";
import { espaco, fonte, raio } from "../../tema/tokens";

const variantesStatus: Record<string, VarianteSelo> = {
  Orçamento: "contorno",
  "Aguardando aprovação": "suave",
  "Em Andamento": "primario",
  "Aguardando peça": "suave",
  "Pronto para retirada": "primario",
  Entregue: "sucesso",
  Cancelada: "perigo",
};

const variantesPrioridade: Record<string, VarianteSelo> = {
  Baixa: "suave",
  Média: "primario",
  Alta: "perigo",
};

function estaEncerrada(status: string) {
  return status === "Entregue" || status === "Cancelada" || status === "Concluída";
}

function payloadOrdem(ordem: OrdemServico, extras: Record<string, unknown> = {}) {
  return {
    clienteId: ordem.clienteId,
    cliente: ordem.cliente,
    contatoCliente: ordem.contatoCliente,
    tipoAparelho: ordem.tipoAparelho,
    marca: ordem.marca,
    modelo: ordem.modelo,
    aparelho: ordem.aparelho,
    estadoAparelho: ordem.estadoAparelho,
    problema: ordem.problema,
    status: ordem.status,
    prioridade: ordem.prioridade,
    valor: ordem.valor,
    prazo: ordem.prazo,
    dataSaida: ordem.dataSaida,
    ...extras,
  };
}

export default function TelaOrdensServico() {
  const { cores, ehDesktop } = useTema();
  const largura = useLarguraConteudo();
  const { avisar } = useAvisos();
  const roteador = useRouter();
  const clienteConsultas = useQueryClient();

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string | null>(null);
  const [dialogoDetalhes, setDialogoDetalhes] = useState(false);
  const [selecionada, setSelecionada] = useState<OrdemServico | null>(null);
  const [statusEdicao, setStatusEdicao] = useState<string>("Orçamento");

  const { data: ordens = [], isLoading } = useQuery<OrdemServico[]>({ queryKey: chaves.ordensServico });
  const { data: configuracao } = useQuery<ConfiguracaoLoja>({ queryKey: chaves.configuracaoLoja });

  function invalidar() {
    clienteConsultas.invalidateQueries({ queryKey: chaves.ordensServico });
    clienteConsultas.invalidateQueries({ queryKey: chaves.clientes });
  }

  const atualizar = useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: unknown }) =>
      api.atualizar<OrdemServico>(`/api/ordens-servico/${id}`, dados),
    onSuccess: invalidar,
  });

  const filtradas = useMemo(
    () =>
      ordens.filter((ordem) => {
        const termo = busca.toLowerCase();
        const casaBusca =
          ordem.numero.toLowerCase().includes(termo) ||
          ordem.cliente.toLowerCase().includes(termo) ||
          ordem.aparelho.toLowerCase().includes(termo) ||
          (ordem.marca ?? "").toLowerCase().includes(termo) ||
          (ordem.modelo ?? "").toLowerCase().includes(termo) ||
          (ordem.tipoAparelho ?? "").toLowerCase().includes(termo) ||
          ordem.problema.toLowerCase().includes(termo);

        return casaBusca && (filtroStatus ? ordem.status === filtroStatus : true);
      }),
    [ordens, busca, filtroStatus],
  );

  const receita = ordens.reduce((soma, ordem) => soma + ordem.valor, 0);
  const entregues = ordens.filter((ordem) => ordem.status === "Entregue" || ordem.status === "Concluída");

  async function persistirStatus(ordem: OrdemServico, status: string) {
    try {
      const atualizada = await atualizar.mutateAsync({
        id: ordem.id,
        dados: payloadOrdem(ordem, {
          status,
          dataSaida: status === "Entregue" ? ordem.dataSaida ?? new Date().toISOString().slice(0, 10) : ordem.dataSaida,
        }),
      });

      setSelecionada(atualizada);
      setStatusEdicao(atualizada.status);
      avisar({ titulo: "Ordem atualizada", descricao: "O status do conserto foi salvo." });
    } catch (erro) {
      avisar({
        titulo: "Erro ao atualizar ordem",
        descricao: erro instanceof Error ? erro.message : "Não foi possível salvar a alteração.",
        variante: "perigo",
      });
    }
  }

  async function imprimir(ordem: OrdemServico) {
    const impresso = await imprimirNotaOs(ordem, configuracao);

    if (!impresso) {
      avisar({
        titulo: "Impressão bloqueada",
        descricao: "O navegador impediu a janela de impressão. Autorize pop-ups e tente de novo.",
        variante: "perigo",
      });
    }
  }

  async function compartilhar(ordem: OrdemServico) {
    try {
      await compartilharOsWhatsApp(ordem);
    } catch (erro) {
      avisar({
        titulo: "Não foi possível abrir o WhatsApp",
        descricao: erro instanceof Error ? erro.message : "Verifique o telefone do cliente.",
        variante: "perigo",
      });
    }
  }

  return (
    <View style={{ gap: espaco.xl }}>
      <TituloPagina
        titulo="Ordens de Serviço"
        descricao="Consulta, edição e compartilhamento da OS"
        acoes={
          <Botao
            testID="button-new-service-order"
            titulo="Nova Ordem"
            icone={<Plus size={16} color={cores.primariaTexto} />}
            onPress={() => roteador.push("/service-orders/new")}
          />
        }
      />

      <Grade colunas={colunas(largura, 240, 4)} largura={largura}>
        {[
          <Pressable key="total" testID="card-total-orders" onPress={() => setFiltroStatus(null)}>
            <CartaoResumo
              titulo={`Total ${filtroStatus === null ? "✓" : ""}`}
              valor={String(ordens.length)}
            />
          </Pressable>,
          <Pressable
            key="andamento"
            testID="card-in-progress-orders"
            onPress={() => setFiltroStatus("Em Andamento")}
          >
            <CartaoResumo
              titulo={`Em Andamento ${filtroStatus === "Em Andamento" ? "✓" : ""}`}
              valor={String(ordens.filter((ordem) => ordem.status === "Em Andamento").length)}
              cor={cores.primaria}
            />
          </Pressable>,
          <Pressable
            key="entregues"
            testID="card-completed-orders"
            onPress={() => setFiltroStatus("Entregue")}
          >
            <CartaoResumo
              titulo={`Entregues ${filtroStatus === "Entregue" ? "✓" : ""}`}
              valor={String(entregues.length)}
              cor={cores.grafico2}
            />
          </Pressable>,
          <CartaoResumo key="receita" titulo="Receita" valor={moeda(receita)} />,
        ]}
      </Grade>

      <Cartao>
        <View style={{ padding: espaco.xl, gap: espaco.xl }}>
          <View style={{ flexDirection: ehDesktop ? "row" : "column", gap: espaco.md }}>
            <View style={{ flex: 2 }}>
              <Campo
                testID="input-service-order-search"
                valor={busca}
                onChange={setBusca}
                placeholder="Buscar por OS, cliente, marca, modelo ou defeito..."
                iconeEsquerda={<Search size={16} color={cores.suaveTexto} />}
              />
            </View>
            <View style={{ flex: 1, minWidth: 180 }}>
              <Seletor
                testID="select-status-filter"
                valor={filtroStatus ?? "__todos__"}
                onChange={(valor) => setFiltroStatus(valor === "__todos__" ? null : valor)}
                placeholder="Todos os status"
                opcoes={[
                  { valor: "__todos__", rotulo: "Todos os status" },
                  ...statusOrdemServico.map((item) => ({ valor: item, rotulo: item })),
                ]}
              />
            </View>
          </View>

          <View style={{ borderWidth: 1, borderColor: cores.borda, borderRadius: raio.medio }}>
            {isLoading ? (
              <View style={{ padding: espaco.xxl, alignItems: "center" }}>
                <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>
                  Carregando ordens de serviço...
                </Text>
              </View>
            ) : (
              <View style={{ paddingHorizontal: espaco.lg }}>
                <Tabela larguraMinima={ehDesktop ? 1180 : 1040}>
                  <LinhaTabela cabecalho>
                    <CelulaTabela cabecalho proporcao={1.2}>
                      OS
                    </CelulaTabela>
                    <CelulaTabela cabecalho proporcao={1.8}>
                      Cliente
                    </CelulaTabela>
                    <CelulaTabela cabecalho proporcao={1.8}>
                      Aparelho
                    </CelulaTabela>
                    <CelulaTabela cabecalho proporcao={2}>
                      Defeito
                    </CelulaTabela>
                    <CelulaTabela cabecalho proporcao={1.6}>
                      Status
                    </CelulaTabela>
                    <CelulaTabela cabecalho proporcao={1.2}>
                      Prioridade
                    </CelulaTabela>
                    <CelulaTabela cabecalho proporcao={1.2}>
                      Valor
                    </CelulaTabela>
                    <CelulaTabela cabecalho proporcao={1.2}>
                      Prazo
                    </CelulaTabela>
                    <CelulaTabela cabecalho proporcao={1.2}>
                      Saída
                    </CelulaTabela>
                    <CelulaTabela cabecalho proporcao={2}>
                      Ações
                    </CelulaTabela>
                  </LinhaTabela>

                  {filtradas.map((ordem) => (
                    <LinhaTabela key={ordem.id} testID={`row-service-order-${ordem.id}`}>
                      <CelulaTabela proporcao={1.2} estiloTexto={{ fontWeight: "600" }}>
                        {ordem.numero}
                      </CelulaTabela>
                      <CelulaTabela proporcao={1.8} estiloTexto={{ fontWeight: "500" }}>
                        {ordem.cliente}
                      </CelulaTabela>
                      <CelulaTabela proporcao={1.8}>{ordem.aparelho}</CelulaTabela>
                      <CelulaTabela proporcao={2}>{ordem.problema}</CelulaTabela>
                      <CelulaTabela proporcao={1.6}>
                        <Selo texto={ordem.status} variante={variantesStatus[ordem.status] ?? "contorno"} />
                      </CelulaTabela>
                      <CelulaTabela proporcao={1.2}>
                        <Selo
                          texto={ordem.prioridade}
                          variante={variantesPrioridade[ordem.prioridade] ?? "primario"}
                        />
                      </CelulaTabela>
                      <CelulaTabela proporcao={1.2}>
                        {moeda(ordem.valor)}
                      </CelulaTabela>
                      <CelulaTabela proporcao={1.2}>{dataCurta(ordem.prazo)}</CelulaTabela>
                      <CelulaTabela proporcao={1.2}>
                        {ordem.dataSaida ? (
                          <Text style={{ color: cores.grafico2, fontSize: fonte.base, fontWeight: "500" }}>
                            {dataCurta(ordem.dataSaida)}
                          </Text>
                        ) : (
                          <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>—</Text>
                        )}
                      </CelulaTabela>
                      <CelulaTabela proporcao={2}>
                        <View style={{ flexDirection: "row", gap: espaco.xs, flexWrap: "wrap", justifyContent: "center" }}>
                          <Botao
                            testID={`button-view-${ordem.id}`}
                            variante="fantasma"
                            tamanho="icone"
                            onPress={() => {
                              setSelecionada(ordem);
                              setStatusEdicao(ordem.status);
                              setDialogoDetalhes(true);
                            }}
                            icone={<Eye size={16} color={cores.texto} />}
                          />
                          <Botao
                            testID={`button-edit-${ordem.id}`}
                            variante="fantasma"
                            tamanho="icone"
                            onPress={() => roteador.push(`/service-orders/new?id=${ordem.id}`)}
                            icone={<Pencil size={16} color={cores.texto} />}
                          />
                          <Botao
                            testID={`button-share-${ordem.id}`}
                            variante="fantasma"
                            tamanho="icone"
                            onPress={() => compartilhar(ordem)}
                            icone={<Share2 size={16} color={cores.texto} />}
                          />
                          {!estaEncerrada(ordem.status) ? (
                            <Botao
                              testID={`button-complete-${ordem.id}`}
                              variante="fantasma"
                              tamanho="icone"
                              onPress={() => persistirStatus(ordem, "Entregue")}
                              icone={<CheckCircle size={16} color={cores.texto} />}
                            />
                          ) : null}
                          <Botao
                            testID={`button-print-${ordem.id}`}
                            variante="fantasma"
                            tamanho="icone"
                            onPress={() => imprimir(ordem)}
                            icone={<Printer size={16} color={cores.texto} />}
                          />
                        </View>
                      </CelulaTabela>
                    </LinhaTabela>
                  ))}
                </Tabela>
              </View>
            )}
          </View>

          {!isLoading && filtradas.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: espaco.xxl, gap: espaco.lg }}>
              <Wrench size={48} color={cores.suaveTexto} />
              <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>
                Nenhuma ordem de serviço encontrada
              </Text>
            </View>
          ) : null}
        </View>
      </Cartao>

      <Dialogo
        aberto={dialogoDetalhes}
        onFechar={() => setDialogoDetalhes(false)}
        titulo="Detalhes da Ordem de Serviço"
        descricao="Atualize o estado do conserto. Use Compartilhar para abrir o WhatsApp com a mensagem pronta."
        testID="dialog-service-order-details"
        rodape={
          <>
            <Botao variante="contorno" titulo="Fechar" onPress={() => setDialogoDetalhes(false)} />
            {selecionada ? (
              <Botao
                testID="button-edit-details"
                variante="contorno"
                titulo="Editar"
                icone={<Pencil size={16} color={cores.texto} />}
                onPress={() => {
                  setDialogoDetalhes(false);
                  roteador.push(`/service-orders/new?id=${selecionada.id}`);
                }}
              />
            ) : null}
            {selecionada ? (
              <Botao
                testID="button-share-details"
                variante="contorno"
                titulo="Compartilhar"
                icone={<Share2 size={16} color={cores.texto} />}
                onPress={() => compartilhar(selecionada)}
              />
            ) : null}
            {selecionada ? (
              <Botao
                testID="button-update-order-status"
                titulo="Salvar status"
                carregando={atualizar.isPending}
                onPress={() => persistirStatus(selecionada, statusEdicao)}
              />
            ) : null}
            <Botao
              testID="button-print-details"
              titulo="Imprimir"
              icone={<Printer size={16} color={cores.primariaTexto} />}
              onPress={() => selecionada && imprimir(selecionada)}
            />
          </>
        }
      >
        {selecionada ? (
          <>
            <View style={{ flexDirection: "row", gap: espaco.lg }}>
              <Detalhe titulo="Número da OS" valor={selecionada.numero} />
              <View style={{ flex: 1, gap: espaco.xs }}>
                <Rotulo>Status do conserto</Rotulo>
                <Seletor
                  testID="select-status"
                  valor={statusEdicao}
                  onChange={setStatusEdicao}
                  opcoes={statusOrdemServico.map((item) => ({ valor: item, rotulo: item }))}
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: espaco.lg }}>
              <Detalhe titulo="Cliente" valor={selecionada.cliente} />
              <Detalhe titulo="Contato" valor={selecionada.contatoCliente || "-"} />
            </View>

            <View style={{ flexDirection: "row", gap: espaco.lg }}>
              <Detalhe titulo="Tipo" valor={selecionada.tipoAparelho || "-"} />
              <Detalhe titulo="Aparelho" valor={selecionada.aparelho} />
            </View>

            <View style={{ flexDirection: "row", gap: espaco.lg }}>
              <Detalhe titulo="Estado físico" valor={selecionada.estadoAparelho || "-"} />
              <View style={{ flex: 1, gap: espaco.xs }}>
                <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>Prioridade</Text>
                <Selo
                  texto={selecionada.prioridade}
                  variante={variantesPrioridade[selecionada.prioridade] ?? "primario"}
                />
              </View>
            </View>

            <Detalhe titulo="Defeito / Observações" valor={selecionada.problema} />

            <View style={{ flexDirection: ehDesktop ? "row" : "column", gap: espaco.lg }}>
              <Detalhe titulo="Data de Entrada" valor={dataCurta(selecionada.data)} />
              <Detalhe titulo="Prazo" valor={dataCurta(selecionada.prazo)} />
              <Detalhe
                titulo="Data de Saída"
                valor={selecionada.dataSaida ? dataCurta(selecionada.dataSaida) : "—"}
              />
              <Detalhe titulo="Valor" valor={moeda(selecionada.valor)} destaque />
            </View>
          </>
        ) : null}
      </Dialogo>
    </View>
  );
}

function Detalhe({ titulo, valor, destaque }: { titulo: string; valor: string; destaque?: boolean }) {
  const { cores } = useTema();

  return (
    <View style={{ flex: 1, gap: espaco.xs }}>
      <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>{titulo}</Text>
      <Text
        style={{
          color: destaque ? cores.primaria : cores.texto,
          fontSize: fonte.base,
          fontWeight: destaque ? "700" : "500",
        }}
      >
        {valor}
      </Text>
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
