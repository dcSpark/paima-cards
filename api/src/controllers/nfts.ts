import { Controller, Get, Query, Route } from 'tsoa';
import { getOwnedNft, requirePool } from '@cards/db';
import { NFT_NAME } from '@cards/utils';

interface Response {
  nft: undefined | number;
}

@Route('nfts')
export class LobbyNFTController extends Controller {
  @Get('wallet')
  public async getWalletNFT(@Query() wallet: string): Promise<Response> {
    const pool = requirePool();
    const result = await getOwnedNft(pool, NFT_NAME, wallet);
    return { nft: result };
  }
}
