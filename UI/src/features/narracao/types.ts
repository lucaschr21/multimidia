export interface Interlocutor {
  id: string;
  nome: string;
  voz: string;
  cor: string;
}

export interface Fala {
  id: string;
  interlocutorId: string | null;
  texto: string;
}
