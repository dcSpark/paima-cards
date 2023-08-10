import type { ValuesType } from 'utility-types';
import type { MOVE_KIND } from '../constants';
import type { CardCommitmentIndex, CardDbId, CardRegistryId } from '../types';

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
