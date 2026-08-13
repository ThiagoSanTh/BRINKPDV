import { Platform } from "react-native";

export async function escolherImagemBase64(): Promise<string | null> {
  if (Platform.OS === "web") {
    return new Promise((resolver) => {
      const entrada = document.createElement("input");
      entrada.type = "file";
      entrada.accept = ".jpg,.jpeg,.png,.bmp";

      entrada.onchange = () => {
        const arquivo = entrada.files?.[0];

        if (!arquivo) {
          resolver(null);
          return;
        }

        const leitor = new FileReader();
        leitor.onload = () => resolver(typeof leitor.result === "string" ? leitor.result : null);
        leitor.onerror = () => resolver(null);
        leitor.readAsDataURL(arquivo);
      };

      entrada.click();
    });
  }

  const { launchImageLibraryAsync, MediaTypeOptions } = await import("expo-image-picker");

  const resultado = await launchImageLibraryAsync({
    mediaTypes: MediaTypeOptions.Images,
    base64: true,
    quality: 0.8,
  });

  if (resultado.canceled || !resultado.assets[0]?.base64) {
    return null;
  }

  const ativo = resultado.assets[0];
  return `data:${ativo.mimeType ?? "image/jpeg"};base64,${ativo.base64}`;
}

export function baixarTexto(nome: string, conteudo: string, tipo: string) {
  if (Platform.OS !== "web") {
    return false;
  }

  const blob = new Blob([conteudo], { type: tipo });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = nome;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}
