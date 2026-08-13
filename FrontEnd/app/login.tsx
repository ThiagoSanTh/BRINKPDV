import { Eye, EyeOff, Lock, Store, User } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Botao } from "../componentes/ui/Botao";
import { Campo, Rotulo } from "../componentes/ui/Campo";
import { Cartao } from "../componentes/ui/Cartao";
import { useAvisos } from "../componentes/ui/Avisos";
import { ErroApi } from "../lib/api";
import { useAutenticacao } from "../lib/autenticacao";
import { useTema } from "../tema/TemaProvider";
import { espaco, fonte, raio } from "../tema/tokens";

export default function TelaLogin() {
  const { cores } = useTema();
  const { entrar } = useAutenticacao();
  const { avisar } = useAvisos();
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function autenticar() {
    if (!nomeUsuario || !senha) {
      avisar({ titulo: "Erro de autenticação", descricao: "Informe usuário e senha", variante: "perigo" });
      return;
    }

    setEnviando(true);

    try {
      await entrar(nomeUsuario, senha);
      avisar({ titulo: "Login realizado", descricao: `Bem-vindo, ${nomeUsuario}!` });
    } catch (erro) {
      const mensagem =
        erro instanceof ErroApi ? erro.message : "Não foi possível falar com o servidor da API";
      avisar({ titulo: "Erro de autenticação", descricao: mensagem, variante: "perigo" });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        minHeight: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: cores.fundo,
        padding: espaco.lg,
      }}
    >
      <Cartao estilo={{ width: "100%", maxWidth: 448 }}>
        <View style={{ padding: espaco.xxl, gap: espaco.xl }}>
          <View style={{ alignItems: "center", gap: espaco.sm }}>
            <View
              style={{
                height: 64,
                width: 64,
                borderRadius: raio.cheio,
                backgroundColor: cores.suave,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: espaco.sm,
              }}
            >
              <Store size={32} color={cores.primaria} />
            </View>
            <Text style={{ color: cores.texto, fontSize: fonte.xxxl, fontWeight: "700" }}>BRINKPDV</Text>
            <Text style={{ color: cores.suaveTexto, fontSize: fonte.base }}>Sistema de Ponto de Venda</Text>
          </View>

          <View style={{ gap: espaco.lg }}>
            <View style={{ gap: espaco.sm }}>
              <Rotulo>Usuário</Rotulo>
              <Campo
                testID="input-username"
                valor={nomeUsuario}
                onChange={setNomeUsuario}
                placeholder="Digite seu usuário"
                iconeEsquerda={<User size={16} color={cores.suaveTexto} />}
                autoFoco
              />
            </View>

            <View style={{ gap: espaco.sm }}>
              <Rotulo>Senha</Rotulo>
              <Campo
                testID="input-password"
                valor={senha}
                onChange={setSenha}
                placeholder="Digite sua senha"
                segredo={!mostrarSenha}
                aoEnviar={autenticar}
                iconeEsquerda={<Lock size={16} color={cores.suaveTexto} />}
                iconeDireita={
                  <Pressable testID="button-toggle-password" onPress={() => setMostrarSenha((v) => !v)}>
                    {mostrarSenha ? (
                      <EyeOff size={16} color={cores.suaveTexto} />
                    ) : (
                      <Eye size={16} color={cores.suaveTexto} />
                    )}
                  </Pressable>
                }
              />
            </View>

            <Botao
              testID="button-login"
              titulo={enviando ? "Entrando..." : "Entrar"}
              onPress={autenticar}
              carregando={enviando}
              larguraTotal
            />
          </View>
        </View>
      </Cartao>
    </View>
  );
}
