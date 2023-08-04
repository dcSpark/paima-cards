type VersionString = `${number}.${number}.${number}`;
const VERSION_MAJOR = 1;
const VERSION_MINOR = 1;
const VERSION_PATCH = 1;
export const gameBackendVersion: VersionString = `${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_PATCH}`;
export const GAME_NAME = 'Paima Dice';
// TODO: identify practice bot differently
// idea: there should be some "player in match" table anyways
// that table can have an 'isBot' flag
export const PRACTICE_BOT_NFT_ID = -1;
export const NFT_NAME = 'Dice NFT contract';
export const TRADE_NFT_NAME = 'Trade NFT mint';
export const CARD_PACK_PRICE = BigInt('2') * BigInt('10') ** BigInt('18');
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

/** Large number that should be safe anywhere */
export const SAFE_NUMBER = 2 ** 31 - 1;

export * from './types.js';
