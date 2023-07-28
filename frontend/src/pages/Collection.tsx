import { Box, Typography } from "@mui/material";
import { useGlobalStateContext } from "@src/GlobalStateContext";
import Button from "@src/components/Button";
import Navbar from "@src/components/Navbar";
import Wrapper from "@src/components/Wrapper";
import React, { useState } from "react";
import Card from "./CardGame/Card";
import { DECK_LENGTH } from "@dice/game-logic";

export default function Collection(): React.ReactElement {
  const {
    collection,
    selectedDeckState: [selectedDeck, setSelectedDeck],
  } = useGlobalStateContext();
  const [selectedCards, setSelectedCard] = useState<number[]>([]);

  return (
    <>
      <Navbar />
      <Wrapper blurred={false}>
        {selectedDeck != null && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {selectedDeck.map((cardId, i) => (
              <Card
                key={i}
                cardId={cardId}
                selectedEffect="glow"
                selectedState={[undefined, () => {}]}
              />
            ))}
          </Box>
        )}
        <Typography>
          {selectedCards.length}
          {" / "}
          {DECK_LENGTH}
        </Typography>
        <Button
          disabled={selectedCards.length < DECK_LENGTH}
          onClick={() => {
            if (selectedCards.length != DECK_LENGTH) return;

            const sortedCards = [...selectedCards];
            sortedCards.sort();

            setSelectedDeck(
              sortedCards.map((index) => collection.cards[index])
            );
          }}
        >
          save
        </Button>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {collection?.cards.map((cardId, i) => (
            <Card
              key={i}
              cardId={cardId}
              selectedEffect="glow"
              selectedState={[
                selectedCards.includes(i),
                () => {
                  setSelectedCard((oldSelectedCards) => {
                    if (oldSelectedCards.includes(i)) {
                      return oldSelectedCards.filter((card) => card !== i);
                    }

                    if (oldSelectedCards.length < DECK_LENGTH) {
                      return [...oldSelectedCards, i];
                    }
                    return oldSelectedCards;
                  });
                },
              ]}
            />
          ))}
        </Box>
      </Wrapper>
    </>
  );
}
