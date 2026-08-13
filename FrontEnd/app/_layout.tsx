import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Slot, usePathname, useRouter } from "expo-router";
import { LogOut, Menu, Store, User as IconeUsuario } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AlternarTema } from "../componentes/AlternarTema";
import { BarraLateral } from "../componentes/BarraLateral";
import { BotaoInstalarPwa } from "../componentes/BotaoInstalarPwa";
import { AvisosProvider, useAvisos } from "../componentes/ui/Avisos";
import { Botao } from "../componentes/ui/Botao";
import { AutenticacaoProvider, useAutenticacao } from "../lib/autenticacao";
import { silenciarRuidoDeBiblioteca } from "../lib/avisosConsole";
import { chaves, clienteConsultas } from "../lib/consultas";
import { ConfiguracaoLoja } from "../lib/tipos";
import { TemaProvider, useTema } from "../tema/TemaProvider";
import { espaco, fonte, larguraBarraLateral, raio } from "../tema/tokens";

silenciarRuidoDeBiblioteca();

export default function LayoutRaiz() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={clienteConsultas}>
        <TemaProvider>
          <AvisosProvider>
            <AutenticacaoProvider>
              <Casca />
            </AutenticacaoProvider>
          </AvisosProvider>
        </TemaProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

function Casca() {
  const { autenticado, carregando } = useAutenticacao();
  const caminho = usePathname();
  const router = useRouter();
  const naTelaLogin = caminho === "/login";

  useEffect(() => {
    if (carregando) {
      return;
    }

    if (!autenticado && !naTelaLogin) {
      router.replace("/login");
    }

    if (autenticado && naTelaLogin) {
      router.replace("/");
    }
  }, [autenticado, carregando, naTelaLogin, router]);

  if (carregando) {
    return <View style={{ flex: 1 }} />;
  }

  if (!autenticado) {
    return naTelaLogin ? <Slot /> : <View style={{ flex: 1 }} />;
  }

  return <LayoutAutenticado />;
}

function LayoutAutenticado() {
  const { cores, ehDesktop } = useTema();
  const { usuario, sair } = useAutenticacao();
  const { avisar } = useAvisos();
  const caminho = usePathname();
  const [gavetaAberta, setGavetaAberta] = useState(false);

  const { data: configuracao } = useQuery<ConfiguracaoLoja>({ queryKey: chaves.configuracaoLoja });

  const nomeLoja = configuracao?.nomeLoja ?? "BRINKPDV";

  useEffect(() => {
    if (ehDesktop) {
      setGavetaAberta(false);
    }
  }, [ehDesktop]);

  return (
    <View style={{ flex: 1, flexDirection: "row", backgroundColor: cores.fundo }}>
      {ehDesktop ? (
        <BarraLateral rotaAtual={caminho} logo={configuracao?.logoLoja ?? null} />
      ) : (
        <Modal
          visible={gavetaAberta}
          transparent
          animationType="slide"
          onRequestClose={() => setGavetaAberta(false)}
        >
          <View style={{ flex: 1, flexDirection: "row" }}>
            <View style={{ width: larguraBarraLateral, height: "100%" }}>
              <BarraLateral
                rotaAtual={caminho}
                logo={configuracao?.logoLoja ?? null}
                aoNavegar={() => setGavetaAberta(false)}
              />
            </View>
            <Pressable
              style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
              onPress={() => setGavetaAberta(false)}
            />
          </View>
        </Modal>
      )}

      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: ehDesktop ? espaco.xl : espaco.md,
            paddingVertical: espaco.md,
            borderBottomWidth: 1,
            borderBottomColor: cores.borda,
            backgroundColor: cores.fundo,
            gap: espaco.sm,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: espaco.md, flexShrink: 1 }}>
            {ehDesktop ? null : (
              <Botao
                testID="button-sidebar-toggle"
                variante="contorno"
                tamanho="icone"
                onPress={() => setGavetaAberta(true)}
                icone={<Menu size={18} color={cores.texto} />}
              />
            )}
            <View
              testID="text-store-name"
              style={{ flexDirection: "row", alignItems: "center", gap: espaco.sm, flexShrink: 1 }}
            >
              <Store size={18} color={cores.primaria} />
              <Text
                numberOfLines={1}
                style={{ color: cores.texto, fontSize: fonte.lg, fontWeight: "600" }}
              >
                {nomeLoja}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: espaco.sm }}>
            {usuario && ehDesktop ? (
              <View
                testID="text-current-user"
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: espaco.sm,
                  paddingHorizontal: espaco.md,
                  paddingVertical: espaco.sm,
                  borderRadius: raio.medio,
                  backgroundColor: cores.suave,
                }}
              >
                <IconeUsuario size={14} color={cores.suaveTexto} />
                <Text style={{ color: cores.texto, fontSize: fonte.base, fontWeight: "500" }}>
                  {usuario.nomeUsuario}
                </Text>
                <Text style={{ color: cores.suaveTexto, fontSize: fonte.xs }}>({usuario.funcao})</Text>
              </View>
            ) : null}

            <BotaoInstalarPwa />

            <AlternarTema />

            <Botao
              testID="button-logout"
              variante="contorno"
              tamanho="pequeno"
              titulo={ehDesktop ? "Sair" : undefined}
              icone={<LogOut size={14} color={cores.texto} />}
              onPress={async () => {
                await sair();
                avisar({ titulo: "Sessão encerrada", descricao: "Você foi desconectado do sistema" });
              }}
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: ehDesktop ? espaco.xl : espaco.md, gap: espaco.xl }}
          style={{ flex: 1, backgroundColor: cores.fundo }}
        >
          <Slot />
        </ScrollView>
      </View>
    </View>
  );
}
