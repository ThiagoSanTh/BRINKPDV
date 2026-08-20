export function tocarSomFinalizacao() {
  const AudioCtx =
    typeof window !== "undefined"
      ? window.AudioContext ??
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      : undefined;

  if (!AudioCtx) {
    return;
  }

  const contexto = new AudioCtx();
  const oscilador = contexto.createOscillator();
  const ganho = contexto.createGain();

  oscilador.type = "sine";
  oscilador.frequency.value = 880;
  ganho.gain.value = 0.08;
  oscilador.connect(ganho);
  ganho.connect(contexto.destination);
  oscilador.start();
  oscilador.stop(contexto.currentTime + 0.16);

  oscilador.onended = () => {
    void contexto.close();
  };
}
