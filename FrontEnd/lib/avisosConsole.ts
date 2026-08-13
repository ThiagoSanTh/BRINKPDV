import { Platform } from "react-native";

const ruidos = ["Unknown event handler property"];

// react-native-svg encaminha props de responder do React Native para o nó <svg> do DOM,
// e os pontos do gráfico do react-native-gifted-charts sempre recebem essas props.
export function silenciarRuidoDeBiblioteca() {
  if (Platform.OS !== "web") {
    return;
  }

  const original = console.error;

  console.error = (...argumentos: unknown[]) => {
    const primeiro = argumentos[0];

    if (typeof primeiro === "string" && ruidos.some((ruido) => primeiro.includes(ruido))) {
      return;
    }

    original(...argumentos);
  };
}
