import { Body, Controller, Get, Path, Post, Query, Route, SuccessResponse } from 'tsoa';
import { getLobbyById, getRoundData, requirePool } from '@dice/db';
import type { LobbyStateQuery } from '@dice/utils';

interface Response {
  lobby: LobbyStateQuery | null;
}

@Route('lobby_state')
export class LobbyStatecontroller extends Controller {
  @Get()
  public async get(@Query() lobbyID: string): Promise<Response> {
    const pool = requirePool();
    const [lobby] = await getLobbyById.run({ lobby_id: lobbyID }, pool);
    if (!lobby) return { lobby: null };
    else {
      const [round_data] = await getRoundData.run(
        { lobby_id: lobbyID, round_number: lobby.current_round },
        pool
      );
      return {
        lobby: {
          ...lobby,
          round_start_height: round_data?.starting_block_height || 0,
        },
      };
    }
  }
}
