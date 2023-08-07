import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import "./CardGame.scss";
import type {
  MatchState,
  TickEvent,
  LobbyState,
  PostTxTickEvent,
  Move,
  LocalCard,
  CardCommitmentIndex,
} from "@dice/game-logic";
import {
  applyEvent,
  CARD_REGISTRY,
  genPostTxEvents,
  getTurnPlayer,
  MOVE_KIND,
  TICK_EVENT_KIND,
} from "@dice/game-logic";
import * as Paima from "@dice/middleware";
import Prando from "paima-sdk/paima-prando";
import Player from "./Player";

interface CardGameProps {
  lobbyState: LobbyState;
  refetchLobbyState: () => Promise<void>;
  selectedNft: number;
  localDeck: LocalCard[];
}

const DiceGame: React.FC<CardGameProps> = ({
  lobbyState,
  refetchLobbyState,
  selectedNft,
  localDeck,
}) => {
  const [selectedCard, setSelectedCard] = useState<
    undefined | CardCommitmentIndex
  >();
  const [matchOver, setMatchOver] = useState(false);
  const [caption, setCaption] = useState<undefined | string>();

  // Game data for what is being currently shown to user.
  // Lags behind lobby's current state when waiting for animations.
  // Jumps ahead when letting user interact with the game.
  const [display, setDisplay] = useState<{
    round: number;
    matchState: MatchState;
    isPostTxDone: boolean;
  }>({
    round: lobbyState.current_round,
    matchState: {
      turn: lobbyState.current_turn,
      properRound: lobbyState.current_proper_round,
      players: lobbyState.players,
      txEventMove: lobbyState.txEventMove,
      result: undefined,
    },
    isPostTxDone: false,
  });
  // cache of state that was fetched, but still needs to be displayed
  // the actual round executor is stateful so we store all it's end results instead
  const [roundExecutor, setRoundExecutor] = useState<
    | undefined
    | {
        tickEvents: TickEvent[];
        endState: MatchState;
      }
  >();
  const [isTickDisplaying, setIsTickDisplaying] = useState(false);

  const { thisPlayer, opponent } = useMemo(() => {
    const thisPlayer = display.matchState.players.find(
      (player) => player.nftId === selectedNft
    );
    if (thisPlayer == null) throw new Error(`DiceGame: nft not in lobby`);

    const opponent = display.matchState.players.find(
      (player) => player.nftId !== selectedNft
    );
    if (opponent == null) throw new Error(`DiceGame: opponent not in lobby`);
    return { thisPlayer, opponent };
  }, [selectedNft, display]);

  // Note: we could just async play the post tx animations, but in some games you want a user interaction for it.
  // E.g. in blackjack dice we let the user click "roll" to roll their dice at the start of their turn.
  const [postTxEventQueue, setPostTxEventQueue] = useState<PostTxTickEvent[]>(
    []
  );

  useEffect(() => {
    // Set post-tx event queue:
    // Someone submitted a tx and it now this player's turn. This means we have to play
    // post-tx events from the start of the current round (interactively, before executor is available).
    // In cards this can mean they chose to draw a card and are waiting for it to happen.

    if (
      // not displaying current round
      display.round < lobbyState.current_round ||
      // not interactive round
      thisPlayer.turn !== lobbyState.current_turn ||
      // already set
      postTxEventQueue.length !== 0 ||
      display.isPostTxDone
    )
      return;

    setPostTxEventQueue(
      genPostTxEvents(display.matchState, new Prando(lobbyState.roundSeed))
    );
    setDisplay((oldDisplay) => ({
      ...oldDisplay,
      isPostTxDone: true,
    }));
  }, [display, lobbyState, thisPlayer, postTxEventQueue]);

  useEffect(
    () =>
      void (async () => {
        // Play post-tx event, this doesn't have to be just an effect, see comment before the queue.
        if (isTickDisplaying || postTxEventQueue.length === 0) return;

        setIsTickDisplaying(true);
        const [playedEvent, ...restEvents] = postTxEventQueue;
        setPostTxEventQueue(restEvents);
        setDisplay((oldDisplay) => {
          const newMatchState = structuredClone(oldDisplay.matchState);
          applyEvent(newMatchState, playedEvent);
          return {
            ...oldDisplay,
            matchState: newMatchState,
          };
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsTickDisplaying(false);
      })(),
    [isTickDisplaying, postTxEventQueue]
  );

  async function submit(move: Move) {
    const moveResult = await Paima.default.submitMoves(
      selectedNft,
      lobbyState.lobby_id,
      lobbyState.current_match,
      lobbyState.current_round,
      move
    );
    console.log("Move result:", moveResult);
    await refetchLobbyState();
  }

  useEffect(() => {
    // past turn animation (mostly opponents' turns)
    if (isTickDisplaying || roundExecutor == null) return;

    void (async () => {
      setIsTickDisplaying(true);

      const tickEvents = roundExecutor.tickEvents;
      const endState = roundExecutor.endState;

      for (const tickEvent of tickEvents) {
        // skip replay of this player's actions that already happened interactively
        if (
          thisPlayer.turn === display.matchState.turn &&
          tickEvent.kind === TICK_EVENT_KIND.postTx
        )
          continue;

        // show animations before applying events to sate
        // TODO: we don't have any at the moment

        // apply events to state
        setDisplay((oldDisplay) => {
          const newMatchState = structuredClone(oldDisplay.matchState);
          applyEvent(newMatchState, tickEvent);
          return { ...oldDisplay, matchState: newMatchState };
        });

        // show animations after applying events to sate
        if (
          tickEvent.kind === TICK_EVENT_KIND.postTx ||
          tickEvent.kind === TICK_EVENT_KIND.playCard
        ) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        if (tickEvent.kind === TICK_EVENT_KIND.turnEnd) {
          setCaption(
            (() => {
              const turnPlayer = getTurnPlayer(display.matchState);

              const target =
                turnPlayer.nftId === selectedNft ? "You deal" : "You take";

              return `${target} ${tickEvent.damageDealt} damage!`;
            })()
          );
          await new Promise((resolve) => setTimeout(resolve, 3000));
          setCaption(undefined);
        }

        if (tickEvent.kind === TICK_EVENT_KIND.matchEnd) {
          setCaption(() => {
            const thisPlayerIndex = display.matchState.players.findIndex(
              (player) => player.nftId === selectedNft
            );
            const thisPlayerResult = tickEvent.result[thisPlayerIndex];

            if (thisPlayerResult === "w") return "You win!";
            if (thisPlayerResult === "l") return "You lose!";
            return "It's a tie!";
          });
          setMatchOver(true);
        }
      }

      setDisplay({
        // intentionally set using the 'display' we started with instead of 'oldDisplay'
        round: display.round + 1,
        // round ended, which means a tx happened, calculate post-tx next render
        isPostTxDone: false,
        // resync with backend state in case we applied some events wrong (makes bugs less game-breaking)
        matchState: endState,
      });

      setIsTickDisplaying(false);
      setRoundExecutor(undefined);
    })();
  }, [display, isTickDisplaying, roundExecutor, selectedNft, thisPlayer]);

  const [isFetchingRound, setIsFetchingRound] = useState(false);
  const [fetchedEndState, setFetchedEndState] = useState<MatchState>({
    turn: lobbyState.current_turn,
    properRound: lobbyState.current_proper_round,
    players: lobbyState.players,
    txEventMove: lobbyState.txEventMove,
    result: undefined,
  });
  const [nextFetchedRound, setNextFetchedRound] = useState(
    lobbyState.current_round
  );
  useEffect(() => {
    // fetch new round data
    if (
      // we're up-to-date
      nextFetchedRound >= lobbyState.current_round ||
      // we already fetched a round
      roundExecutor != null ||
      // we're currently fetching
      isFetchingRound
    )
      return;

    setIsFetchingRound(true);
    Paima.default
      .getRoundExecutor(
        lobbyState.lobby_id,
        lobbyState.current_match,
        nextFetchedRound,
        fetchedEndState
      )
      .then((newRoundExecutor) => {
        if (newRoundExecutor.success) {
          const newRoundExecutorResults = {
            tickEvents: newRoundExecutor.result.processAllTicks(),
            endState: newRoundExecutor.result.endState(),
          };

          setRoundExecutor(newRoundExecutorResults);
          setNextFetchedRound(nextFetchedRound + 1);
          setFetchedEndState(newRoundExecutorResults.endState);
          setIsFetchingRound(false);
        } else {
          console.error(
            `Failed to fetch round executor: ${
              newRoundExecutor.success === false &&
              newRoundExecutor.errorMessage
            }`
          );
          // delay refetch of fail
          setTimeout(() => {
            setIsFetchingRound(false);
          }, 1000);
        }
      });
  }, [
    isFetchingRound,
    lobbyState,
    roundExecutor,
    nextFetchedRound,
    fetchedEndState,
  ]);

  const disableInteraction =
    matchOver ||
    display.round !== lobbyState.current_round ||
    thisPlayer.turn !== display.matchState.turn ||
    isTickDisplaying;

  const canPass = !disableInteraction;
  const canPlay = !disableInteraction;

  if (lobbyState == null) return <></>;

  return (
    <>
      <Typography
        variant="caption"
        sx={{ fontSize: "1.25rem", lineHeight: "1.75rem" }}
      >
        {matchOver
          ? "Match over"
          : `Round: ${display.matchState.properRound + 1}`}
        {" | "}
        {caption ??
          (thisPlayer.turn === display.matchState.turn
            ? "Your turn"
            : "Opponent's turn")}
      </Typography>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}
      >
        <Player
          lobbyPlayer={opponent}
          turn={display.matchState.turn}
          selectedCardState={[selectedCard, setSelectedCard]}
          onTargetCard={
            canPlay
              ? async (index) => {
                  if (selectedCard == null) return;

                  const fromBoardPosition = thisPlayer.currentBoard.findIndex(
                    (card) => card.index === selectedCard
                  );
                  if (fromBoardPosition === -1) return;

                  const toBoardPosition = opponent.currentBoard.findIndex(
                    (card) => card.index === index
                  );
                  if (toBoardPosition === -1) return;

                  const fromCardRegistryId =
                    thisPlayer.currentBoard[fromBoardPosition].registryId;
                  const toCardRegistryId =
                    opponent.currentBoard[toBoardPosition].registryId;
                  if (
                    CARD_REGISTRY[fromCardRegistryId].defeats !==
                    toCardRegistryId
                  )
                    return;

                  await submit({
                    kind: MOVE_KIND.targetCardWithBoardCard,
                    fromBoardPosition,
                    toBoardPosition,
                  });
                  setSelectedCard(undefined);
                }
              : undefined
          }
        />
        <Player
          lobbyPlayer={thisPlayer}
          isThisPlayer
          localDeck={localDeck}
          turn={display.matchState.turn}
          selectedCardState={[selectedCard, setSelectedCard]}
          onEndTurn={
            canPass
              ? () => {
                  submit({ kind: MOVE_KIND.endTurn });
                }
              : undefined
          }
          onConfirmCard={
            canPlay
              ? async (index) => {
                  const handPosition = thisPlayer.currentHand.findIndex(
                    (card) => card.index === index
                  );
                  if (handPosition === -1) return;

                  await submit({
                    kind: MOVE_KIND.playCard,
                    handPosition,
                    cardIndex: index,
                    salt: localDeck[index].salt,
                    cardId: localDeck[index].id,
                    cardRegistryId: localDeck[index].registryId,
                  });
                  setSelectedCard(undefined);
                }
              : undefined
          }
        />
      </Box>
    </>
  );
};

export default DiceGame;
