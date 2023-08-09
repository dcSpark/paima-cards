import type { FailedResult, Result } from 'paima-sdk/paima-mw-core';
import { PaimaMiddlewareErrorCode, getBlockNumber } from 'paima-sdk/paima-mw-core';
import type { MatchExecutor, RoundExecutor } from 'paima-sdk/paima-executors';

import type {
  MatchExecutorData,
  RoundStatusData,
  UserStats,
  LobbyState,
  RoundExecutorBackendData,
  MatchState,
  TickEvent,
} from '@cards/game-logic';

import { buildEndpointErrorFxn, MiddlewareErrorCode } from '../errors';
import { auxGetLobbyRaw, auxGetLobbyState, getRawNewLobbies } from '../helpers/auxiliary-queries';
import { calculateRoundEnd } from '../helpers/utility-functions';
import { buildMatchExecutor, buildRoundExecutor } from '../helpers/executors';
import {
  backendQueryMatchExecutor,
  backendQueryNftsForWallet,
  backendQueryOpenLobbies,
  backendQueryRoundExecutor,
  backendQueryRoundStatus,
  backendQuerySearchLobby,
  backendQueryUserCards,
  backendQueryUserLobbies,
  backendQueryUserPacks,
  backendQueryUserStats,
  backendQueryUserTradeNfts,
} from '../helpers/query-constructors';
import type {
  LobbyStates,
  NewLobbies,
  PackedLobbyRaw,
  PackedLobbyState,
  PackedRoundExecutionState,
  PackedUserLobbies,
  PackedUserStats,
} from '../types';
import type { WalletAddress } from 'paima-sdk/paima-utils';
import type { IGetPaginatedUserLobbiesResult } from '@cards/db';
import type {
  IGetBoughtPacksResult,
  IGetCardsByIdsResult,
  IGetOwnedCardsResult,
  IGetTradeNftsResult,
} from '@cards/db/build/select.queries';

