import { Controller, Get, Query, Route, ValidateError } from 'tsoa';
import { getOwnedNft, requirePool } from '@cards/db';
import { isLeft } from 'fp-ts/Either';
import { psqlInt } from '../validation.js';
import {
  getBoughtPacks,
  getCardsByIds,
  getOwnedCards,
  getTradeNfts,
  getUserStats,
} from '@cards/db/src/select.queries.js';
import { getNftOwner, getOwnedNfts } from 'paima-sdk/paima-utils-backend';
import { NFT_NAME, CARD_TRADE_NFT_NAME } from '@cards/utils';
import type { AccountNftResponse, UserStatsResponse } from '@cards/game-logic';
import {
  type GetCardsResponse,
  type GetPacksResponse,
  type GetTradeNftsResponse,
} from '@cards/game-logic';

@Route('user')
export class UserController extends Controller {
  @Get('accountNft')
  public async getWalletNFT(@Query() wallet: string): Promise<AccountNftResponse> {
    const pool = requirePool();
    const result = await getOwnedNft(pool, NFT_NAME, wallet);
    return { nft: result };
  }

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

    const tradeNftIds = await getOwnedNfts(dbConn, CARD_TRADE_NFT_NAME, ownerAddress);
    const tradeNfts =
      tradeNftIds.length === 0
        ? []
        : await getTradeNfts.run({ nft_ids: tradeNftIds.map(nft => Number(nft)) }, dbConn);
    const cardIds = tradeNfts.flatMap(tradeNft => tradeNft.cards ?? []);
    const cards = cardIds.length === 0 ? [] : await getCardsByIds.run({ ids: cardIds }, dbConn);
    const cardLookup = Object.fromEntries(cards.map(card => [card.id, card]));

    return { tradeNfts, cardLookup };
  }

  @Get('stats')
  public async stats(@Query() nftId: number): Promise<UserStatsResponse> {
    const pool = requirePool();
    const [stats] = await getUserStats.run({ nft_id: nftId }, pool);
    return { stats };
  }
}
