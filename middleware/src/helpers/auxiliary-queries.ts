import type { EndpointErrorFxn, FailedResult, Result } from 'paima-sdk/paima-mw-core';
import { PaimaMiddlewareErrorCode } from 'paima-sdk/paima-mw-core';

import { buildEndpointErrorFxn } from '../errors';
import type { NewLobbies, PackedLobbyState } from '../types';
import { userCreatedLobby, userJoinedLobby } from './utility-functions';
import { backendQueryLobbyState, backendQueryUserLobbiesBlockheight } from './query-constructors';
import type { LobbyStateResponse, UserLobbiesBlockHeightResponse } from '@cards/game-logic';

export async function auxGet<R>(
  builtQuery: string,
  errorFxn: EndpointErrorFxn
): Promise<Result<R>> {
  let response: Response;
  try {
    response = await fetch(builtQuery);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const result = (await response.json()) as R;
    return {
      success: true,
      result,
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

export async function auxGetLobbyState(lobbyID: string): Promise<PackedLobbyState | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getRawLobbyState');

  let res: Response;
  try {
    const query = backendQueryLobbyState(lobbyID);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = (await res.json()) as LobbyStateResponse;
    return {
      success: true,
      lobby: j.lobby,
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

export async function getRawNewLobbies(
  nftId: number,
  blockHeight: number
): Promise<NewLobbies | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getRawNewLobbies');

  let res: Response;
  try {
    const query = backendQueryUserLobbiesBlockheight(nftId, blockHeight);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = (await res.json()) as UserLobbiesBlockHeightResponse;
    return {
      success: true,
      lobbies: j.lobbies,
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

export async function getNonemptyNewLobbies(
  nftId: number,
  blockHeight: number
): Promise<NewLobbies> {
  const newLobbies = await getRawNewLobbies(nftId, blockHeight);
  if (!newLobbies.success) {
    throw new Error('Failed to get new lobbies');
  } else if (newLobbies.lobbies.length === 0) {
    throw new Error('Received an empty list of new lobbies');
  } else {
    return newLobbies;
  }
}

export async function getLobbyStateWithUser(
  lobbyID: string,
  nftId: number
): Promise<PackedLobbyState> {
  const lobbyState = await auxGetLobbyState(lobbyID);
  if (!lobbyState.success) {
    throw new Error('Failed to get lobby state');
  } else if (userJoinedLobby(nftId, lobbyState) || userCreatedLobby(nftId, lobbyState)) {
    return lobbyState;
  } else {
    throw new Error('User is not in the lobby');
  }
}