async function getLobbyRaw(lobbyID: string): Promise<PackedLobbyRaw | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getLobbyRaw');

  let packedLobbyRaw: PackedLobbyRaw | FailedResult;

  try {
    packedLobbyRaw = await auxGetLobbyRaw(lobbyID);

    if (!packedLobbyRaw.success) {
      return errorFxn(packedLobbyRaw.errorMessage);
    }
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const { lobby } = packedLobbyRaw;

    return {
      success: true,
      lobby,
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getLobbyState(lobbyID: string): Promise<PackedLobbyState | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getLobbyState');

  let packedLobbyState: PackedLobbyState | FailedResult;

  try {
    packedLobbyState = await auxGetLobbyState(lobbyID);

    if (!packedLobbyState.success) {
      return errorFxn(packedLobbyState.errorMessage);
    }
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const { lobby } = packedLobbyState;

    return {
      success: true,
      lobby,
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getLobbySearch(
  nftId: number,
  searchQuery: string,
  page: number,
  count?: number
): Promise<LobbyStates | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getLobbySearch');

  let response: Response;
  try {
    const query = backendQuerySearchLobby(nftId, searchQuery, page, count);
    response = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = (await response.json()) as { lobbies: LobbyState[] };
    return {
      success: true,
      lobbies: j.lobbies,
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getRoundExecutionState(
  lobbyID: string,
  matchWithinLobby: number,
  roundWithinMatch: number
): Promise<PackedRoundExecutionState | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getRoundExecutionState');

  let res: Response;
  let latestBlockHeight: number;

  try {
    const query = backendQueryRoundStatus(lobbyID, matchWithinLobby, roundWithinMatch);
    [res, latestBlockHeight] = await Promise.all([fetch(query), getBlockNumber()]);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const roundStatus = (await res.json()) as RoundStatusData;

    const { roundStarted: start, roundLength: length } = roundStatus;
    const end = calculateRoundEnd(start, length, latestBlockHeight);
    return {
      success: true,
      round: {
        executed: roundStatus.executed,
        usersWhoSubmittedMoves: roundStatus.usersWhoSubmittedMoves,
        roundEndsInBlocks: end.blocks,
        roundEndsInSeconds: end.seconds,
      },
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getUserStats(nftId: number): Promise<PackedUserStats | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getUserStats');

  let res: Response;
  try {
    const query = backendQueryUserStats(nftId);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = (await res.json()) as { stats: UserStats };
    return {
      success: true,
      stats: j.stats,
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getNewLobbies(
  nftId: number,
  blockHeight: number
): Promise<NewLobbies | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getNewLobbies');
  try {
    return getRawNewLobbies(nftId, blockHeight);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.UNKNOWN, err);
  }
}

async function getUserLobbiesMatches(
  nftId: number,
  page: number,
  count?: number
): Promise<PackedUserLobbies | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getUserLobbiesMatches');

  let res: Response;
  try {
    const query = backendQueryUserLobbies(nftId, count, page);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = (await res.json()) as { lobbies: IGetPaginatedUserLobbiesResult[] };
    return {
      success: true,
      lobbies: j.lobbies,
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getOpenLobbies(
  nftId: number,
  page: number,
  count?: number
): Promise<LobbyStates | FailedResult> {
  const errorFxn = buildEndpointErrorFxn('getOpenLobbies');

  let res: Response;
  try {
    const query = backendQueryOpenLobbies(nftId, count, page);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const j = (await res.json()) as { lobbies: LobbyState[] };
    return {
      success: true,
      lobbies: j.lobbies,
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getRoundExecutor(
  lobbyId: string,
  matchWithinLobby: number,
  roundWithinMatch: number,
  matchState: MatchState
): Promise<Result<RoundExecutor<MatchState, TickEvent>>> {
  const errorFxn = buildEndpointErrorFxn('getRoundExecutor');

  // Retrieve data:
  let res: Response;
  try {
    const query = backendQueryRoundExecutor(lobbyId, matchWithinLobby, roundWithinMatch);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  let backendData: RoundExecutorBackendData;
  try {
    backendData = (await res.json()) as RoundExecutorBackendData;
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }

  // Process data:
  try {
    const executor = buildRoundExecutor({
      ...backendData,
      matchState,
    });
    return {
      success: true,
      result: executor,
    };
  } catch (err) {
    return errorFxn(MiddlewareErrorCode.UNABLE_TO_BUILD_EXECUTOR, err);
  }
}

async function getMatchExecutor(
  lobbyId: string,
  matchWithinLobby: number
): Promise<Result<MatchExecutor<MatchState, TickEvent>>> {
  const errorFxn = buildEndpointErrorFxn('getMatchExecutor');

  // Retrieve data:
  let res: Response;
  try {
    const query = backendQueryMatchExecutor(lobbyId, matchWithinLobby);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  let data: MatchExecutorData;
  try {
    data = (await res.json()) as MatchExecutorData;
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }

  // Process data:
  try {
    const executor = buildMatchExecutor(data);
    return {
      success: true,
      result: executor,
    };
  } catch (err) {
    return errorFxn(MiddlewareErrorCode.UNABLE_TO_BUILD_EXECUTOR, err);
  }
}

async function getNftForWallet(wallet: WalletAddress): Promise<Result<undefined | number>> {
  const errorFxn = buildEndpointErrorFxn('getNftForLobby');

  let res: Response;
  try {
    const query = backendQueryNftsForWallet(wallet);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const nft = (await res.json()) as { nft: undefined | number };
    return {
      success: true,
      result: nft.nft,
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getUserCards(nftId: number): Promise<Result<IGetOwnedCardsResult[]>> {
  const errorFxn = buildEndpointErrorFxn('getUserCards');

  let res: Response;
  try {
    const query = backendQueryUserCards(nftId);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const cards = (await res.json()) as { cards: IGetOwnedCardsResult[] };
    return {
      success: true,
      result: cards.cards,
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getUserPacks(nftId: number): Promise<Result<IGetBoughtPacksResult[]>> {
  const errorFxn = buildEndpointErrorFxn('getUserPacks');

  let res: Response;
  try {
    const query = backendQueryUserPacks(nftId);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const packs = (await res.json()) as { packs: IGetBoughtPacksResult[] };
    return {
      success: true,
      result: packs.packs,
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

async function getUserTradeNfts(nftId: number): Promise<
  Result<{
    tradeNfts: IGetTradeNftsResult[];
    cardLookup: Record<string, IGetCardsByIdsResult>;
  }>
> {
  const errorFxn = buildEndpointErrorFxn('getUserTradeNfts');

  let res: Response;
  try {
    const query = backendQueryUserTradeNfts(nftId);
    res = await fetch(query);
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.ERROR_QUERYING_BACKEND_ENDPOINT, err);
  }

  try {
    const tradeNfts = (await res.json()) as {
      tradeNfts: IGetTradeNftsResult[];
      cardLookup: Record<string, IGetCardsByIdsResult>;
    };
    return {
      success: true,
      result: tradeNfts,
    };
  } catch (err) {
    return errorFxn(PaimaMiddlewareErrorCode.INVALID_RESPONSE_FROM_BACKEND, err);
  }
}

export const queryEndpoints = {
  getUserStats,
  getLobbyRaw,
  getLobbyState,
  getLobbySearch,
  getRoundExecutionState,
  getOpenLobbies,
  getUserLobbiesMatches,
  getNewLobbies,
  getRoundExecutor,
  getMatchExecutor,
  getNftForWallet,
  getUserCards,
  getUserPacks,
  getUserTradeNfts,
};
