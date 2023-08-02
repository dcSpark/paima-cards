import type { MatchState, Move } from '@dice/game-logic';
import { MOVE_KIND, applyEvent, genPostTxEvents, getTurnPlayer } from '@dice/game-logic';
import { PRACTICE_BOT_NFT_ID } from '@dice/utils';
import type Prando from 'paima-sdk/paima-prando';

//
// PracticeAI generates a move based on the current game state and prando.
//
export class PracticeAI {
  randomnessGenerator: Prando;
  matchState: MatchState;

  constructor(matchState: MatchState, randomnessGenerator: Prando) {
    this.randomnessGenerator = randomnessGenerator;

    const postTx = genPostTxEvents(matchState, randomnessGenerator);
    postTx.forEach(event => {
      applyEvent(matchState, event);
    });
    this.matchState = matchState;
  }

  // AI to generate next move
  //
  // Return next move
  // Return null to not send next move.
  public getNextMove(): Move {
    const me = getTurnPlayer(this.matchState);
    if (me.nftId !== PRACTICE_BOT_NFT_ID)
      throw new Error(`getNextMove: bot move for non-bot player`);
    if (me.botLocalDeck == null) throw new Error(`getNextMove: bot does not have a deck saved`);

    if (me.currentBoard.length < 2 && me.currentHand.length > 0) {
      return {
        kind: MOVE_KIND.playCard,
        handPosition: 0,
        cardIndex: me.currentHand[0].index,
        cardId: me.botLocalDeck[me.currentHand[0].index].cardId,
        salt: me.botLocalDeck[me.currentHand[0].index].salt,
      };
    }

    return { kind: MOVE_KIND.endTurn };
  }
}
