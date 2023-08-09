import { Controller, Get, Query, Route } from 'tsoa';
import { requirePool, getUserStats } from '@cards/db';
import type { UserStats } from '@cards/game-logic';

interface Response {
  stats: UserStats;
}

@Route('user_stats')
export class UserStatsController extends Controller {
  @Get()
  public async get(@Query() nftId: number): Promise<Response> {
    const pool = requirePool();
    const [stats] = await getUserStats.run({ nft_id: nftId }, pool);
    return { stats };
  }
}
