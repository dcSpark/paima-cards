import { Controller, Get, Query, Route, ValidateError } from 'tsoa';
import { getLobbyById, getLobbyPlayers, requirePool } from '@cards/db';
import type {
  LobbyPlayer,
  LobbyStateResponse,
  OpenLobbiesResponse,
  RandomActiveLobbyResponse,
  SearchOpenLobbiesResponse,
  UserLobbiesBlockHeightResponse,
  UserLobbiesResponse,
} from '@cards/game-logic';
import {
  deserializeBoardCard,
  deserializeHandCard,
  deserializeMove,
  isLobbyWithStateProps,
  type LobbyRawResponse,
} from '@cards/game-logic';
import {
  getAllPaginatedUserLobbies,
  getMatch,
  getNewLobbiesByUserAndBlockHeight,
  getOpenLobbyById,
  getPaginatedOpenLobbies,
  getRandomActiveLobby,
  getRound,
  searchPaginatedOpenLobbies,
} from '@cards/db/src/select.queries';
import { getBlockHeight } from 'paima-sdk/paima-db';
import { isLeft } from 'fp-ts/lib/Either';
import { psqlNum } from '../validation';

const MIN_SEARCH_LENGTH = 3;
const LOBBY_ID_LENGTH = 12;

@Route('lobby')
export class LobbyController extends Controller {
  @Get('raw')
  public async raw(@Query() lobbyID: string): Promise<LobbyRawResponse> {
    const pool = requirePool();
    const [lobby] = await getLobbyById.run({ lobby_id: lobbyID }, pool);
    return { lobby };
  }

  @Get('state')
  public async state(@Query() lobbyID: string): Promise<LobbyStateResponse> {
    const pool = requirePool();
    const [[lobby], rawPlayers] = await Promise.all([
      getLobbyById.run({ lobby_id: lobbyID }, pool),
      getLobbyPlayers.run({ lobby_id: lobbyID }, pool),
    ]);
    if (!lobby) return { lobby: null };

    if (!isLobbyWithStateProps(lobby)) return { lobby: null };

    const [match] = await getMatch.run(
      {
        lobby_id: lobbyID,
        match_within_lobby: lobby.current_match,
      },
      pool
    );

    const [last_round_data] =
      lobby.current_round === 0
        ? [undefined]
        : await getRound.run(
            {
              lobby_id: lobbyID,
              match_within_lobby: lobby.current_match,
              round_within_match: lobby.current_round - 1,
            },
            pool
          );

    const seedBlockHeight =
      lobby.current_round === 0
        ? match.starting_block_height
        : last_round_data?.execution_block_height;

    if (seedBlockHeight == null) {
      return { lobby: null };
    }
    const [seedBlockRow] = await getBlockHeight.run({ block_height: seedBlockHeight }, pool);
    const roundSeed = seedBlockRow.seed;

    const players: LobbyPlayer[] = rawPlayers.map(raw => ({
      nftId: raw.nft_id,
      hitPoints: raw.hit_points,
      startingCommitments: raw.starting_commitments,
      currentDeck: raw.current_deck,
      currentHand: raw.current_hand.map(deserializeHandCard),
      currentBoard: raw.current_board.map(deserializeBoardCard),
      currentDraw: raw.current_draw,
      botLocalDeck: undefined,
      turn: raw.turn ?? undefined,
    }));

    const txEventMove =
      lobby.current_tx_event_move == null
        ? undefined
        : deserializeMove(lobby.current_tx_event_move);

    return {
      lobby: {
        ...lobby,
        roundSeed,
        players,
        txEventMove,
      },
    };
  }

