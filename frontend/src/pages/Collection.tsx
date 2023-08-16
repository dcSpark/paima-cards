import { Box, Typography } from "@mui/material";
import { useGlobalStateContext } from "@src/GlobalStateContext";
import Button from "@src/components/Button";
import Navbar from "@src/components/Navbar";
import Wrapper from "@src/components/Wrapper";
import React, { useMemo, useState } from "react";
import Card from "./CardGame/Card";
import type { CardDbId } from "@cards/game-logic";
import { DECK_LENGTH } from "@cards/game-logic";

export default function Collection(): React.ReactElement {
  const {
    collection,
    selectedDeckState: [selectedDeck, setSelectedDeck],
  } = useGlobalStateContext();
  const sortedCards = useMemo(() => {
    if (collection.cards == null) return [];
    const result = Object.values(collection.cards).map((card) => card.id);
    result.sort();
    return result;
  }, [collection.cards]);

  const [selectedCards, setSelectedCard] = useState<CardDbId[]>([]);

  return (
    <>
      <Navbar />
      <Wrapper blurred={false}>
        {collection.cards != null && selectedDeck != null && (
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
                cardRegistryId={collection.cards?.[cardId].registry_id}
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

            setSelectedDeck(sortedCards);
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
          {sortedCards?.map((card) => (
            <Card
              key={card}
              cardRegistryId={collection.cards?.[card]?.registry_id}
              selectedEffect="glow"
              selectedState={[
                selectedCards.includes(card),
                () => {
                  setSelectedCard((oldSelectedCards) => {
                    if (oldSelectedCards.includes(card)) {
                      return oldSelectedCards.filter(
                        (selected) => selected !== card
                      );
                    }

                    if (oldSelectedCards.length < DECK_LENGTH) {
                      return [...oldSelectedCards, card];
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
