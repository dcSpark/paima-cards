/** Types generated for queries found in "src/queries/insert.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type lobby_status = 'active' | 'closed' | 'finished' | 'open';

export type numberArray = (number)[];

export type stringArray = (string)[];

/** 'CreateLobby' parameters type */
export interface ICreateLobbyParams {
  created_at: Date;
  creation_block_height: number;
  hidden: boolean;
  lobby_creator: number;
  lobby_id: string;
  lobby_state: lobby_status;
  max_players: number;
  num_of_rounds: number;
  play_time_per_player: number;
  practice: boolean;
  round_length: number;
}

/** 'CreateLobby' return type */
export type ICreateLobbyResult = void;

/** 'CreateLobby' query type */
export interface ICreateLobbyQuery {
  params: ICreateLobbyParams;
  result: ICreateLobbyResult;
}

const createLobbyIR: any = {"usedParamSet":{"lobby_id":true,"max_players":true,"num_of_rounds":true,"round_length":true,"play_time_per_player":true,"creation_block_height":true,"created_at":true,"hidden":true,"practice":true,"lobby_creator":true,"lobby_state":true},"params":[{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":209,"b":218}]},{"name":"max_players","required":true,"transform":{"type":"scalar"},"locs":[{"a":223,"b":235}]},{"name":"num_of_rounds","required":true,"transform":{"type":"scalar"},"locs":[{"a":240,"b":254}]},{"name":"round_length","required":true,"transform":{"type":"scalar"},"locs":[{"a":259,"b":272}]},{"name":"play_time_per_player","required":true,"transform":{"type":"scalar"},"locs":[{"a":277,"b":298}]},{"name":"creation_block_height","required":true,"transform":{"type":"scalar"},"locs":[{"a":303,"b":325}]},{"name":"created_at","required":true,"transform":{"type":"scalar"},"locs":[{"a":330,"b":341}]},{"name":"hidden","required":true,"transform":{"type":"scalar"},"locs":[{"a":346,"b":353}]},{"name":"practice","required":true,"transform":{"type":"scalar"},"locs":[{"a":358,"b":367}]},{"name":"lobby_creator","required":true,"transform":{"type":"scalar"},"locs":[{"a":372,"b":386}]},{"name":"lobby_state","required":true,"transform":{"type":"scalar"},"locs":[{"a":391,"b":403}]}],"statement":"INSERT INTO lobbies(\n  lobby_id,\n  max_players,\n  num_of_rounds,\n  round_length,\n  play_time_per_player,\n  creation_block_height,\n  created_at,\n  hidden,\n  practice,\n  lobby_creator,\n  lobby_state\n)\nVALUES(\n  :lobby_id!,\n  :max_players!,\n  :num_of_rounds!,\n  :round_length!,\n  :play_time_per_player!,\n  :creation_block_height!,\n  :created_at!,\n  :hidden!,\n  :practice!,\n  :lobby_creator!,\n  :lobby_state!\n)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO lobbies(
 *   lobby_id,
 *   max_players,
 *   num_of_rounds,
 *   round_length,
 *   play_time_per_player,
 *   creation_block_height,
 *   created_at,
 *   hidden,
 *   practice,
 *   lobby_creator,
 *   lobby_state
 * )
 * VALUES(
 *   :lobby_id!,
 *   :max_players!,
 *   :num_of_rounds!,
 *   :round_length!,
 *   :play_time_per_player!,
 *   :creation_block_height!,
 *   :created_at!,
 *   :hidden!,
 *   :practice!,
 *   :lobby_creator!,
 *   :lobby_state!
 * )
 * ```
 */
export const createLobby = new PreparedQuery<ICreateLobbyParams,ICreateLobbyResult>(createLobbyIR);


/** 'JoinPlayerToLobby' parameters type */
export interface IJoinPlayerToLobbyParams {
  bot_local_deck: stringArray | null | void;
  current_deck: numberArray;
  lobby_id: string;
  nft_id: number;
  starting_commitments: Buffer;
}

/** 'JoinPlayerToLobby' return type */
export type IJoinPlayerToLobbyResult = void;

/** 'JoinPlayerToLobby' query type */
export interface IJoinPlayerToLobbyQuery {
  params: IJoinPlayerToLobbyParams;
  result: IJoinPlayerToLobbyResult;
}

const joinPlayerToLobbyIR: any = {"usedParamSet":{"lobby_id":true,"nft_id":true,"starting_commitments":true,"current_deck":true,"bot_local_deck":true},"params":[{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":117,"b":126}]},{"name":"nft_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":131,"b":138}]},{"name":"starting_commitments","required":true,"transform":{"type":"scalar"},"locs":[{"a":143,"b":164}]},{"name":"current_deck","required":true,"transform":{"type":"scalar"},"locs":[{"a":169,"b":182}]},{"name":"bot_local_deck","required":false,"transform":{"type":"scalar"},"locs":[{"a":187,"b":201}]}],"statement":"INSERT INTO lobby_player(\n  lobby_id,\n  nft_id,\n  starting_commitments,\n  current_deck,\n  bot_local_deck\n)\nVALUES(\n  :lobby_id!,\n  :nft_id!,\n  :starting_commitments!,\n  :current_deck!,\n  :bot_local_deck\n)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO lobby_player(
 *   lobby_id,
 *   nft_id,
 *   starting_commitments,
 *   current_deck,
 *   bot_local_deck
 * )
 * VALUES(
 *   :lobby_id!,
 *   :nft_id!,
 *   :starting_commitments!,
 *   :current_deck!,
 *   :bot_local_deck
 * )
 * ```
 */
export const joinPlayerToLobby = new PreparedQuery<IJoinPlayerToLobbyParams,IJoinPlayerToLobbyResult>(joinPlayerToLobbyIR);


/** 'NewMatch' parameters type */
export interface INewMatchParams {
  lobby_id: string;
  match_within_lobby: number;
  starting_block_height: number;
}

/** 'NewMatch' return type */
export interface INewMatchResult {
  id: number;
  lobby_id: string;
  match_within_lobby: number;
  starting_block_height: number;
}

/** 'NewMatch' query type */
export interface INewMatchQuery {
  params: INewMatchParams;
  result: INewMatchResult;
}

const newMatchIR: any = {"usedParamSet":{"lobby_id":true,"match_within_lobby":true,"starting_block_height":true},"params":[{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":96,"b":105}]},{"name":"match_within_lobby","required":true,"transform":{"type":"scalar"},"locs":[{"a":110,"b":129}]},{"name":"starting_block_height","required":true,"transform":{"type":"scalar"},"locs":[{"a":134,"b":156}]}],"statement":"INSERT INTO lobby_match(\n  lobby_id,\n  match_within_lobby,\n  starting_block_height\n)\nVALUES (\n  :lobby_id!,\n  :match_within_lobby!,\n  :starting_block_height!\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO lobby_match(
 *   lobby_id,
 *   match_within_lobby,
 *   starting_block_height
 * )
 * VALUES (
 *   :lobby_id!,
 *   :match_within_lobby!,
 *   :starting_block_height!
 * )
 * RETURNING *
 * ```
 */
export const newMatch = new PreparedQuery<INewMatchParams,INewMatchResult>(newMatchIR);


/** 'NewRound' parameters type */
export interface INewRoundParams {
  execution_block_height: number | null | void;
  lobby_id: string;
  match_within_lobby: number;
  round_within_match: number;
  starting_block_height: number;
}

/** 'NewRound' return type */
export interface INewRoundResult {
  execution_block_height: number | null;
  id: number;
  lobby_id: string;
  match_within_lobby: number;
  round_within_match: number;
  starting_block_height: number;
}

/** 'NewRound' query type */
export interface INewRoundQuery {
  params: INewRoundParams;
  result: INewRoundResult;
}

const newRoundIR: any = {"usedParamSet":{"lobby_id":true,"match_within_lobby":true,"round_within_match":true,"starting_block_height":true,"execution_block_height":true},"params":[{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":144,"b":153}]},{"name":"match_within_lobby","required":true,"transform":{"type":"scalar"},"locs":[{"a":158,"b":177}]},{"name":"round_within_match","required":true,"transform":{"type":"scalar"},"locs":[{"a":182,"b":201}]},{"name":"starting_block_height","required":true,"transform":{"type":"scalar"},"locs":[{"a":206,"b":228}]},{"name":"execution_block_height","required":false,"transform":{"type":"scalar"},"locs":[{"a":233,"b":255}]}],"statement":"INSERT INTO match_round(\n  lobby_id,\n  match_within_lobby,\n  round_within_match,\n  starting_block_height,\n  execution_block_height\n)\nVALUES (\n  :lobby_id!,\n  :match_within_lobby!,\n  :round_within_match!,\n  :starting_block_height!,\n  :execution_block_height\n)\nRETURNING *"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO match_round(
 *   lobby_id,
 *   match_within_lobby,
 *   round_within_match,
 *   starting_block_height,
 *   execution_block_height
 * )
 * VALUES (
 *   :lobby_id!,
 *   :match_within_lobby!,
 *   :round_within_match!,
 *   :starting_block_height!,
 *   :execution_block_height
 * )
 * RETURNING *
 * ```
 */
export const newRound = new PreparedQuery<INewRoundParams,INewRoundResult>(newRoundIR);


/** 'NewMove' parameters type */
export interface INewMoveParams {
  lobby_id: string;
  match_within_lobby: number;
  move_within_round: number;
  nft_id: number;
  round_within_match: number;
  serialized_move: string;
}

/** 'NewMove' return type */
export type INewMoveResult = void;

/** 'NewMove' query type */
export interface INewMoveQuery {
  params: INewMoveParams;
  result: INewMoveResult;
}

const newMoveIR: any = {"usedParamSet":{"lobby_id":true,"match_within_lobby":true,"round_within_match":true,"move_within_round":true,"nft_id":true,"serialized_move":true},"params":[{"name":"lobby_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":142,"b":151}]},{"name":"match_within_lobby","required":true,"transform":{"type":"scalar"},"locs":[{"a":156,"b":175}]},{"name":"round_within_match","required":true,"transform":{"type":"scalar"},"locs":[{"a":180,"b":199}]},{"name":"move_within_round","required":true,"transform":{"type":"scalar"},"locs":[{"a":204,"b":222}]},{"name":"nft_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":227,"b":234}]},{"name":"serialized_move","required":true,"transform":{"type":"scalar"},"locs":[{"a":239,"b":255}]}],"statement":"INSERT INTO round_move(\n  lobby_id,\n  match_within_lobby,\n  round_within_match,\n  move_within_round,\n  nft_id,\n  serialized_move\n)\nVALUES (\n  :lobby_id!,\n  :match_within_lobby!,\n  :round_within_match!,\n  :move_within_round!,\n  :nft_id!,\n  :serialized_move!\n)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO round_move(
 *   lobby_id,
 *   match_within_lobby,
 *   round_within_match,
 *   move_within_round,
 *   nft_id,
 *   serialized_move
 * )
 * VALUES (
 *   :lobby_id!,
 *   :match_within_lobby!,
 *   :round_within_match!,
 *   :move_within_round!,
 *   :nft_id!,
 *   :serialized_move!
 * )
 * ```
 */
export const newMove = new PreparedQuery<INewMoveParams,INewMoveResult>(newMoveIR);


/** 'NewStats' parameters type */
export interface INewStatsParams {
  stats: {
    nft_id: number,
    wins: number,
    losses: number,
    ties: number
  };
}

/** 'NewStats' return type */
export type INewStatsResult = void;

/** 'NewStats' query type */
export interface INewStatsQuery {
  params: INewStatsParams;
  result: INewStatsResult;
}

const newStatsIR: any = {"usedParamSet":{"stats":true},"params":[{"name":"stats","required":false,"transform":{"type":"pick_tuple","keys":[{"name":"nft_id","required":true},{"name":"wins","required":true},{"name":"losses","required":true},{"name":"ties","required":true}]},"locs":[{"a":37,"b":42}]}],"statement":"INSERT INTO global_user_state\nVALUES :stats\nON CONFLICT (nft_id)\nDO NOTHING"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO global_user_state
 * VALUES :stats
 * ON CONFLICT (nft_id)
 * DO NOTHING
 * ```
 */
export const newStats = new PreparedQuery<INewStatsParams,INewStatsResult>(newStatsIR);


/** 'UpdateStats' parameters type */
export interface IUpdateStatsParams {
  stats: {
    nft_id: number,
    wins: number,
    losses: number,
    ties: number
  };
}

/** 'UpdateStats' return type */
export type IUpdateStatsResult = void;

/** 'UpdateStats' query type */
export interface IUpdateStatsQuery {
  params: IUpdateStatsParams;
  result: IUpdateStatsResult;
}

const updateStatsIR: any = {"usedParamSet":{"stats":true},"params":[{"name":"stats","required":false,"transform":{"type":"pick_tuple","keys":[{"name":"nft_id","required":true},{"name":"wins","required":true},{"name":"losses","required":true},{"name":"ties","required":true}]},"locs":[{"a":37,"b":42}]}],"statement":"INSERT INTO global_user_state\nVALUES :stats\nON CONFLICT (nft_id)\nDO UPDATE SET\nwins = EXCLUDED.wins,\nlosses = EXCLUDED.losses,\nties = EXCLUDED.ties"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO global_user_state
 * VALUES :stats
 * ON CONFLICT (nft_id)
 * DO UPDATE SET
 * wins = EXCLUDED.wins,
 * losses = EXCLUDED.losses,
 * ties = EXCLUDED.ties
 * ```
 */
export const updateStats = new PreparedQuery<IUpdateStatsParams,IUpdateStatsResult>(updateStatsIR);


/** 'NewCardPack' parameters type */
export interface INewCardPackParams {
  cards: numberArray;
  owner_nft_id: number;
}

/** 'NewCardPack' return type */
export type INewCardPackResult = void;

/** 'NewCardPack' query type */
export interface INewCardPackQuery {
  params: INewCardPackParams;
  result: INewCardPackResult;
}

const newCardPackIR: any = {"usedParamSet":{"owner_nft_id":true,"cards":true},"params":[{"name":"owner_nft_id","required":true,"transform":{"type":"scalar"},"locs":[{"a":61,"b":74}]},{"name":"cards","required":true,"transform":{"type":"scalar"},"locs":[{"a":79,"b":85}]}],"statement":"INSERT INTO card_packs(\n  owner_nft_id,\n  cards\n)\nVALUES (\n  :owner_nft_id!,\n  :cards!\n)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO card_packs(
 *   owner_nft_id,
 *   cards
 * )
 * VALUES (
 *   :owner_nft_id!,
 *   :cards!
 * )
 * ```
 */
export const newCardPack = new PreparedQuery<INewCardPackParams,INewCardPackResult>(newCardPackIR);


