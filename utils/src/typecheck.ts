import type { IGetLobbyByIdResult } from '@dice/db';
import type { ActiveLobby } from './types';

// Type inference is set up wrong. It can infer that individual properties are not null
// but not that object type does not include the null property.
export function isLobbyActive(lobby: IGetLobbyByIdResult): lobby is ActiveLobby {
  if (lobby.current_match == null || lobby.current_round == null || lobby.current_turn == null) {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _check: ActiveLobby = {
    ...lobby,
    current_match: lobby.current_match,
    current_round: lobby.current_round,
    current_turn: lobby.current_turn,
  };

  return true;
}