  @Get('open')
  public async open(
    @Query() nftId: number,
    @Query() count?: number,
    @Query() page?: number
  ): Promise<OpenLobbiesResponse> {
    const pool = requirePool();
    const valPage = psqlNum.decode(page || 1); // pass 1 if undefined (or 0)
    const valCount = psqlNum.decode(count || 10); // pass 10 if undefined (or 0)
    // io-ts output typecheck. isLeft() is invalid, isRight() is valid
    // we'll reuse TSOA's error handling logic to throw an error
    if (isLeft(valPage)) {
      throw new ValidateError({ page: { message: 'invalid number' } }, '');
    } else if (isLeft(valCount)) {
      throw new ValidateError({ count: { message: 'invalid number' } }, '');
    } else {
      const p = valPage.right;
      const c = valCount.right;
      const offset = (p - 1) * c;
      const lobbies = await getPaginatedOpenLobbies.run(
        { count: `${c}`, page: `${offset}`, nft_id: nftId },
        pool
      );

      return { lobbies };
    }
  }

  @Get('randomActive')
  public async randomActive(): Promise<RandomActiveLobbyResponse> {
    const pool = requirePool();
    const [lobby] = await getRandomActiveLobby.run(undefined, pool);
    const result = lobby || null;
    return { lobby: result };
  }

  @Get('searchOpen')
  public async searchOpen(
    @Query() nftId: number,
    @Query() searchQuery: string,
    @Query() page?: number,
    @Query() count?: number
  ): Promise<SearchOpenLobbiesResponse> {
    const pool = requirePool();
    const emptyResponse = { lobbies: [] };
    if (searchQuery.length < MIN_SEARCH_LENGTH || searchQuery.length > LOBBY_ID_LENGTH)
      return emptyResponse;

    if (searchQuery.length == LOBBY_ID_LENGTH) {
      const lobbies = await getOpenLobbyById.run({ searchQuery, nft_id: nftId }, pool);
      return { lobbies };
    }

    const valPage = psqlNum.decode(page || 1); // pass 1 if undefined (or 0)
    const valCount = psqlNum.decode(count || 10); // pass 10 if undefined (or 0)
    // io-ts output typecheck. isLeft() is invalid, isRight() is valid
    // we'll reuse TSOA's error handling logic to throw an error
    if (isLeft(valPage)) {
      throw new ValidateError({ page: { message: 'invalid number' } }, '');
    }

    if (isLeft(valCount)) {
      throw new ValidateError({ count: { message: 'invalid number' } }, '');
    }

    const c = valCount.right;
    const offset = (valPage.right - 1) * c;
    const lobbies = await searchPaginatedOpenLobbies.run(
      { count: `${c}`, page: `${offset}`, searchQuery: `%${searchQuery}%`, nft_id: nftId },
      pool
    );
    return { lobbies };
  }

  @Get('user')
  public async user(
    @Query() nftId: number,
    @Query() count?: number,
    @Query() page?: number
  ): Promise<UserLobbiesResponse> {
    const pool = requirePool();
    const valPage = psqlNum.decode(page || 1); // pass 1 if undefined (or 0)
    const valCount = psqlNum.decode(count || 10); // pass 10 if undefined (or 0)
    // io-ts output typecheck. isLeft() is invalid, isRight() is valid
    // we'll reuse TSOA's error handling logic to throw an error
    if (isLeft(valPage)) {
      throw new ValidateError({ page: { message: 'invalid number' } }, '');
    }
    if (isLeft(valCount)) {
      throw new ValidateError({ count: { message: 'invalid number' } }, '');
    }

    // after typecheck, valid data output is given in .right
    const p = valPage.right;
    const c = valCount.right;
    const offset = (p - 1) * c;
    const userLobbies = await getAllPaginatedUserLobbies.run(
      { nft_id: nftId, count: `${c}`, page: `${offset}` },
      pool
    );
    return { lobbies: userLobbies };
  }

  @Get('userBlockHeight')
  public async userBlockHeight(
    @Query() nftId: number,
    @Query() blockHeight: number
  ): Promise<UserLobbiesBlockHeightResponse> {
    const pool = requirePool();
    const valBH = psqlNum.decode(blockHeight);
    if (isLeft(valBH)) {
      throw new ValidateError({ blockHeight: { message: 'invalid number' } }, '');
    }

    const lobbies = await getNewLobbiesByUserAndBlockHeight.run(
      { nft_id: nftId, block_height: blockHeight },
      pool
    );
    return { lobbies };
  }
}
