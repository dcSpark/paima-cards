import type { CardRegistry } from './types';

export const COMMITMENT_LENGTH = 16;
export const DECK_LENGTH = 10;
export const PACK_LENGTH = 5;

// Values must match move_kind in db. No need for a type check, it will cause errors somewhere.
export const MOVE_KIND = {
  endTurn: 'end',
  drawCard: 'draw',
  playCard: 'play',
  // mini todo: Many games can target with a hand card too.
  // It makes sense to separate them, because this one doesn't need a reveal.
  targetCardWithBoardCard: 'targetB',
} as const;

export const TICK_EVENT_KIND = {
  tx: 'tx',
  postTx: 'postTx',
  playCard: 'playCard',
  destroyCard: 'destroyCard',
  applyPoints: 'applyPoints',
  turnEnd: 'turnEnd',
  roundEnd: 'roundEnd',
  matchEnd: 'matchEnd',
} as const;

export const CARD_REGISTRY: CardRegistry = {
  0: { defeats: 1 },
  1: { defeats: 2 },
  2: { defeats: 0 },
};

export const CARD_IDS = Object.keys(CARD_REGISTRY).map(key => Number.parseInt(key));

export const GENERIC_PAYMENT_MESSAGES = {
  buyCardPack: 'pack',
} as const;
