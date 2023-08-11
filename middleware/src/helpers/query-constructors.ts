import type { QueryOptions } from 'paima-sdk/paima-mw-core';
import { buildBackendQuery } from 'paima-sdk/paima-mw-core';

export function backendQueryLobbyState(lobbyID: string): string {
  const endpoint = 'lobby/state';
  const options = {
    lobbyID,
  };
  return buildBackendQuery(endpoint, options);
}

export function backendQueryUserLobbiesBlockheight(nftId: number, blockHeight: number): string {
  const endpoint = 'lobby/userBlockHeight';
  const options = {
    nftId,
    blockHeight,
  };
  return buildBackendQuery(endpoint, options);
}
export function backendQueryUserLobbies(nftId: number, count?: number, page?: number): string {
  const endpoint = 'lobby/user';
  const optsStart: QueryOptions = {};
  if (typeof count !== 'undefined') {
    optsStart.count = count;
  }
  if (typeof page !== 'undefined') {
    optsStart.page = page;
  }
  const options = {
    nftId,
    ...optsStart,
  };
  return buildBackendQuery(endpoint, options);
}
