import { Switch } from "react-native";

import { useTema } from "../../tema/TemaProvider";

export function Interruptor({
  valor,
  onChange,
  testID,
}: {
  valor: boolean;
  onChange: (valor: boolean) => void;
  testID?: string;
}) {
  const { cores } = useTema();

  return (
    <Switch
      testID={testID}
      value={valor}
      onValueChange={onChange}
      trackColor={{ false: cores.suave, true: cores.primaria }}
      thumbColor={cores.cartao}
    />
  );
}
