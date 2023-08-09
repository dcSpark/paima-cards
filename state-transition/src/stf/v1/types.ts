import type { CardDbId, ConciseResult, SerializedMove } from '@cards/game-logic';
import type { WalletAddress } from 'paima-sdk/paima-utils';

export type ParsedSubmittedInputRaw =
  | NftMintInput
  | TradeNftMintInput
  | CreatedLobbyInput
  | JoinedLobbyInput
  | ClosedLobbyInput
  | SubmittedMovesInput
  | PracticeMovesInput
  | ScheduledDataInput
  | InvalidInput
  | SetTradeNftCardsInput;

export type ParsedSubmittedInput =
  | NftMintInput
  | TradeNftMintInput
  | GenericPaymentInput
  | CreatedLobbyInput
  | JoinedLobbyInput
  | ClosedLobbyInput
  | SubmittedMovesInput
  | PracticeMovesInput
  | ScheduledDataInput
  | InvalidInput
  | SetTradeNftCardsInput
  | TransferTradeNftInput;

export interface InvalidInput {
  input: 'invalidString';
}

export interface NftMintInput {
  input: 'accountMint';
  tokenId: string;
  // contract address
  address: WalletAddress;
}

export interface TradeNftMintInput {
  input: 'tradeNftMint';
  tokenId: string;
  // contract address
  address: WalletAddress;
}

export interface GenericPaymentInput {
  input: 'genericPayment';
  message: string;
  payer: WalletAddress;
  amount: bigint;
}

export interface TransferTradeNftInput {
  input: 'transferTradeNft';
  from: WalletAddress;
  to: WalletAddress;
  tradeNftId: number;
}

export interface CreatedLobbyInput {
  input: 'createdLobby';
  creatorNftId: number;
  creatorCommitments: Uint8Array;
  numOfRounds: number;
  roundLength: number;
  playTimePerPlayer: number;
  isHidden: boolean;
  isPractice: boolean;
}

export interface JoinedLobbyInput {
  input: 'joinedLobby';
  nftId: number;
  commitments: Uint8Array;
  lobbyID: string;
}

export interface ClosedLobbyInput {
  input: 'closedLobby';
  lobbyID: string;
}

export interface SubmittedMovesInput {
  input: 'submittedMoves';
  nftId: number;
  lobbyID: string;
  matchWithinLobby: number;
  roundWithinMatch: number;
  move: SerializedMove;
}

export interface PracticeMovesInput {
  input: 'practiceMoves';
  lobbyID: string;
  matchWithinLobby: number;
  roundWithinMatch: number;
}

export interface ScheduledDataInput {
  input: 'scheduledData';
}

export interface ZombieRound extends ScheduledDataInput {
  effect: 'zombie';
  lobbyID: string;
}

export interface UserStats extends ScheduledDataInput {
  effect: 'stats';
  nftId: number;
  result: ConciseResult;
}

export interface SetTradeNftCardsInput {
  input: 'setTradeNftCards';
  tradeNftId: number;
  cards: CardDbId[];
}

export function isZombieRound(input: ScheduledDataInput): input is ZombieRound {
  return (input as ZombieRound).effect === 'zombie';
}

export function isUserStats(input: ScheduledDataInput): input is UserStats {
  return (input as UserStats).effect === 'stats';
}
