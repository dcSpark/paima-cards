import React, { useEffect, useState } from "react";
import "./Lobby.scss";
import { Typography } from "@mui/material";
import type { LobbyState } from "@dice/game-logic";
import Navbar from "@src/components/Navbar";
import Wrapper from "@src/components/Wrapper";
import CardGame from "./CardGame";
import { IGetLobbyByIdResult } from "@dice/db";
import { localDeckCache } from "@src/GlobalStateContext";
import * as Paima from "@dice/middleware";

export function Lobby({
  initialLobbyRaw,
  selectedNft,
}: {
  initialLobbyRaw: undefined | IGetLobbyByIdResult;
  selectedNft: number;
}): React.ReactElement {
  const [lobbyState, setLobbyState] = useState<LobbyState>();

  useEffect(() => {
    const fetchLobbyData = async () => {
      if (initialLobbyRaw == null) return;

      const newLobbyState = await Paima.default.getLobbyState(
        initialLobbyRaw.lobby_id
      );
      if (!newLobbyState.success) return;
      setLobbyState(newLobbyState.lobby);
    };

    // Fetch data every 5 seconds
    const intervalIdLobby = setInterval(fetchLobbyData, 5 * 1000);

    // Clean up the interval when component unmounts
    return () => {
      clearInterval(intervalIdLobby);
    };
  }, [lobbyState]);

  if (initialLobbyRaw == null) return <></>;

  return (
    <>
      <Navbar />
      <Wrapper blurred={false}>
        <Typography variant="h1">Lobby {initialLobbyRaw.lobby_id}</Typography>
        {lobbyState == null && (
          <>
            <div>
              Waiting for another player
              <span className="loading-text">...</span>
            </div>
          </>
        )}
        {lobbyState != null &&
          (() => {
            const localDeck = localDeckCache.get(lobbyState.lobby_id);
            if (localDeck == null) {
              // TODO: local deck is not guaranteed to be in cache (e.g. reopen browser), handle this better
              throw new Error(`Lobby: local deck not in cache`);
            }
            return (
              <CardGame
                lobbyState={lobbyState}
                selectedNft={selectedNft}
                refetchLobbyState={async () => {
                  const response = await Paima.default.getLobbyState(
                    initialLobbyRaw.lobby_id
                  );
                  if (!response.success) return;
                  setLobbyState(response.lobby);
                }}
                localDeck={localDeck}
              />
            );
          })()}
      </Wrapper>
    </>
  );
}
