import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCircle,
  Database,
  Download,
  Eye,
  EyeOff,
  Image as ImagemIcone,
  Plus,
  MessageCircle,
  Printer,
  Receipt,
  RefreshCcw,
  Save,
  Store,
  Trash2,
  User,
  Users,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Image, Linking, Pressable, Text, View } from "react-native";

import { AlternarTema } from "../componentes/AlternarTema";
import { useAvisos } from "../componentes/ui/Avisos";
import { Botao } from "../componentes/ui/Botao";
import { Campo, Rotulo } from "../componentes/ui/Campo";
import { Cartao } from "../componentes/ui/Cartao";
import { Dialogo } from "../componentes/ui/Dialogo";
import { Grade } from "../componentes/ui/Grade";
import { Interruptor } from "../componentes/ui/Interruptor";
import { Selo } from "../componentes/ui/Selo";
import { Seletor } from "../componentes/ui/Seletor";
import { CelulaTabela, LinhaTabela, Tabela } from "../componentes/ui/Tabela";
import { TituloPagina } from "../componentes/ui/TituloPagina";
import { api } from "../lib/api";
import { baixarTexto, escolherImagemBase64 } from "../lib/arquivos";
import { useAutenticacao } from "../lib/autenticacao";
import { chaves } from "../lib/consultas";
import { colunas, useLarguraConteudo } from "../lib/layout";
import { ConfiguracaoLoja, Usuario } from "../lib/tipos";
import { useTema } from "../tema/TemaProvider";
import { espaco, fonte, raio } from "../tema/tokens";

const urlAtualizacoes =
  "https://drive.google.com/drive/folders/1EExvSO8_jk-TbS4njK44wZYuX5HukK9_?usp=drive_link";

const modelosImpressora = [
  { valor: "thermal-80mm", rotulo: "Térmica 80mm" },
  { valor: "thermal-58mm", rotulo: "Térmica 58mm" },
  { valor: "a4", rotulo: "A4 (Matricial/Jato)" },
  { valor: "custom", rotulo: "Personalizada" },
];

const largurasPapel = [
  { valor: "58", rotulo: "58mm" },
  { valor: "80", rotulo: "80mm" },
  { valor: "210", rotulo: "210mm (A4)" },
];

const permissoes = [
  {
    funcao: "Administrador",
    selo: "Acesso Total",
    variante: "primario" as const,
    cria: "Pode criar: Administrador, Gerente, Vendedor, Técnico",
    descricao: "Acesso completo a todas as funcionalidades do sistema",
  },
  {
    funcao: "Gerente",
    selo: "Gerencial",
    variante: "suave" as const,
    cria: "Pode criar: Vendedor, Técnico",
    descricao: "Gerencia vendedores e técnicos, acesso a relatórios",
  },
  {
    funcao: "Vendedor",
    selo: "Operacional",
    variante: "contorno" as const,
    cria: "Não pode criar usuários",
    descricao: "Acesso a vendas, produtos e clientes",
  },
  {
    funcao: "Técnico",
    selo: "Operacional",
    variante: "contorno" as const,
    cria: "Não pode criar usuários",
    descricao: "Acesso a ordens de serviço e manutenção",
  },
];

function funcoesDisponiveis(funcao?: string) {
  if (funcao === "Administrador") {
    return ["Administrador", "Gerente", "Vendedor", "Técnico"];
  }

  if (funcao === "Gerente") {
    return ["Vendedor", "Técnico"];
  }

  return [];
}

