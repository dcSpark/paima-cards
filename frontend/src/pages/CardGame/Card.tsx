import React, { Ref, useState } from "react";
import { Box, ButtonBase, Modal, Typography } from "@mui/material";
import { CardRegistryId } from "@dice/game-logic";
import PaimaLogo from "./PaimaLogo";
import { UseStateResponse } from "@src/utils";
import { imageRegistry } from "./imageMapping";

export const cardHeight = "160px";
export const cardWidth = "100px";

function StaticCard({
  cardId,
  overlap,
  scale,
  onClick,
  transparent,
  glow,
}: {
  cardId: undefined | CardRegistryId;
  overlap?: boolean;
  scale: number;
  onClick?: () => void;
  transparent?: boolean;
  glow?: boolean;
}): React.ReactElement {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        flex: "none",
        width: `calc(${scale} * ${cardWidth})`,
        height: `calc(${scale} * ${cardHeight})`,
        backgroundImage: cardId == null ? "" : imageRegistry[cardId],
        backgroundSize: "100%",
        backgroundColor: "rgb(18, 39, 31)",
        borderRadius: "8px",
        border: "1px solid #777",
        position: "relative",
        "&:not(:first-child)": overlap
          ? {
              marginLeft: "-60px",
            }
          : {},
        ...(transparent ? { opacity: 0 } : {}),
        ...(glow ? { boxShadow: "0px 0px 15px 5px rgba(255,255,255,1)" } : {}),
      }}
    >
      {cardId == null && (
        <PaimaLogo
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          scale={scale}
        />
      )}
    </ButtonBase>
  );
}

export default function Card({
  cardId,
  overlap,
  selectedEffect,
  selectedState: [selected, setSelected],
  onConfirm: onConfirm,
}: {
  onConfirm?: undefined | (() => void);
  cardId: undefined | CardRegistryId;
  overlap?: boolean;
  selectedState: UseStateResponse<boolean>;
  selectedEffect: "glow" | "closeup";
}): React.ReactElement {
  return (
    <>
      <StaticCard
        cardId={cardId}
        overlap={overlap}
        scale={1}
        onClick={
          // do not select face-down cards
          cardId == null
            ? undefined
            : () => {
                setSelected(true);
              }
        }
        transparent={selectedEffect === "closeup" && selected}
        glow={selectedEffect === "glow" && selected}
      />
      <Modal
        open={selectedEffect === "closeup" && selected}
        onClose={() => {
          setSelected(false);
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <StaticCard cardId={cardId} scale={2} onClick={onConfirm} />
        </Box>
      </Modal>
    </>
  );
}
