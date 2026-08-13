import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { CheckCircle, Eye, Plus, Printer, Search, Wrench } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

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
import { OrdemServico, statusOrdemServico } from "../../lib/tipos";
import { abrirWhatsApp } from "../../lib/whatsapp";
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
      await abrirWhatsApp(atualizada.whatsApp);
    } catch (erro) {
      avisar({
        titulo: "Erro ao atualizar ordem",
        descricao: erro instanceof Error ? erro.message : "Não foi possível salvar a alteração.",
        variante: "perigo",
      });
    }
  }

  async function imprimir(ordem: OrdemServico) {
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><title>Ordem de Serviço - ${ordem.numero}</title>
<style>
  body { font-family: Arial, sans-serif; padding: 20px; }
  .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
  .info { margin: 10px 0; }
  .label { font-weight: bold; display: inline-block; width: 160px; }
  .section { margin-top: 20px; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; }
</style></head>
<body>
  <div class="header"><h1>BRINKPDV</h1><h2>ORDEM DE SERVIÇO</h2><h3>${ordem.numero}</h3></div>
  <div class="section">
    <div class="info"><span class="label">Cliente:</span> ${ordem.cliente}</div>
    <div class="info"><span class="label">Contato:</span> ${ordem.contatoCliente || "-"}</div>
    <div class="info"><span class="label">Entrada:</span> ${dataCurta(ordem.data)}</div>
    <div class="info"><span class="label">Prazo:</span> ${dataCurta(ordem.prazo)}</div>
  </div>
  <div class="section">
    <div class="info"><span class="label">Tipo:</span> ${ordem.tipoAparelho || "-"}</div>
    <div class="info"><span class="label">Aparelho:</span> ${ordem.aparelho}</div>
    <div class="info"><span class="label">Estado físico:</span> ${ordem.estadoAparelho || "-"}</div>
    <div class="info"><span class="label">Defeito:</span> ${ordem.problema}</div>
  </div>
  <div class="section">
    <div class="info"><span class="label">Status:</span> ${ordem.status}</div>
    <div class="info"><span class="label">Prioridade:</span> ${ordem.prioridade}</div>
    <div class="info"><span class="label">Valor:</span> ${moeda(ordem.valor)}</div>
    ${ordem.dataSaida ? `<div class="info"><span class="label">Data de Saída:</span> ${dataCurta(ordem.dataSaida)}</div>` : ""}
  </div>
  <div class="footer"><p>_________________________________</p><p>Assinatura do Cliente</p></div>
</body></html>`;

    if (Platform.OS === "web") {
      const janela = window.open("", "_blank");

      if (janela) {
        janela.document.write(html);
        janela.document.close();
        janela.focus();
        janela.print();
      }

      return;
    }

    const { printAsync } = await import("expo-print");
    await printAsync({ html });
  }

  return (
    <View style={{ gap: espaco.xl }}>
      <TituloPagina
        titulo="Ordens de Serviço"
        descricao="Consulta e atualização do conserto"
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
                <Tabela larguraMinima={ehDesktop ? 1000 : 900}>
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
                    <CelulaTabela cabecalho proporcao={1.2} alinhamento="flex-end">
                      Valor
                    </CelulaTabela>
                    <CelulaTabela cabecalho proporcao={1.2}>
                      Prazo
                    </CelulaTabela>
                    <CelulaTabela cabecalho proporcao={1.2}>
                      Saída
                    </CelulaTabela>
                    <CelulaTabela cabecalho proporcao={1.4} alinhamento="flex-end">
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
                      <CelulaTabela proporcao={1.2} alinhamento="flex-end">
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
                      <CelulaTabela proporcao={1.4} alinhamento="flex-end">
                        <View style={{ flexDirection: "row", gap: espaco.xs }}>
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
        descricao="Atualize o estado do conserto — o cliente é avisado no WhatsApp"
        testID="dialog-service-order-details"
        rodape={
          <>
            <Botao variante="contorno" titulo="Fechar" onPress={() => setDialogoDetalhes(false)} />
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
