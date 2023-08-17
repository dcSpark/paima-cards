import { Controller, Get, Query, Route, ValidateError } from 'tsoa';
import { requirePool, getLobbyById, getMatchSeeds, getLobbyPlayers } from '@cards/db';
import type { MatchExecutorResponse, LobbyPlayer, RoundExecutorResponse } from '@cards/game-logic';
import {
  deserializeBoardCard,
  deserializeHandCard,
  deserializeMove,
  isLobbyWithStateProps,
} from '@cards/game-logic';
import { psqlInt } from '../validation';
import { isLeft } from 'fp-ts/lib/Either';
import { getMatch, getMatchMoves, getRound, getRoundMoves } from '@cards/db/src/select.queries';
import { getBlockHeight } from 'paima-sdk/paima-db';

@Route('executor')
export class ExecutorController extends Controller {
  @Get('match')
  public async match(
    @Query() lobbyID: string,
    @Query() matchWithinLobby: number
  ): Promise<MatchExecutorResponse> {
    const valMatch = psqlInt.decode(matchWithinLobby);
    if (isLeft(valMatch)) {
      throw new ValidateError({ round: { message: 'invalid number' } }, '');
    }

    const pool = requirePool();
    const [lobby] = await getLobbyById.run({ lobby_id: lobbyID }, pool);
    const [match] = await getMatch.run(
      { lobby_id: lobbyID, match_within_lobby: matchWithinLobby },
      pool
    );
    const rawPlayers = await getLobbyPlayers.run({ lobby_id: lobbyID }, pool);
    if (lobby == null || !isLobbyWithStateProps(lobby) || match == null) {
      return null;
    }
    const players: LobbyPlayer[] = rawPlayers.map(raw => ({
      nftId: raw.nft_id,
      hitPoints: raw.hit_points,
      startingCommitments: raw.starting_commitments,
      currentDeck: raw.current_deck,
      currentHand: raw.current_hand.map(deserializeHandCard),
      currentBoard: raw.current_board.map(deserializeBoardCard),
      currentDraw: raw.current_draw,
      currentResult: raw.current_result ?? undefined,
      botLocalDeck: undefined,
      turn: raw.turn ?? undefined,
    }));

    const txEventMove =
      lobby.current_tx_event_move == null
        ? undefined
        : deserializeMove(lobby.current_tx_event_move);

    const [initialSeed] = await getBlockHeight.run(
      { block_height: match.starting_block_height },
      pool
    );
    const matchSeeds = await getMatchSeeds.run(
      { lobby_id: lobbyID, match_within_lobby: matchWithinLobby },
      pool
    );
    const seeds = matchSeeds.map((seed, i) => ({
      seed: i === 0 ? initialSeed.seed : matchSeeds[i - 1].seed,
      block_height: seed.block_height,
      round: seed.round_within_match,
    }));

    const moves = await getMatchMoves.run(
      { lobby_id: lobbyID, match_within_lobby: matchWithinLobby },
      pool
    );

    return {
      lobby: {
        ...lobby,
        roundSeed: initialSeed.seed,
        players,
        txEventMove,
      },
      seeds,
      moves,
    };
  }

  @Get('round')
  public async round(
    @Query() lobbyID: string,
    @Query() matchWithinLobby: number,
    @Query() roundWithinMatch: number
  ): Promise<RoundExecutorResponse> {
    const valMatch = psqlInt.decode(matchWithinLobby);
    if (isLeft(valMatch)) {
      throw new ValidateError({ matchWithinLobby: { message: 'invalid number' } }, '');
    }
    const valRound = psqlInt.decode(roundWithinMatch);
    if (isLeft(valRound)) {
      throw new ValidateError({ roundWithinMatch: { message: 'invalid number' } }, '');
    }

    const pool = requirePool();
    const [lobby] = await getLobbyById.run({ lobby_id: lobbyID }, pool);
    const [match] = await getMatch.run(
      { lobby_id: lobbyID, match_within_lobby: matchWithinLobby },
      pool
    );
    if (!lobby) {
      return { error: 'lobby not found' };
    }
    if (match == null) {
      return { error: 'match not found' };
    }

    const [last_round_data] =
      roundWithinMatch === 0
        ? [undefined]
        : await getRound.run(
            {
              lobby_id: lobbyID,
              match_within_lobby: matchWithinLobby,
              round_within_match: roundWithinMatch - 1,
            },
            pool
          );

    const seedBlockHeight =
      roundWithinMatch === 0
        ? match.starting_block_height
        : last_round_data?.execution_block_height;
    if (seedBlockHeight == null) {
      return { error: 'internal error' };
    }

    const [seedBlockRow] = await getBlockHeight.run({ block_height: seedBlockHeight }, pool);
    const seed = seedBlockRow.seed;
    const moves = await getRoundMoves.run(
      {
        lobby_id: lobbyID,
        match_within_lobby: matchWithinLobby,
        round_within_match: roundWithinMatch,
      },
      pool
    );
    return {
      lobby,
      moves,
      seed,
    };
  }
}