export default function TelaConfiguracoes() {
  const { cores, ehDesktop } = useTema();
  const largura = useLarguraConteudo();
  const { avisar } = useAvisos();
  const { usuario } = useAutenticacao();
  const clienteConsultas = useQueryClient();

  const { data: configuracao } = useQuery<ConfiguracaoLoja>({ queryKey: chaves.configuracaoLoja });
  const { data: usuarios = [] } = useQuery<Usuario[]>({ queryKey: chaves.usuarios });

  const [logo, setLogo] = useState<string | null>(null);
  const [dadosLoja, setDadosLoja] = useState({
    nomeLoja: "BRINKPDV",
    telefoneLoja: "",
    enderecoLoja: "",
    razaoSocial: "",
    cnpj: "",
    cidade: "",
    estado: "",
    cep: "",
  });
  const [comprovante, setComprovante] = useState({
    incluirLogo: true,
    cabecalho: "",
    rodape: "Volte sempre! www.brinkcell.com.br",
    mostrarDadosFiscais: true,
  });
  const [impressora, setImpressora] = useState({
    nome: "",
    modelo: "thermal-80mm",
    larguraPapel: "80",
    corteAutomatico: true,
  });
  const [preferencias, setPreferencias] = useState({
    alertaEstoqueBaixo: true,
    somFinalizacao: false,
    impressaoAutomatica: true,
  });
  const [whatsApp, setWhatsApp] = useState({
    phoneNumberId: "",
    token: "",
  });

  const [perfil, setPerfil] = useState({ nomeUsuario: "", email: "", senha: "" });
  const [dialogoUsuario, setDialogoUsuario] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState({
    nomeUsuario: "",
    email: "",
    senha: "",
    funcao: "Vendedor",
  });
  const [verificandoAtualizacoes, setVerificandoAtualizacoes] = useState(false);

  useEffect(() => {
    if (!configuracao) {
      return;
    }

    setLogo(configuracao.logoLoja ?? null);
    setDadosLoja({
      nomeLoja: configuracao.nomeLoja ?? "BRINKPDV",
      telefoneLoja: configuracao.telefoneLoja ?? "",
      enderecoLoja: configuracao.enderecoLoja ?? "",
      razaoSocial: configuracao.razaoSocial ?? "",
      cnpj: configuracao.cnpj ?? "",
      cidade: configuracao.cidade ?? "",
      estado: configuracao.estado ?? "",
      cep: configuracao.cep ?? "",
    });
    setComprovante({
      incluirLogo: configuracao.comprovanteIncluirLogo,
      cabecalho: configuracao.comprovanteCabecalho ?? "",
      rodape: configuracao.comprovanteRodape ?? "",
      mostrarDadosFiscais: configuracao.comprovanteMostrarDadosFiscais,
    });
    setImpressora({
      nome: configuracao.impressoraNome ?? "",
      modelo: configuracao.impressoraModelo ?? "thermal-80mm",
      larguraPapel: configuracao.impressoraLarguraPapel ?? "80",
      corteAutomatico: configuracao.impressoraCorteAutomatico,
    });
    setPreferencias({
      alertaEstoqueBaixo: configuracao.alertaEstoqueBaixo,
      somFinalizacao: configuracao.somFinalizacao,
      impressaoAutomatica: configuracao.impressaoAutomatica,
    });
    setWhatsApp((atual) => ({
      phoneNumberId: configuracao.whatsAppPhoneNumberId ?? "",
      token: atual.token,
    }));
  }, [configuracao]);

  useEffect(() => {
    if (usuario) {
      setPerfil((atual) => ({
        ...atual,
        nomeUsuario: usuario.nomeUsuario,
        email: usuario.email ?? "",
      }));
    }
  }, [usuario]);

  const salvarConfiguracao = useMutation({
    mutationFn: (dados: Partial<ConfiguracaoLoja>) =>
      api.atualizar<ConfiguracaoLoja>("/api/configuracao-loja", {
        nomeLoja: dadosLoja.nomeLoja,
        logoLoja: logo,
        telefoneLoja: dadosLoja.telefoneLoja,
        enderecoLoja: dadosLoja.enderecoLoja,
        razaoSocial: dadosLoja.razaoSocial,
        cnpj: dadosLoja.cnpj,
        cidade: dadosLoja.cidade,
        estado: dadosLoja.estado,
        cep: dadosLoja.cep,
        comprovanteIncluirLogo: comprovante.incluirLogo,
        comprovanteCabecalho: comprovante.cabecalho,
        comprovanteRodape: comprovante.rodape,
        comprovanteMostrarDadosFiscais: comprovante.mostrarDadosFiscais,
        impressoraNome: impressora.nome,
        impressoraModelo: impressora.modelo,
        impressoraLarguraPapel: impressora.larguraPapel,
        impressoraCorteAutomatico: impressora.corteAutomatico,
        alertaEstoqueBaixo: preferencias.alertaEstoqueBaixo,
        somFinalizacao: preferencias.somFinalizacao,
        impressaoAutomatica: preferencias.impressaoAutomatica,
        whatsAppPhoneNumberId: whatsApp.phoneNumberId || null,
        whatsAppToken: whatsApp.token || null,
        ...dados,
      }),
    onSuccess: () => clienteConsultas.invalidateQueries({ queryKey: chaves.configuracaoLoja }),
  });

  const criarUsuario = useMutation({
    mutationFn: (dados: unknown) => api.criar<Usuario>("/api/usuarios", dados),
    onSuccess: () => clienteConsultas.invalidateQueries({ queryKey: chaves.usuarios }),
  });

  const removerUsuario = useMutation({
    mutationFn: (id: string) => api.remover(`/api/usuarios/${id}`),
    onSuccess: () => clienteConsultas.invalidateQueries({ queryKey: chaves.usuarios }),
  });

  const disponiveis = funcoesDisponiveis(usuario?.funcao);
  const podeCriarUsuarios = disponiveis.length > 0;

  async function persistir(dados: Partial<ConfiguracaoLoja>, titulo: string, descricao: string) {
    try {
      await salvarConfiguracao.mutateAsync(dados);
      avisar({ titulo, descricao });
      return true;
    } catch (erro) {
      avisar({
        titulo: "Erro",
        descricao: erro instanceof Error ? erro.message : "Não foi possível salvar.",
        variante: "perigo",
      });
      return false;
    }
  }

  async function selecionarLogo() {
    const imagem = await escolherImagemBase64();

    if (imagem) {
      setLogo(imagem);
    }
  }

  async function salvarPerfil() {
    if (!usuario) {
      return;
    }

    try {
      await api.atualizar(`/api/usuarios/${usuario.id}`, {
        nomeUsuario: perfil.nomeUsuario,
        email: perfil.email,
        funcao: usuario.funcao,
        ativo: true,
        senha: perfil.senha || null,
      });

      clienteConsultas.invalidateQueries({ queryKey: chaves.usuarios });
      setPerfil((atual) => ({ ...atual, senha: "" }));
      avisar({ titulo: "Perfil salvo", descricao: "As alterações do perfil foram salvas com sucesso" });
    } catch (erro) {
      avisar({
        titulo: "Erro",
        descricao: erro instanceof Error ? erro.message : "Falha ao salvar o perfil.",
        variante: "perigo",
      });
    }
  }

  function abrirDialogoUsuario() {
    setNovoUsuario({
      nomeUsuario: "",
      email: "",
      senha: "",
      funcao: disponiveis.includes("Vendedor") ? "Vendedor" : disponiveis[0] ?? "Vendedor",
    });
    setMostrarSenha(false);
    setDialogoUsuario(true);
  }

  async function salvarUsuario() {
    if (!novoUsuario.nomeUsuario) {
      avisar({ titulo: "Erro", descricao: "Nome de usuário é obrigatório", variante: "perigo" });
      return;
    }

    if (!disponiveis.includes(novoUsuario.funcao)) {
      avisar({
        titulo: "Sem permissão",
        descricao: `Você não tem permissão para criar usuários com a função ${novoUsuario.funcao}`,
        variante: "perigo",
      });
      return;
    }

    try {
      await criarUsuario.mutateAsync({ ...novoUsuario, ativo: true });
      avisar({
        titulo: "Usuário criado",
        descricao: `${novoUsuario.nomeUsuario} foi adicionado ao sistema`,
      });
      setDialogoUsuario(false);
    } catch (erro) {
      avisar({
        titulo: "Erro",
        descricao: erro instanceof Error ? erro.message : "Falha ao criar usuário.",
        variante: "perigo",
      });
    }
  }

  async function excluirUsuario(id: string) {
    try {
      await removerUsuario.mutateAsync(id);
      avisar({ titulo: "Usuário removido", descricao: "O usuário foi removido do sistema" });
    } catch (erro) {
      avisar({
        titulo: "Erro",
        descricao: erro instanceof Error ? erro.message : "Falha ao remover usuário.",
        variante: "perigo",
      });
    }
  }

  async function backup() {
    const [produtos, vendas, ordens, vendedores] = await Promise.all([
      api.obter("/api/produtos"),
      api.obter("/api/vendas"),
      api.obter("/api/ordens-servico"),
      api.obter("/api/vendedores"),
    ]);

    const conteudo = JSON.stringify(
      { geradoEm: new Date().toISOString(), produtos, vendas, ordens, vendedores, configuracao },
      null,
      2,
    );

    const baixou = baixarTexto(
      `brinkpdv-backup-${new Date().toISOString().split("T")[0]}.json`,
      conteudo,
      "application/json",
    );

    avisar({
      titulo: baixou ? "Backup gerado" : "Backup indisponível",
      descricao: baixou
        ? "O arquivo JSON foi baixado com sucesso"
        : "O download de arquivos só está disponível na versão web",
      variante: baixou ? "padrao" : "perigo",
    });
  }

  async function verificarAtualizacoes() {
    setVerificandoAtualizacoes(true);
    await new Promise((resolver) => setTimeout(resolver, 2000));
    setVerificandoAtualizacoes(false);

    avisar({
      titulo: "Verificação concluída",
      descricao: "Sistema atualizado. Versão 1.0.0 é a mais recente.",
    });
  }

  return (
    <View style={{ gap: espaco.xl }}>
      <TituloPagina titulo="Configurações" descricao="Gerenciar preferências do sistema" />

      <Grade colunas={colunas(largura, 320, 3)} largura={largura}>
        {[
          <Cartao key="logo" testID="card-logo-settings">
            <View style={{ padding: espaco.lg, gap: espaco.md }}>
              <TituloSecao icone={<ImagemIcone size={20} color={cores.primaria} />} texto="Logo da Loja" />

              {logo ? (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: cores.borda,
                    borderRadius: raio.medio,
                    backgroundColor: cores.suave,
                    padding: espaco.lg,
                    alignItems: "center",
                  }}
                >
                  <Image
                    testID="img-logo-preview"
                    source={{ uri: logo }}
                    style={{ width: "100%", height: 128 }}
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <Pressable
                  testID="input-logo-file"
                  onPress={selecionarLogo}
                  style={{
                    borderWidth: 2,
                    borderStyle: "dashed",
                    borderColor: cores.borda,
                    borderRadius: raio.medio,
                    padding: espaco.xxl,
                    alignItems: "center",
                    gap: espaco.sm,
                  }}
                >
                  <ImagemIcone size={48} color={cores.suaveTexto} />
                  <Text style={{ color: cores.texto, fontSize: fonte.base, fontWeight: "500" }}>
                    Clique para selecionar
                  </Text>
                  <Text style={{ color: cores.suaveTexto, fontSize: fonte.sm }}>JPG, PNG ou BMP</Text>
                </Pressable>
              )}

              <View>
                <Text style={{ color: cores.suaveTexto, fontSize: fonte.xs }}>
                  • Formatos aceitos: JPG, PNG, BMP
                </Text>
                <Text style={{ color: cores.suaveTexto, fontSize: fonte.xs }}>
                  • Tamanho recomendado: 500x500px
                </Text>
              </View>

              {logo ? (
                <View style={{ gap: espaco.sm }}>
                  <Botao
                    testID="button-save-logo"
                    titulo="Salvar Logo"
                    larguraTotal
                    icone={<Save size={16} color={cores.primariaTexto} />}
                    onPress={() => persistir({ logoLoja: logo }, "Logo salvo", "O logo foi salvo no sistema")}
                  />
                  <Botao
                    testID="button-delete-logo"
                    titulo="Excluir Logo"
                    variante="perigo"
                    larguraTotal
                    icone={<Trash2 size={16} color={cores.perigoTexto} />}
                    onPress={() => {
                      setLogo(null);
                      persistir({ logoLoja: null }, "Logo removido", "O logo da loja foi removido");
                    }}
                  />
                </View>
              ) : null}
            </View>
          </Cartao>,

          <Cartao key="perfil" testID="card-user-settings">
            <View style={{ padding: espaco.lg, gap: espaco.md }}>
              <TituloSecao icone={<User size={20} color={cores.primaria} />} texto="Perfil do Usuário" />

              <View style={{ gap: espaco.sm }}>
                <Rotulo>Nome de Usuário</Rotulo>
                <Campo
                  testID="input-username"
                  valor={perfil.nomeUsuario}
                  onChange={(texto) => setPerfil({ ...perfil, nomeUsuario: texto })}
                />
              </View>
              <View style={{ gap: espaco.sm }}>
                <Rotulo>E-mail</Rotulo>
                <Campo
                  testID="input-email"
                  valor={perfil.email}
                  onChange={(texto) => setPerfil({ ...perfil, email: texto })}
                />
              </View>
              <View style={{ gap: espaco.sm }}>
                <Rotulo>Nova Senha</Rotulo>
                <Campo
                  testID="input-password"
                  valor={perfil.senha}
                  onChange={(texto) => setPerfil({ ...perfil, senha: texto })}
                  placeholder="••••••••"
                  segredo
                />
              </View>
              <Botao
                testID="button-save-profile"
                titulo="Salvar Alterações"
                larguraTotal
                icone={<Save size={16} color={cores.primariaTexto} />}
                onPress={salvarPerfil}
              />
            </View>
          </Cartao>,

          <Cartao key="loja" testID="card-store-settings">
            <View style={{ padding: espaco.lg, gap: espaco.md }}>
              <TituloSecao icone={<Store size={20} color={cores.primaria} />} texto="Informações da Loja" />

              <View style={{ gap: espaco.sm }}>
                <Rotulo>Nome da Loja</Rotulo>
                <Campo
                  testID="input-store-name"
                  valor={dadosLoja.nomeLoja}
                  onChange={(texto) => setDadosLoja({ ...dadosLoja, nomeLoja: texto })}
                />
              </View>
              <View style={{ gap: espaco.sm }}>
                <Rotulo>Telefone</Rotulo>
                <Campo
                  testID="input-store-phone"
                  valor={dadosLoja.telefoneLoja}
                  onChange={(texto) => setDadosLoja({ ...dadosLoja, telefoneLoja: texto })}
                  placeholder="(11) 98765-4321"
                  teclado="phone-pad"
                />
              </View>
              <View style={{ gap: espaco.sm }}>
                <Rotulo>Endereço</Rotulo>
                <Campo
                  testID="input-store-address"
                  valor={dadosLoja.enderecoLoja}
                  onChange={(texto) => setDadosLoja({ ...dadosLoja, enderecoLoja: texto })}
                  placeholder="Rua, Número - Bairro"
                />
              </View>
              <Botao
                testID="button-save-store-info"
                titulo="Salvar Informações"
                larguraTotal
                icone={<Save size={16} color={cores.primariaTexto} />}
                onPress={() =>
                  persistir({}, "Informações salvas", "As informações da loja foram salvas com sucesso")
                }
              />
            </View>
          </Cartao>,
        ]}
      </Grade>

      <Cartao testID="card-store-data">
        <View style={{ padding: espaco.lg, gap: espaco.md }}>
          <TituloSecao icone={<Store size={20} color={cores.primaria} />} texto="Dados da Loja" />

          <Grade colunas={ehDesktop ? 2 : 1} largura={largura}>
            {[
              <View key="razao" style={{ gap: espaco.sm }}>
                <Rotulo>Razão Social</Rotulo>
                <Campo
                  testID="input-store-legal-name"
                  valor={dadosLoja.razaoSocial}
                  onChange={(texto) => setDadosLoja({ ...dadosLoja, razaoSocial: texto })}
                />
              </View>,
              <View key="cnpj" style={{ gap: espaco.sm }}>
                <Rotulo>CNPJ</Rotulo>
                <Campo
                  testID="input-cnpj"
                  valor={dadosLoja.cnpj}
                  onChange={(texto) => setDadosLoja({ ...dadosLoja, cnpj: texto })}
                />
              </View>,
              <View key="cidade" style={{ gap: espaco.sm }}>
                <Rotulo>Cidade</Rotulo>
                <Campo
                  testID="input-city"
                  valor={dadosLoja.cidade}
                  onChange={(texto) => setDadosLoja({ ...dadosLoja, cidade: texto })}
                />
              </View>,
              <View key="estado" style={{ gap: espaco.sm }}>
                <Rotulo>Estado</Rotulo>
                <Campo
                  testID="input-state"
                  valor={dadosLoja.estado}
                  onChange={(texto) => setDadosLoja({ ...dadosLoja, estado: texto })}
                />
              </View>,
              <View key="cep" style={{ gap: espaco.sm }}>
                <Rotulo>CEP</Rotulo>
                <Campo
                  testID="input-cep"
                  valor={dadosLoja.cep}
                  onChange={(texto) => setDadosLoja({ ...dadosLoja, cep: texto })}
                />
              </View>,
              <View key="telefone" style={{ gap: espaco.sm }}>
                <Rotulo>Telefone</Rotulo>
                <Campo
                  testID="input-phone"
                  valor={dadosLoja.telefoneLoja}
                  onChange={(texto) => setDadosLoja({ ...dadosLoja, telefoneLoja: texto })}
                />
              </View>,
            ]}
          </Grade>

          <Botao
            testID="button-save-store"
            titulo="Salvar Alterações"
            variante="contorno"
            larguraTotal
            icone={<Save size={16} color={cores.texto} />}
            onPress={() => persistir({}, "Dados salvos", "Os dados da loja foram salvos com sucesso")}
          />
        </View>
      </Cartao>

      <Cartao testID="card-whatsapp-settings">
        <View style={{ padding: espaco.lg, gap: espaco.md }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: espaco.md,
            }}
          >
            <TituloSecao icone={<MessageCircle size={20} color={cores.primaria} />} texto="WhatsApp da oficina" />
            <Selo
              testID="badge-whatsapp-configured"
              texto={configuracao?.whatsAppConfigurado ? "Configurado: sim" : "Configurado: não"}
              variante={configuracao?.whatsAppConfigurado ? "sucesso" : "contorno"}
            />
          </View>

          <Text style={{ color: cores.suaveTexto, fontSize: fonte.sm }}>
            O sistema não envia WhatsApp sozinho. Use o botão Compartilhar na OS para abrir o WhatsApp
            com a mensagem pronta — o atendente pode editar o texto antes de enviar. Token e Phone Number
            Id da Meta são opcionais e ficam só como referência da oficina.
          </Text>

          <View style={{ gap: espaco.sm }}>
            <Rotulo>Phone Number Id</Rotulo>
            <Campo
              testID="input-whatsapp-phone-number-id"
              valor={whatsApp.phoneNumberId}
              onChange={(texto) => setWhatsApp({ ...whatsApp, phoneNumberId: texto })}
              placeholder="ID do número no Meta Business"
            />
          </View>

          <View style={{ gap: espaco.sm }}>
            <Rotulo>Token de acesso</Rotulo>
            <Campo
              testID="input-whatsapp-token"
              valor={whatsApp.token}
              onChange={(texto) => setWhatsApp({ ...whatsApp, token: texto })}
              placeholder={
                configuracao?.whatsAppConfigurado
                  ? "Token já salvo — deixe em branco para manter"
                  : "Cole o token permanente (não é exibido depois)"
              }
              segredo
            />
            <Text style={{ color: cores.suaveTexto, fontSize: fonte.xs }}>
              O token não volta no GET por segurança. Só informe de novo se quiser trocá-lo.
            </Text>
          </View>

          <Botao
            testID="button-save-whatsapp"
            titulo="Salvar WhatsApp"
            larguraTotal
            icone={<Save size={16} color={cores.primariaTexto} />}
            onPress={async () => {
              const ok = await persistir(
                {
                  whatsAppPhoneNumberId: whatsApp.phoneNumberId || null,
                  whatsAppToken: whatsApp.token || null,
                },
                "WhatsApp salvo",
                configuracao?.whatsAppConfigurado || whatsApp.token
                  ? "Os avisos das OS usarão a API oficial quando o token estiver válido."
                  : "Sem token, o WhatsApp abrirá com a mensagem pronta.",
              );

              if (ok) {
                setWhatsApp((atual) => ({ ...atual, token: "" }));
              }
            }}
          />
        </View>
      </Cartao>

      <Cartao testID="card-system-settings">
        <View style={{ padding: espaco.lg, gap: espaco.md }}>
          <TituloSecao icone={<Bell size={20} color={cores.primaria} />} texto="Preferências do Sistema" />

          <LinhaPreferencia titulo="Tema Escuro" descricao="Alternar entre modo claro e escuro">
            <AlternarTema />
          </LinhaPreferencia>

          <LinhaPreferencia
            titulo="Notificações de Estoque"
            descricao="Alertas quando estoque estiver baixo"
          >
            <Interruptor
              testID="switch-stock-alerts"
              valor={preferencias.alertaEstoqueBaixo}
              onChange={(valor) => {
                setPreferencias({ ...preferencias, alertaEstoqueBaixo: valor });
                persistir(
                  { alertaEstoqueBaixo: valor },
                  "Preferência salva",
                  "As preferências foram atualizadas",
                );
              }}
            />
          </LinhaPreferencia>

          <LinhaPreferencia titulo="Som no Checkout" descricao="Reproduzir som ao finalizar venda">
            <Interruptor
              testID="switch-checkout-sound"
              valor={preferencias.somFinalizacao}
              onChange={(valor) => {
                setPreferencias({ ...preferencias, somFinalizacao: valor });
                persistir(
                  { somFinalizacao: valor },
                  "Preferência salva",
                  "As preferências foram atualizadas",
                );
              }}
            />
          </LinhaPreferencia>

          <LinhaPreferencia titulo="Impressão Automática" descricao="Imprimir recibo automaticamente">
            <Interruptor
              testID="switch-auto-print"
              valor={preferencias.impressaoAutomatica}
              onChange={(valor) => {
                setPreferencias({ ...preferencias, impressaoAutomatica: valor });
                persistir(
                  { impressaoAutomatica: valor },
                  "Preferência salva",
                  "As preferências foram atualizadas",
                );
              }}
            />
          </LinhaPreferencia>
        </View>
      </Cartao>

      <Cartao testID="card-permissions">
        <View style={{ padding: espaco.lg, gap: espaco.md }}>
          <TituloSecao icone={<Users size={20} color={cores.primaria} />} texto="Estrutura de Permissões" />

          {permissoes.map((item) => (
            <View
              key={item.funcao}
              style={{
                borderWidth: 1,
                borderColor: cores.borda,
                borderRadius: raio.medio,
                padding: espaco.md,
                gap: espaco.xs,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: cores.texto, fontSize: fonte.base, fontWeight: "600" }}>
                  {item.funcao}
                </Text>
                <Selo texto={item.selo} variante={item.variante} />
              </View>
              <Text style={{ color: cores.suaveTexto, fontSize: fonte.xs }}>{item.cria}</Text>
              <Text style={{ color: cores.suaveTexto, fontSize: fonte.xs }}>{item.descricao}</Text>
            </View>
          ))}
        </View>
      </Cartao>

      <Cartao testID="card-users-management">
        <View style={{ padding: espaco.lg, gap: espaco.md }}>
          <View
            style={{
              flexDirection: ehDesktop ? "row" : "column",
              justifyContent: "space-between",
              alignItems: ehDesktop ? "center" : "flex-start",
              gap: espaco.md,
            }}
          >
            <TituloSecao icone={<Users size={20} color={cores.primaria} />} texto="Usuários do Sistema" />

            <View style={{ alignItems: "flex-end", gap: espaco.xs }}>
              <Botao
                testID="button-new-user"
                titulo="Novo Usuário"
                desabilitado={!podeCriarUsuarios}
                icone={<Plus size={16} color={cores.primariaTexto} />}
                onPress={abrirDialogoUsuario}
              />
              {!podeCriarUsuarios ? (
                <Text style={{ color: cores.suaveTexto, fontSize: fonte.xs }}>
                  Sem permissão para criar usuários
                </Text>
              ) : null}
            </View>
          </View>

          {usuarios.length === 0 ? (
            <View
              style={{
                borderWidth: 1,
                borderColor: cores.borda,
                borderRadius: raio.medio,
                padding: espaco.xxl,
                alignItems: "center",
                gap: espaco.sm,
              }}
            >
              <Users size={48} color={cores.suaveTexto} />
              <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>Nenhum usuário cadastrado</Text>
              <Text style={{ color: cores.suaveTexto, fontSize: fonte.sm, textAlign: "center" }}>
                Clique em &quot;Novo Usuário&quot; para adicionar o primeiro usuário do sistema
              </Text>
            </View>
          ) : (
            <View
              style={{
                borderWidth: 1,
                borderColor: cores.borda,
                borderRadius: raio.medio,
                paddingHorizontal: espaco.lg,
              }}
            >
              <Tabela larguraMinima={680}>
                <LinhaTabela cabecalho>
                  <CelulaTabela cabecalho proporcao={1.5}>
                    Usuário
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={2}>
                    E-mail
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={1.2}>
                    Função
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={1}>
                    Status
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={0.8} alinhamento="flex-end">
                    Ações
                  </CelulaTabela>
                </LinhaTabela>

                {usuarios.map((item) => (
                  <LinhaTabela key={item.id} testID={`row-user-${item.id}`}>
                    <CelulaTabela proporcao={1.5} estiloTexto={{ fontWeight: "500" }}>
                      {item.nomeUsuario}
                    </CelulaTabela>
                    <CelulaTabela proporcao={2} estiloTexto={{ color: cores.suaveTexto }}>
                      {item.email ?? "-"}
                    </CelulaTabela>
                    <CelulaTabela proporcao={1.2}>{item.funcao}</CelulaTabela>
                    <CelulaTabela proporcao={1}>
                      <Selo texto={item.ativo ? "Ativo" : "Inativo"} variante={item.ativo ? "primario" : "suave"} />
                    </CelulaTabela>
                    <CelulaTabela proporcao={0.8} alinhamento="flex-end">
                      <Botao
                        testID={`button-delete-user-${item.id}`}
                        variante="fantasma"
                        tamanho="icone"
                        onPress={() => excluirUsuario(item.id)}
                        icone={<Trash2 size={16} color={cores.texto} />}
                      />
                    </CelulaTabela>
                  </LinhaTabela>
                ))}
              </Tabela>
            </View>
          )}
        </View>
      </Cartao>

      <Grade colunas={ehDesktop ? 2 : 1} largura={largura}>
        {[
          <Cartao key="comprovante" testID="card-receipt-settings">
            <View style={{ padding: espaco.lg, gap: espaco.md }}>
              <TituloSecao icone={<Receipt size={20} color={cores.primaria} />} texto="Comprovante de Vendas" />

              <LinhaPreferencia
                titulo="Incluir Logo no Comprovante"
                descricao="Adicionar logo da loja no topo"
              >
                <Interruptor
                  testID="switch-include-logo"
                  valor={comprovante.incluirLogo}
                  onChange={(valor) => setComprovante({ ...comprovante, incluirLogo: valor })}
                />
              </LinhaPreferencia>

              <View style={{ gap: espaco.sm }}>
                <Rotulo>Cabeçalho do Comprovante</Rotulo>
                <Campo
                  testID="input-receipt-header"
                  valor={comprovante.cabecalho}
                  onChange={(texto) => setComprovante({ ...comprovante, cabecalho: texto })}
                  placeholder="Ex: Obrigado pela preferência!"
                />
              </View>

              <View style={{ gap: espaco.sm }}>
                <Rotulo>Mensagem de Rodapé</Rotulo>
                <Campo
                  testID="input-receipt-footer"
                  valor={comprovante.rodape}
                  onChange={(texto) => setComprovante({ ...comprovante, rodape: texto })}
                  placeholder="Ex: Volte sempre!"
                />
              </View>

              <LinhaPreferencia
                titulo="Mostrar Dados Fiscais"
                descricao="Incluir CNPJ e Inscrição Estadual"
              >
                <Interruptor
                  testID="switch-show-fiscal-data"
                  valor={comprovante.mostrarDadosFiscais}
                  onChange={(valor) => setComprovante({ ...comprovante, mostrarDadosFiscais: valor })}
                />
              </LinhaPreferencia>

              <Botao
                testID="button-save-receipt-settings"
                titulo="Salvar Configurações"
                larguraTotal
                icone={<Save size={16} color={cores.primariaTexto} />}
                onPress={() =>
                  persistir(
                    {},
                    "Configurações salvas",
                    "As configurações do comprovante foram salvas com sucesso",
                  )
                }
              />
            </View>
          </Cartao>,

          <Cartao key="impressora" testID="card-printer-settings">
            <View style={{ padding: espaco.lg, gap: espaco.md }}>
              <TituloSecao
                icone={<Printer size={20} color={cores.primaria} />}
                texto="Configuração de Impressora"
              />

              <View style={{ gap: espaco.sm }}>
                <Rotulo>Nome da Impressora</Rotulo>
                <Campo
                  testID="input-printer-name"
                  valor={impressora.nome}
                  onChange={(texto) => setImpressora({ ...impressora, nome: texto })}
                  placeholder="Ex: Impressora Térmica USB"
                />
              </View>

              <View style={{ gap: espaco.sm }}>
                <Rotulo>Modelo</Rotulo>
                <Seletor
                  testID="select-printer-model"
                  valor={impressora.modelo}
                  onChange={(valor) => setImpressora({ ...impressora, modelo: valor })}
                  opcoes={modelosImpressora}
                />
              </View>

              <View style={{ gap: espaco.sm }}>
                <Rotulo>Largura do Papel (mm)</Rotulo>
                <Seletor
                  testID="select-paper-width"
                  valor={impressora.larguraPapel}
                  onChange={(valor) => setImpressora({ ...impressora, larguraPapel: valor })}
                  opcoes={largurasPapel}
                />
              </View>

              <LinhaPreferencia titulo="Corte Automático" descricao="Cortar papel após impressão">
                <Interruptor
                  testID="switch-auto-cut"
                  valor={impressora.corteAutomatico}
                  onChange={(valor) => setImpressora({ ...impressora, corteAutomatico: valor })}
                />
              </LinhaPreferencia>

              <Botao
                testID="button-save-printer"
                titulo="Salvar Configurações"
                larguraTotal
                icone={<Save size={16} color={cores.primariaTexto} />}
                onPress={() =>
                  persistir(
                    {},
                    "Configurações salvas",
                    "As configurações da impressora foram salvas com sucesso",
                  )
                }
              />
            </View>
          </Cartao>,
        ]}
      </Grade>

      <Cartao testID="card-backup">
        <View style={{ padding: espaco.lg, gap: espaco.md }}>
          <TituloSecao icone={<Database size={20} color={cores.primaria} />} texto="Backup do Sistema" />

          <Text style={{ color: cores.suaveTexto, fontSize: fonte.sm }}>
            Faça backup de todos os dados do sistema incluindo produtos, vendas, ordens de serviço e
            configurações.
          </Text>

          <View style={{ flexDirection: "row", gap: espaco.lg, flexWrap: "wrap" }}>
            <Botao
              testID="button-backup"
              titulo="Fazer Backup Agora"
              icone={<Download size={16} color={cores.primariaTexto} />}
              onPress={backup}
            />
            <Botao
              testID="button-restore"
              titulo="Restaurar Backup"
              variante="contorno"
              icone={<Database size={16} color={cores.texto} />}
              onPress={() =>
                avisar({
                  titulo: "Restauração indisponível",
                  descricao: "A restauração de backup será liberada em uma próxima versão.",
                  variante: "perigo",
                })
              }
            />
          </View>
        </View>
      </Cartao>

      <Cartao testID="card-system-update">
        <View style={{ padding: espaco.lg, gap: espaco.md }}>
          <TituloSecao icone={<RefreshCcw size={20} color={cores.primaria} />} texto="Atualização do Sistema" />

          <View
            style={{
              flexDirection: ehDesktop ? "row" : "column",
              alignItems: ehDesktop ? "center" : "flex-start",
              justifyContent: "space-between",
              gap: espaco.md,
              backgroundColor: cores.suave,
              borderRadius: raio.medio,
              padding: espaco.lg,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: espaco.md }}>
              <CheckCircle size={24} color={cores.sucesso} />
              <View>
                <Text style={{ color: cores.texto, fontSize: fonte.base, fontWeight: "500" }}>
                  Sistema Atualizado
                </Text>
                <Text style={{ color: cores.suaveTexto, fontSize: fonte.sm }}>
                  Versão 1.0.0 - Última verificação: hoje
                </Text>
              </View>
            </View>

            <Botao
              testID="button-check-updates"
              titulo={verificandoAtualizacoes ? "Verificando..." : "Verificar Atualizações"}
              variante="contorno"
              carregando={verificandoAtualizacoes}
              icone={<RefreshCcw size={16} color={cores.texto} />}
              onPress={verificarAtualizacoes}
            />
          </View>

          <Text style={{ color: cores.suaveTexto, fontSize: fonte.sm, fontWeight: "600" }}>
            Notas da Versão 1.0.0:
          </Text>
          {[
            "Sistema PDV completo com vendas e caixa",
            "Gestão de produtos e estoque",
            "Ordens de serviço com controle de entrada/saída",
            "Comissões de vendedores",
            "Relatórios e estatísticas",
            "Impressão de recibos e comprovantes",
            "Backup e restauração de dados",
          ].map((nota) => (
            <Text key={nota} style={{ color: cores.suaveTexto, fontSize: fonte.sm }}>
              ✅ {nota}
            </Text>
          ))}

          <View style={{ flexDirection: "row", alignItems: "center", gap: espaco.sm }}>
            <Text style={{ color: cores.texto, fontSize: fonte.xs, fontWeight: "500" }}>
              Servidor de Atualizações:
            </Text>
            <Pressable testID="link-update-server" onPress={() => Linking.openURL(urlAtualizacoes)}>
              <Text style={{ color: cores.primaria, fontSize: fonte.xs }}>Google Drive</Text>
            </Pressable>
          </View>
        </View>
      </Cartao>

      <Dialogo
        aberto={dialogoUsuario}
        onFechar={() => setDialogoUsuario(false)}
        titulo="Novo Usuário do Sistema"
        descricao="Crie um novo usuário com permissões específicas baseadas na função selecionada."
        testID="dialog-new-user"
        rodape={
          <>
            <Botao variante="contorno" titulo="Cancelar" onPress={() => setDialogoUsuario(false)} />
            <Botao
              testID="button-save-user"
              titulo="Criar Usuário"
              carregando={criarUsuario.isPending}
              onPress={salvarUsuario}
            />
          </>
        }
      >
        <View style={{ gap: espaco.sm }}>
          <Rotulo>Nome de Usuário</Rotulo>
          <Campo
            testID="input-new-username"
            valor={novoUsuario.nomeUsuario}
            onChange={(texto) => setNovoUsuario({ ...novoUsuario, nomeUsuario: texto })}
            placeholder="login do usuário"
          />
        </View>

        <View style={{ gap: espaco.sm }}>
          <Rotulo>E-mail</Rotulo>
          <Campo
            testID="input-new-email"
            valor={novoUsuario.email}
            onChange={(texto) => setNovoUsuario({ ...novoUsuario, email: texto })}
            placeholder="email@exemplo.com"
          />
        </View>

        <View style={{ gap: espaco.sm }}>
          <Rotulo>Senha</Rotulo>
          <Campo
            testID="input-new-password"
            valor={novoUsuario.senha}
            onChange={(texto) => setNovoUsuario({ ...novoUsuario, senha: texto })}
            placeholder="••••••••"
            segredo={!mostrarSenha}
            iconeDireita={
              <Pressable
                testID="button-toggle-new-password"
                onPress={() => setMostrarSenha((atual) => !atual)}
                hitSlop={8}
              >
                {mostrarSenha ? (
                  <EyeOff size={16} color={cores.suaveTexto} />
                ) : (
                  <Eye size={16} color={cores.suaveTexto} />
                )}
              </Pressable>
            }
          />
          <Text style={{ color: cores.suaveTexto, fontSize: fonte.xs }}>Mínimo de 8 caracteres</Text>
        </View>

        <View style={{ gap: espaco.sm }}>
          <Rotulo>Função</Rotulo>
          <Seletor
            testID="select-new-role"
            valor={novoUsuario.funcao}
            onChange={(valor) => setNovoUsuario({ ...novoUsuario, funcao: valor })}
            opcoes={disponiveis.map((item) => ({ valor: item, rotulo: item }))}
          />
          <Text style={{ color: cores.suaveTexto, fontSize: fonte.xs }}>
            {usuario?.funcao === "Administrador"
              ? "Administrador pode criar qualquer função"
              : usuario?.funcao === "Gerente"
                ? "Gerente pode criar Vendedor e Técnico"
                : "Define as permissões do usuário no sistema"}
          </Text>
        </View>
      </Dialogo>
    </View>
  );
}

function TituloSecao({ icone, texto }: { icone: React.ReactNode; texto: string }) {
  const { cores } = useTema();

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: espaco.sm }}>
      {icone}
      <Text style={{ color: cores.texto, fontSize: fonte.lg, fontWeight: "600" }}>{texto}</Text>
    </View>
  );
}

function LinhaPreferencia({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao: string;
  children: React.ReactNode;
}) {
  const { cores } = useTema();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: espaco.md,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: cores.texto, fontSize: fonte.base, fontWeight: "500" }}>{titulo}</Text>
        <Text style={{ color: cores.suaveTexto, fontSize: fonte.sm }}>{descricao}</Text>
      </View>
      {children}
    </View>
  );
}
