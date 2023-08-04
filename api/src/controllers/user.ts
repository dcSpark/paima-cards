import { Controller, Get, Query, Route, ValidateError } from 'tsoa';
import { requirePool } from '@dice/db';
import { isLeft } from 'fp-ts/Either';
import { psqlInt } from '../validation.js';
import type {
  IGetBoughtPacksResult,
  IGetCardsByIdsResult,
  IGetOwnedCardsResult,
  IGetTradeNftsResult,
} from '@dice/db/src/select.queries.js';
import {
  getBoughtPacks,
  getCardsByIds,
  getOwnedCards,
  getTradeNfts,
} from '@dice/db/src/select.queries.js';
import { getNftOwner, getOwnedNfts } from 'paima-sdk/paima-utils-backend';
import { NFT_NAME, TRADE_NFT_NAME } from '@dice/utils';

interface GetCardsResponse {
  cards: IGetOwnedCardsResult[];
}

interface GetPacksResponse {
  packs: IGetBoughtPacksResult[];
}

interface GetTradeNftsResponse {
  tradeNfts: IGetTradeNftsResult[];
  cardLookup: Record<string, IGetCardsByIdsResult>;
}

@Route('user')
export class UserController extends Controller {
  @Get('cards')
  public async getCards(@Query() nftId: number): Promise<GetCardsResponse> {
    const dbConn = requirePool();
    const valNftId = psqlInt.decode(nftId);
    if (isLeft(valNftId)) {
      throw new ValidateError({ round: { message: 'invalid nft id' } }, '');
    }
    const cards = await getOwnedCards.run({ owner_nft_id: nftId }, dbConn);

    return { cards };
  }

  @Get('packs')
  public async getPacks(@Query() nftId: number): Promise<GetPacksResponse> {
    const dbConn = requirePool();
    const valNftId = psqlInt.decode(nftId);
    if (isLeft(valNftId)) {
      throw new ValidateError({ round: { message: 'invalid nft id' } }, '');
    }
    const packs = await getBoughtPacks.run({ buyer_nft_id: nftId }, dbConn);

    return { packs };
  }

  @Get('tradeNfts')
  public async getTradeNfts(@Query() nftId: number): Promise<GetTradeNftsResponse> {
    const dbConn = requirePool();
    const valNftId = psqlInt.decode(nftId);
    if (isLeft(valNftId)) {
      throw new ValidateError({ round: { message: 'invalid nft id' } }, '');
    }

    const ownerAddress = await getNftOwner(dbConn, NFT_NAME, BigInt(nftId));
    if (ownerAddress == null) {
      throw new Error(`getTradeNfts: no owner`);
    }

    const tradeNftIds = await getOwnedNfts(dbConn, TRADE_NFT_NAME, ownerAddress);
    const tradeNfts =
      tradeNftIds.length === 0
        ? []
        : await getTradeNfts.run({ nft_ids: tradeNftIds.map(nft => Number(nft)) }, dbConn);
    const cardIds = tradeNfts.flatMap(tradeNft => tradeNft.cards ?? []);
    const cards = cardIds.length === 0 ? [] : await getCardsByIds.run({ ids: cardIds }, dbConn);
    const cardLookup = Object.fromEntries(cards.map(card => [card.id, card]));

    return { tradeNfts, cardLookup };
  }
}
