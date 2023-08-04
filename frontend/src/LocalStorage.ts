import { LocalCard } from "@dice/game-logic";

function setLobbyDeck(lobbyId: string, cards: LocalCard[]) {
  localStorage.setItem(`lobbyDeck_${lobbyId}`, JSON.stringify(cards));
}

function getLobbyDeck(lobbyId: string): undefined | LocalCard[] {
  const raw = localStorage.getItem(`lobbyDeck_${lobbyId}`);
  return raw == null ? undefined : JSON.parse(raw);
}

export default {
  setLobbyDeck,
  getLobbyDeck,
};
