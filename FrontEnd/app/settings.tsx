import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCircle,
  Database,
  Download,
  Eye,
  EyeOff,
  Image as ImagemIcone,
  Pencil,
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
  Wrench,
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
import { baixarBlob, escolherBackupBrink, escolherImagemBase64 } from "../lib/arquivos";
import { useAutenticacao } from "../lib/autenticacao";
import { chaves } from "../lib/consultas";
import { dataCurta, moeda, paraNumero } from "../lib/formato";
import { colunas, useLarguraConteudo } from "../lib/layout";
import { ehGestao, funcoesQuePodeCriar, podeCriarFuncao } from "../lib/permissoes";
import { ConfiguracaoLoja, ResultadoRestore, ResumoBackup, Servico, Usuario } from "../lib/tipos";
import { useTema } from "../tema/TemaProvider";
import { espaco, fonte, raio } from "../tema/tokens";
import Constants from "expo-constants";

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

export default function TelaConfiguracoes() {
  const { cores, ehDesktop } = useTema();
  const largura = useLarguraConteudo();
  const { avisar } = useAvisos();
  const { usuario } = useAutenticacao();
  const clienteConsultas = useQueryClient();
  const gestao = ehGestao(usuario?.funcao);
  const versao = Constants.expoConfig?.version ?? "1.0.0";

  const { data: configuracao } = useQuery<ConfiguracaoLoja>({ queryKey: chaves.configuracaoLoja });
  const { data: usuarios = [] } = useQuery<Usuario[]>({
    queryKey: chaves.usuarios,
    enabled: gestao,
  });
  const { data: servicos = [] } = useQuery<Servico[]>({
    queryKey: chaves.servicos,
    enabled: gestao,
  });

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

  const [perfil, setPerfil] = useState({ nomeUsuario: "", email: "", senha: "" });
  const [dialogoUsuario, setDialogoUsuario] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState({
    nomeUsuario: "",
    email: "",
    senha: "",
    funcao: "Vendedor",
  });
  const [dialogoServico, setDialogoServico] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null);
  const [formularioServico, setFormularioServico] = useState({
    nome: "",
    descricao: "",
    precoPadrao: "",
    ativo: true,
  });
  const [backupResumo, setBackupResumo] = useState<ResumoBackup | null>(null);
  const [arquivoBackup, setArquivoBackup] = useState<File | null>(null);
  const [restoreResumo, setRestoreResumo] = useState<ResumoBackup | null>(null);
  const [resultadoRestore, setResultadoRestore] = useState<ResultadoRestore | null>(null);

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

  const criarServico = useMutation({
    mutationFn: (dados: unknown) => api.criar<Servico>("/api/servicos", dados),
    onSuccess: () => clienteConsultas.invalidateQueries({ queryKey: chaves.servicos }),
  });

  const atualizarServico = useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: unknown }) =>
      api.atualizar<Servico>(`/api/servicos/${id}`, dados),
    onSuccess: () => clienteConsultas.invalidateQueries({ queryKey: chaves.servicos }),
  });

  const removerServico = useMutation({
    mutationFn: (id: string) => api.remover(`/api/servicos/${id}`),
    onSuccess: () => clienteConsultas.invalidateQueries({ queryKey: chaves.servicos }),
  });

  const criarBackup = useMutation({
    mutationFn: () => api.baixarArquivo("/api/backup"),
  });

  const validarBackup = useMutation({
    mutationFn: (arquivo: File) => api.enviarArquivo<ResumoBackup>("/api/backup/validar", arquivo),
  });

  const restaurarBackup = useMutation({
    mutationFn: (arquivo: File) => api.enviarArquivo<ResultadoRestore>("/api/backup/restaurar", arquivo),
  });

  const disponiveis = funcoesQuePodeCriar(usuario?.funcao);
  const podeCriarUsuarios = gestao && disponiveis.length > 0;

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

    if (perfil.senha && perfil.senha.length < 8) {
      avisar({ titulo: "Erro", descricao: "A senha deve ter no mínimo 8 caracteres", variante: "perigo" });
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

    if (!novoUsuario.senha || novoUsuario.senha.length < 8) {
      avisar({ titulo: "Erro", descricao: "A senha deve ter no mínimo 8 caracteres", variante: "perigo" });
      return;
    }

    if (!podeCriarFuncao(usuario?.funcao, novoUsuario.funcao)) {
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

  function abrirDialogoServico(servico?: Servico) {
    setServicoSelecionado(servico ?? null);
    setFormularioServico({
      nome: servico?.nome ?? "",
      descricao: servico?.descricao ?? "",
      precoPadrao: servico?.precoPadrao != null ? String(servico.precoPadrao).replace(".", ",") : "",
      ativo: servico?.ativo ?? true,
    });
    setDialogoServico(true);
  }

  async function salvarServico() {
    if (!formularioServico.nome.trim()) {
      avisar({ titulo: "Nome obrigatório", descricao: "Informe o nome do serviço.", variante: "perigo" });
      return;
    }

    const payload = {
      nome: formularioServico.nome.trim(),
      descricao: formularioServico.descricao.trim() || null,
      precoPadrao: formularioServico.precoPadrao ? paraNumero(formularioServico.precoPadrao) : null,
      ativo: formularioServico.ativo,
    };

    try {
      if (servicoSelecionado) {
        await atualizarServico.mutateAsync({ id: servicoSelecionado.id, dados: payload });
      } else {
        await criarServico.mutateAsync(payload);
      }

      setDialogoServico(false);
      avisar({ titulo: "Serviço salvo", descricao: "O cadastro de serviço foi atualizado." });
    } catch (erro) {
      avisar({
        titulo: "Erro ao salvar serviço",
        descricao: erro instanceof Error ? erro.message : "Não foi possível salvar o serviço.",
        variante: "perigo",
      });
    }
  }

  async function excluirServico(id: string) {
    try {
      await removerServico.mutateAsync(id);
      avisar({ titulo: "Serviço removido", descricao: "O serviço foi removido do cadastro." });
    } catch (erro) {
      avisar({
        titulo: "Erro ao remover serviço",
        descricao: erro instanceof Error ? erro.message : "Não foi possível remover o serviço.",
        variante: "perigo",
      });
    }
  }

  async function backup() {
    try {
      setBackupResumo(null);
      const arquivo = await criarBackup.mutateAsync();
      const baixou = baixarBlob(arquivo.nomeArquivo, arquivo.blob);

      setBackupResumo({
        fileName: arquivo.nomeArquivo,
        manifest: (arquivo.manifest as ResumoBackup["manifest"]) ?? {
          format: "BRINKPDV_BACKUP",
          version: 1,
          createdAt: new Date().toISOString(),
          applicationVersion: versao,
          storeId: configuracao?.id ?? null,
          storeName: configuracao?.nomeLoja ?? "BRINKPDV",
          records: {},
        },
      });

      avisar({
        titulo: baixou ? "Backup criado" : "Backup indisponível",
        descricao: baixou
          ? `${arquivo.nomeArquivo} foi baixado para este computador.`
          : "O download de arquivos só está disponível na versão web.",
        variante: baixou ? "padrao" : "perigo",
      });
    } catch (erro) {
      avisar({
        titulo: "Erro ao criar backup",
        descricao: erro instanceof Error ? erro.message : "Não foi possível criar o backup.",
        variante: "perigo",
      });
    }
  }

  async function selecionarBackup() {
    const arquivo = await escolherBackupBrink();

    if (!arquivo) {
      return;
    }

    try {
      const resumo = await validarBackup.mutateAsync(arquivo);
      setArquivoBackup(arquivo);
      setRestoreResumo(resumo);
      setResultadoRestore(null);
      avisar({ titulo: "Backup validado", descricao: "Confira o resumo antes de restaurar." });
    } catch (erro) {
      setArquivoBackup(null);
      setRestoreResumo(null);
      avisar({
        titulo: "Backup inválido",
        descricao: erro instanceof Error ? erro.message : "Selecione um arquivo .brinkbackup compatível.",
        variante: "perigo",
      });
    }
  }

  async function confirmarRestore() {
    if (!arquivoBackup) {
      return;
    }

    try {
      const resultado = await restaurarBackup.mutateAsync(arquivoBackup);
      setResultadoRestore(resultado);
      setRestoreResumo(null);
      setArquivoBackup(null);
      clienteConsultas.invalidateQueries();
      avisar({ titulo: "Backup restaurado", descricao: resultado.mensagem });
    } catch (erro) {
      avisar({
        titulo: "Erro ao restaurar",
        descricao: erro instanceof Error ? erro.message : "Nenhuma alteração parcial foi confirmada.",
        variante: "perigo",
      });
    }
  }

  async function abrirAtualizacoes() {
    await Linking.openURL(urlAtualizacoes);
  }

  return (
    <View style={{ gap: espaco.xl }}>
      <TituloPagina titulo="Configurações" descricao="Gerenciar preferências do sistema" />

      <Grade colunas={colunas(largura, 320, 3)} largura={largura}>
        {[
          gestao ? (
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
          </Cartao>
          ) : null,

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

          gestao ? (
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
          </Cartao>
          ) : null,
        ].filter(Boolean)}
      </Grade>

      {gestao ? (
      <>
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
          <TituloSecao icone={<MessageCircle size={20} color={cores.primaria} />} texto="WhatsApp da oficina" />
          <Text style={{ color: cores.suaveTexto, fontSize: fonte.sm }}>
            O sistema não envia WhatsApp sozinho. Use o botão Compartilhar na ordem de serviço para
            abrir o WhatsApp com a mensagem pronta — o atendente pode editar o texto antes de enviar.
          </Text>
        </View>
      </Cartao>
      </>
      ) : null}

      <Cartao testID="card-system-settings">
        <View style={{ padding: espaco.lg, gap: espaco.md }}>
          <TituloSecao icone={<Bell size={20} color={cores.primaria} />} texto="Preferências do Sistema" />

          <LinhaPreferencia titulo="Tema Escuro" descricao="Alternar entre modo claro e escuro">
            <AlternarTema />
          </LinhaPreferencia>

          {gestao ? (
            <>
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
            </>
          ) : null}
        </View>
      </Cartao>

      {gestao ? (
      <>
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
                descricao="Incluir CNPJ, razão social, endereço e telefone"
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
                <Text style={{ color: cores.suaveTexto, fontSize: fonte.xs }}>
                  O navegador não escolhe a impressora sozinho. No diálogo de impressão, selecione
                  {impressora.nome ? ` ${impressora.nome}` : " a térmica da loja"}.
                </Text>
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

              <LinhaPreferencia
                titulo="Espaço para corte"
                descricao="Aumenta a margem inferior do papel. O corte automático depende do driver da impressora."
              >
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

      <Cartao testID="card-services-management">
        <View style={{ padding: espaco.lg, gap: espaco.md }}>
          <View
            style={{
              flexDirection: ehDesktop ? "row" : "column",
              justifyContent: "space-between",
              alignItems: ehDesktop ? "center" : "flex-start",
              gap: espaco.md,
            }}
          >
            <TituloSecao icone={<Wrench size={20} color={cores.primaria} />} texto="Serviços" />
            <Botao
              testID="button-new-service"
              titulo="Novo Serviço"
              icone={<Plus size={16} color={cores.primariaTexto} />}
              onPress={() => abrirDialogoServico()}
            />
          </View>

          <Text style={{ color: cores.suaveTexto, fontSize: fonte.sm }}>
            O preço padrão é opcional. Na venda ou OS, o valor cobrado fica salvo no item transacional.
          </Text>

          {servicos.length === 0 ? (
            <Text style={{ color: cores.suaveTexto }}>Nenhum serviço cadastrado.</Text>
          ) : (
            <View style={{ borderWidth: 1, borderColor: cores.borda, borderRadius: raio.medio, paddingHorizontal: espaco.lg }}>
              <Tabela larguraMinima={720}>
                <LinhaTabela cabecalho>
                  <CelulaTabela cabecalho proporcao={2}>
                    Serviço
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={2}>
                    Descrição
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={1.2}>
                    Preço padrão
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={1}>
                    Status
                  </CelulaTabela>
                  <CelulaTabela cabecalho proporcao={1} alinhamento="flex-end">
                    Ações
                  </CelulaTabela>
                </LinhaTabela>

                {servicos.map((servico) => (
                  <LinhaTabela key={servico.id} testID={`row-service-${servico.id}`}>
                    <CelulaTabela proporcao={2} estiloTexto={{ fontWeight: "500" }}>
                      {servico.nome}
                    </CelulaTabela>
                    <CelulaTabela proporcao={2}>{servico.descricao ?? "-"}</CelulaTabela>
                    <CelulaTabela proporcao={1.2}>
                      {servico.precoPadrao != null ? moeda(servico.precoPadrao) : "Definir na venda/OS"}
                    </CelulaTabela>
                    <CelulaTabela proporcao={1}>
                      <Selo texto={servico.ativo ? "Ativo" : "Inativo"} variante={servico.ativo ? "primario" : "suave"} />
                    </CelulaTabela>
                    <CelulaTabela proporcao={1} alinhamento="flex-end">
                      <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: espaco.sm }}>
                        <Botao
                          testID={`button-edit-service-${servico.id}`}
                          variante="fantasma"
                          tamanho="icone"
                          onPress={() => abrirDialogoServico(servico)}
                          icone={<Pencil size={16} color={cores.texto} />}
                        />
                        <Botao
                          testID={`button-delete-service-${servico.id}`}
                          variante="fantasma"
                          tamanho="icone"
                          onPress={() => excluirServico(servico.id)}
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
      </Cartao>

      <Cartao testID="card-backup">
        <View style={{ padding: espaco.lg, gap: espaco.md }}>
          <TituloSecao icone={<Database size={20} color={cores.primaria} />} texto="Backup e Restauração" />

          <Text style={{ color: cores.suaveTexto, fontSize: fonte.sm }}>
            Gera um arquivo .brinkbackup com banco completo, incluindo produtos, serviços, vendas,
            clientes, usuários, caixa, configurações e ordens de serviço.
          </Text>

          <View style={{ flexDirection: "row", gap: espaco.lg, flexWrap: "wrap" }}>
            <Botao
              testID="button-backup"
              titulo="Fazer Backup Agora"
              carregando={criarBackup.isPending}
              icone={<Download size={16} color={cores.primariaTexto} />}
              onPress={backup}
            />
            <Botao
              testID="button-select-backup"
              titulo="Importar Backup"
              variante="contorno"
              carregando={validarBackup.isPending}
              onPress={selecionarBackup}
            />
          </View>

          {backupResumo ? (
            <ResumoManifest
              titulo="Backup criado"
              nomeArquivo={backupResumo.fileName}
              manifest={backupResumo.manifest}
            />
          ) : null}

          {restoreResumo ? (
            <View style={{ gap: espaco.md, borderWidth: 1, borderColor: cores.borda, borderRadius: raio.medio, padding: espaco.md }}>
              <ResumoManifest
                titulo="Backup encontrado"
                nomeArquivo={restoreResumo.fileName}
                manifest={restoreResumo.manifest}
              />
              <View style={{ flexDirection: "row", gap: espaco.sm, flexWrap: "wrap" }}>
                <Botao
                  testID="button-cancel-restore"
                  variante="contorno"
                  titulo="Cancelar"
                  onPress={() => {
                    setArquivoBackup(null);
                    setRestoreResumo(null);
                  }}
                />
                <Botao
                  testID="button-confirm-restore"
                  variante="perigo"
                  titulo="Restaurar"
                  carregando={restaurarBackup.isPending}
                  onPress={confirmarRestore}
                />
              </View>
            </View>
          ) : null}

          {resultadoRestore ? (
            <View style={{ gap: espaco.xs }}>
              <Text style={{ color: cores.texto, fontSize: fonte.base, fontWeight: "600" }}>
                {resultadoRestore.mensagem}
              </Text>
              {resultadoRestore.preventiveBackupFileName ? (
                <Text style={{ color: cores.suaveTexto, fontSize: fonte.sm }}>
                  Backup preventivo criado no servidor: {resultadoRestore.preventiveBackupFileName}
                </Text>
              ) : null}
            </View>
          ) : null}
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
                  Versão instalada
                </Text>
                <Text style={{ color: cores.suaveTexto, fontSize: fonte.sm }}>
                  BRINKPDV {versao}
                </Text>
              </View>
            </View>

            <Botao
              testID="button-check-updates"
              titulo="Abrir pasta de atualizações"
              variante="contorno"
              icone={<RefreshCcw size={16} color={cores.texto} />}
              onPress={abrirAtualizacoes}
            />
          </View>

          <Text style={{ color: cores.suaveTexto, fontSize: fonte.sm, fontWeight: "600" }}>
            Notas da Versão {versao}:
          </Text>
          {[
            "Sistema PDV completo com vendas e caixa",
            "Gestão de produtos e estoque",
            "Ordens de serviço com controle de entrada/saída",
            "Comissões de vendedores",
            "Relatórios e estatísticas",
            "Impressão de recibos e comprovantes",
            "Backup dos dados em JSON",
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
      </>
      ) : null}

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

      <Dialogo
        aberto={dialogoServico}
        onFechar={() => setDialogoServico(false)}
        titulo={servicoSelecionado ? "Editar Serviço" : "Novo Serviço"}
        descricao="O preço padrão é opcional e pode ser alterado no momento da venda ou OS."
        testID="dialog-service"
        rodape={
          <>
            <Botao variante="contorno" titulo="Cancelar" onPress={() => setDialogoServico(false)} />
            <Botao
              testID="button-save-service"
              titulo="Salvar Serviço"
              carregando={criarServico.isPending || atualizarServico.isPending}
              onPress={salvarServico}
            />
          </>
        }
      >
        <View style={{ gap: espaco.sm }}>
          <Rotulo>Nome *</Rotulo>
          <Campo
            testID="input-service-name"
            valor={formularioServico.nome}
            onChange={(texto) => setFormularioServico((atual) => ({ ...atual, nome: texto }))}
            placeholder="Ex: Troca de conector"
          />
        </View>

        <View style={{ gap: espaco.sm }}>
          <Rotulo>Descrição</Rotulo>
          <Campo
            testID="input-service-description"
            valor={formularioServico.descricao}
            onChange={(texto) => setFormularioServico((atual) => ({ ...atual, descricao: texto }))}
            placeholder="Opcional"
          />
        </View>

        <View style={{ gap: espaco.sm }}>
          <Rotulo>Preço padrão (opcional)</Rotulo>
          <Campo
            testID="input-service-default-price"
            valor={formularioServico.precoPadrao}
            onChange={(texto) => setFormularioServico((atual) => ({ ...atual, precoPadrao: texto }))}
            placeholder="Definir na venda/OS"
            teclado="decimal-pad"
          />
        </View>

        <LinhaPreferencia titulo="Serviço ativo" descricao="Serviços inativos ficam fora das sugestões de venda/OS">
          <Interruptor
            testID="switch-service-active"
            valor={formularioServico.ativo}
            onChange={(ativo) => setFormularioServico((atual) => ({ ...atual, ativo }))}
          />
        </LinhaPreferencia>
      </Dialogo>
    </View>
  );
}

function ResumoManifest({
  titulo,
  nomeArquivo,
  manifest,
}: {
  titulo: string;
  nomeArquivo: string;
  manifest: ResumoBackup["manifest"];
}) {
  const { cores } = useTema();
  const registros = Object.entries(manifest.records);

  return (
    <View style={{ gap: espaco.sm }}>
      <Text style={{ color: cores.texto, fontSize: fonte.base, fontWeight: "600" }}>{titulo}</Text>
      <Text style={{ color: cores.suaveTexto, fontSize: fonte.sm }}>Arquivo: {nomeArquivo}</Text>
      <Text style={{ color: cores.suaveTexto, fontSize: fonte.sm }}>
        Loja: {manifest.storeName} • Criado em: {dataCurta(manifest.createdAt)}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: espaco.sm }}>
        {registros.map(([entidade, total]) => (
          <Selo key={entidade} texto={`${entidade}: ${total}`} variante="contorno" />
        ))}
      </View>
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
