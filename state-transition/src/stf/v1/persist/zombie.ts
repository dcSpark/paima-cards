import { PARSER_KEYS, PARSER_PREFIXES } from '@cards/game-logic';
import type { SQLUpdate } from 'paima-sdk/paima-db';
import { createScheduledData, deleteScheduledData } from 'paima-sdk/paima-db';

// Schedule a zombie round to be executed in the future
export function scheduleZombieRound(lobbyId: string, block_height: number): SQLUpdate {
  return createScheduledData(createZombieInput(lobbyId), block_height);
}

// Delete a scheduled zombie round to be executed in the future
export function deleteZombieRound(lobbyId: string, block_height: number): SQLUpdate {
  return deleteScheduledData(createZombieInput(lobbyId), block_height);
}

// Create the zombie round input
function createZombieInput(lobbyId: string): string {
  return `${PARSER_PREFIXES[PARSER_KEYS.zombieScheduledData]}|*${lobbyId}`;
}
