// src/features/Narracao/voiceData.ts

// Esta lista será usada no Dropdown (Modal)
export const VOICE_LIST = [
  { value: "alloy", label: "🎙️ Alloy — Voz neutra, clara e equilibrada." },
  { value: "echo", label: "🎙️ Echo — Voz masculina suave e expressiva." },
  { value: "fable", label: "🎙️ Fable — Voz com leve toque narrativo." },
  { value: "nova", label: "🎙️ Nova — Voz feminina, animada e simpática." },
  { value: "onyx", label: "🎙️ Onyx — Voz masculina mais grave e confiante." },
  { value: "shimmer", label: "🎙️ Shimmer — Voz feminina mais leve e alegre." },
];

// Este "mapa" será usado para exibir o nome bonito na tela
export const VOICE_MAP: { [key: string]: string } = {
  alloy: "Alloy (Neutra)",
  echo: "Echo (Masculina Suave)",
  fable: "Fable (Narrativa)",
  nova: "Nova (Feminina Animada)",
  onyx: "Onyx (Masculina Grave)",
  shimmer: "Shimmer (Feminina Leve)",
};
