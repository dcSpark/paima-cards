import type { Pool } from 'pg';

import parse from './parser.js';
import type Prando from 'paima-sdk/paima-prando';
import { SCHEDULED_DATA_ADDRESS, type SubmittedChainData } from 'paima-sdk/paima-utils';
import {
  createdLobby,
  joinedLobby,
  closedLobby,
  submittedMoves,
  scheduledData,
  practiceMoves,
  mintNft,
  cardPackBuy,
} from './transition';
import type { SQLUpdate } from 'paima-sdk/paima-db';
import { GENERIC_PAYMENT_MESSAGES } from '@dice/game-logic';

export default async function (
  inputData: SubmittedChainData,
  blockHeight: number,
  randomnessGenerator: Prando,
  dbConn: Pool
): Promise<SQLUpdate[]> {
  console.log(inputData, 'parsing input data');
  const user = inputData.userAddress.toLowerCase();
  const parsed = parse(inputData.inputData);
  console.log(`Processing input string: ${inputData.inputData}`);
  console.log(`Input string parsed as: ${parsed.input}`);

  switch (parsed.input) {
    case 'nftMint':
      return mintNft(parsed);
    case 'genericPayment': {
      if (inputData.userAddress !== SCHEDULED_DATA_ADDRESS) {
        console.log('DISCARD: scheduled data from regular address');
        return [];
      }

      switch (parsed.message) {
        case GENERIC_PAYMENT_MESSAGES.buyCardPack: {
          return cardPackBuy(parsed, dbConn, randomnessGenerator);
        }
        default: {
          console.log('DISCARD: unknown message');
          return [];
        }
      }
    }
    case 'createdLobby':
      return createdLobby(user, blockHeight, parsed, dbConn, randomnessGenerator);
    case 'joinedLobby':
      return joinedLobby(user, blockHeight, parsed, dbConn, randomnessGenerator);
    case 'closedLobby':
      return closedLobby(user, parsed, dbConn);
    case 'submittedMoves':
      return submittedMoves(user, blockHeight, parsed, dbConn);
    case 'practiceMoves':
      return practiceMoves(user, blockHeight, parsed, dbConn);
    case 'scheduledData': {
      if (!inputData.scheduled) return [];
      return scheduledData(blockHeight, parsed, dbConn, randomnessGenerator);
    }
    default:
      return [];
  }
}
