import { useRouter } from "expo-router";
import {
  BarChart3,
  Contact,
  LayoutDashboard,
  Package,
  Settings as IconeConfiguracoes,
  ShoppingCart,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react-native";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

import { useAutenticacao } from "../lib/autenticacao";
import { podeAcessarRota } from "../lib/permissoes";
import { useTema } from "../tema/TemaProvider";
import { espaco, fonte, larguraBarraLateral, raio } from "../tema/tokens";

export const itensMenu = [
  { titulo: "Dashboard", rota: "/", icone: LayoutDashboard, teste: "link-dashboard" },
  { titulo: "PDV / Vendas", rota: "/pos", icone: ShoppingCart, teste: "link-pdv-/-vendas" },
  { titulo: "Vendas do Dia", rota: "/daily-sales", icone: TrendingUp, teste: "link-vendas-do-dia" },
  { titulo: "Ordens de Serviço", rota: "/service-orders", icone: Wrench, teste: "link-ordens-de-serviço" },
  { titulo: "Clientes", rota: "/clients", icone: Contact, teste: "link-clientes" },
  { titulo: "Vendedores", rota: "/salespersons", icone: Users, teste: "link-vendedores" },
  { titulo: "Produtos", rota: "/products", icone: Package, teste: "link-produtos" },
  { titulo: "Serviços", rota: "/services", icone: Wrench, teste: "link-serviços" },
  { titulo: "Relatórios", rota: "/reports", icone: BarChart3, teste: "link-relatórios" },
  { titulo: "Configurações", rota: "/settings", icone: IconeConfiguracoes, teste: "link-configurações" },
] as const;

export function BarraLateral({
  rotaAtual,
  logo,
  aoNavegar,
}: {
  rotaAtual: string;
  logo?: string | null;
  aoNavegar?: () => void;
}) {
  const { cores } = useTema();
  const router = useRouter();
  const { usuario } = useAutenticacao();
  const visiveis = itensMenu.filter((item) => podeAcessarRota(usuario?.funcao, item.rota));

  return (
    <View
      testID="sidebar-main"
      style={{
        width: larguraBarraLateral,
        backgroundColor: cores.barraLateral,
        borderRightWidth: 1,
        borderRightColor: cores.barraLateralBorda,
        height: "100%",
      }}
    >
      <View
        style={{
          padding: espaco.lg,
          borderBottomWidth: 1,
          borderBottomColor: cores.barraLateralBorda,
          flexDirection: "row",
          alignItems: "center",
          gap: espaco.sm,
        }}
      >
        {logo ? (
          <Image
            testID="img-sidebar-logo"
            source={{ uri: logo }}
            style={{ height: 32, width: 32, borderRadius: raio.medio }}
            resizeMode="contain"
          />
        ) : (
          <View
            style={{
              height: 32,
              width: 32,
              borderRadius: raio.medio,
              backgroundColor: cores.primaria,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShoppingCart size={18} color={cores.primariaTexto} />
          </View>
        )}
        <View>
          <Text style={{ color: cores.barraLateralTexto, fontSize: fonte.lg, fontWeight: "700" }}>
            BRINKPDV
          </Text>
          <Text style={{ color: cores.suaveTexto, fontSize: fonte.xs }}>Sistema PDV</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: espaco.sm, gap: 2 }}>
        <Text
          style={{
            color: cores.suaveTexto,
            fontSize: fonte.xs,
            fontWeight: "600",
            paddingHorizontal: espaco.sm,
            paddingVertical: espaco.sm,
          }}
        >
          Menu Principal
        </Text>

        {visiveis.map((item) => {
          const ativo =
            item.rota === "/"
              ? rotaAtual === "/"
              : rotaAtual === item.rota || rotaAtual.startsWith(`${item.rota}/`);
          const Icone = item.icone;

          return (
            <Pressable
              key={item.rota}
              testID={item.teste}
              onPress={() => {
                router.push(item.rota as never);
                aoNavegar?.();
              }}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: espaco.sm,
                paddingHorizontal: espaco.md,
                paddingVertical: espaco.md,
                borderRadius: raio.medio,
                backgroundColor: ativo
                  ? cores.barraLateralDestaque
                  : pressed
                    ? cores.barraLateralDestaque
                    : "transparent",
              })}
            >
              <Icone size={16} color={ativo ? cores.primaria : cores.barraLateralTexto} />
              <Text
                style={{
                  color: ativo ? cores.primaria : cores.barraLateralTexto,
                  fontSize: fonte.base,
                  fontWeight: ativo ? "600" : "500",
                }}
              >
                {item.titulo}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
