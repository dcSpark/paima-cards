import type { ValuesType } from 'utility-types';
import type { MOVE_KIND, TICK_EVENT_KIND } from './constants';

import type {
  IGetLobbyByIdResult,
  IGetUserStatsResult,
  IGetNewLobbiesByUserAndBlockHeightResult,
} from '@cards/db';
import type { IGetMatchMovesResult } from '@cards/db/build/select.queries';
import type { PropertiesNonNullable } from '@cards/utils';

export type CardDraw = {
  card: undefined | HandCard;
  newDeck: CardCommitmentIndex[];
};

export type TickEventKind = ValuesType<typeof TICK_EVENT_KIND>;

export type TxTickEvent = {
  kind: typeof TICK_EVENT_KIND.tx;
  move: Move;
};
export type PostTxTickEvent = {
  kind: typeof TICK_EVENT_KIND.postTx;
  draw: CardDraw;
};
export type PlayCardTickEvent = {
  kind: typeof TICK_EVENT_KIND.playCard;
  handPosition: number;
  newHand: HandCard[];
  newBoard: BoardCard[];
};
export type DestroyCardTickEvent = {
  kind: typeof TICK_EVENT_KIND.destroyCard;
  fromBoardPosition: number;
  toBoardPosition: number;
  newFromBoard: BoardCard[];
  newToBoard: BoardCard[];
};
export type TurnEndTickEvent = {
  kind: typeof TICK_EVENT_KIND.turnEnd;
  damageDealt: number;
};
export type RoundEndTickEvent = {
  kind: typeof TICK_EVENT_KIND.roundEnd;
};
export type MatchEndTickEvent = {
  kind: typeof TICK_EVENT_KIND.matchEnd;
  result: MatchResult;
};

export type TickEvent =
  | TxTickEvent
  | PostTxTickEvent
  | PlayCardTickEvent
  | DestroyCardTickEvent
  | TurnEndTickEvent
  | RoundEndTickEvent
  | MatchEndTickEvent;

export interface MatchEnvironment {
  practice: boolean;
  numberOfRounds: number;
}

export interface MatchState {
  players: LobbyPlayer[];
  // Round that is displayed to users (consists of everyone taking a turn).
  // Not to be confused with round everywhere else (1 move + 1 random seed).
  properRound: number;
  turn: number; // whose turn is it
  result: undefined | MatchResult;
  // Move that required a tx submission. It it was for new randomness,
  // we'll want to provide new randomness in postTx event (e.g. decide to draw a card).
  txEventMove: undefined | Move;
}

export type LobbyStatus = 'open' | 'active' | 'finished' | 'closed';

export type ConciseResult = 'w' | 't' | 'l';

export type MatchResult = ConciseResult[];

export interface RoundExecutorBackendData {
  lobby: IGetLobbyByIdResult;
  moves: IGetMatchMovesResult[];
  seed: string;
}

export interface RoundExecutorData extends RoundExecutorBackendData {
  matchState: MatchState;
}

interface ExecutorDataSeed {
  seed: string;
  block_height: number;
  round: number;
}

export interface MatchExecutorData {
  lobby: LobbyState;
  moves: IGetMatchMovesResult[];
  seeds: ExecutorDataSeed[];
}

export interface BaseRoundStatus {
  executed: boolean;
  usersWhoSubmittedMoves: number[];
}

export interface RoundStatusData extends BaseRoundStatus {
  roundStarted: number; // blockheight
  roundLength: number;
}

export type UserStats = IGetUserStatsResult;

export type NewLobby = IGetNewLobbiesByUserAndBlockHeightResult;

export type LobbyPlayer = {
  nftId: number;
  hitPoints: number;
  readonly startingCommitments: Uint8Array;
  currentDeck: number[]; // indices
  currentHand: HandCard[];
  currentBoard: BoardCard[];
  currentDraw: number;
  botLocalDeck: undefined | LocalCard[]; // only defined for bot player
  turn: undefined | number;
};

type LobbyStateProps = 'current_match' | 'current_round' | 'current_turn' | 'current_proper_round';
export type LobbyWithStateProps = Omit<IGetLobbyByIdResult, LobbyStateProps> &
  PropertiesNonNullable<Pick<IGetLobbyByIdResult, LobbyStateProps>>;

export interface LobbyState extends LobbyWithStateProps {
  roundSeed: string;
  players: LobbyPlayer[];
  txEventMove: undefined | Move;
}

/** Uniquely identifies a card owned by a player globally */
export type CardDbId = number;
/** Identifies type of card (e.g. 47 -> Queen of Spades) */
export type CardRegistryId = number;
/** Index in starting commitments, i.e. in starting deck */
export type CardCommitmentIndex = number;
/** The sequential position among all cards drawn in some match by some player */
export type DrawIndex = number;

export type LocalCard = {
  id: CardDbId;
  registryId: CardRegistryId;
  salt: string;
};
export type SerializedLocalCard = string;

export type HandCard = {
  index: CardCommitmentIndex;
  draw: DrawIndex;
};
export type SerializedHandCard = string;

export type BoardCard = {
  id: CardDbId;
  index: CardCommitmentIndex;
  registryId: CardRegistryId;
  // Note: If the game had something like health points on board cards, it should be implemented same as this.
  // A card has a constant amount of hp in the registry + buffs/modifiers, and one of them is missing hp.
  hasAttack: boolean;
};
export type SerializedBoardCard = string;

/**
 * List of cards and their properties.
 * This gets packaged into backend. It's a bad idea to store skins here.
 * Make a separate frontend registry instead.
 */
export type RegistryCard = {
  // recall: we're doing rock, paper, scissors
  defeats: CardRegistryId;
};
export type CardRegistry = Record<CardRegistryId, RegistryCard>;

export type MoveKind = ValuesType<typeof MOVE_KIND>;
export type Move =
  | {
      kind: typeof MOVE_KIND.endTurn;
    }
  | {
      kind: typeof MOVE_KIND.playCard;
      handPosition: number;
      cardIndex: CardCommitmentIndex;
      cardId: CardDbId;
      cardRegistryId: CardRegistryId;
      salt: string;
    }
  | {
      kind: typeof MOVE_KIND.targetCardWithBoardCard;
      fromBoardPosition: number; // own
      toBoardPosition: number; // opponent's
    };
export type SerializedMove = string;
