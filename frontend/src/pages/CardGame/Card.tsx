import React from "react";
import { Box, ButtonBase, Modal } from "@mui/material";
import type { CardRegistryId } from "@cards/game-logic";
import PaimaLogo from "./PaimaLogo";
import type { UseStateResponse } from "@src/utils";
import { imageRegistry } from "./imageMapping";

export const cardHeight = "160px";
export const cardWidth = "100px";

export type CardGlow = "hasAttack" | "selected";

function StaticCard({
  cardRegistryId,
  overlap,
  scale,
  onClick,
  transparent,
  glow,
}: {
  cardRegistryId: undefined | CardRegistryId;
  overlap?: boolean;
  scale: number;
  onClick?: () => void;
  transparent?: boolean;
  glow?: CardGlow;
}): React.ReactElement {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        flex: "none",
        width: `calc(${scale} * ${cardWidth})`,
        height: `calc(${scale} * ${cardHeight})`,
        backgroundImage:
          cardRegistryId == null ? "" : imageRegistry[cardRegistryId],
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
        ...(glow
          ? {
              boxShadow: (() => {
                if (glow === "selected")
                  return "0px 0px 15px 5px rgba(255,255,255,1)";
                if (glow === "hasAttack")
                  return "0px 0px 15px 0px rgba(255,255,0,1)";
              })(),
            }
          : {}),
      }}
    >
      {cardRegistryId == null && (
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
  cardRegistryId,
  overlap,
  selectedEffect = "glow",
  selectedState,
  onConfirm: onConfirm,
  hasAttack,
}: {
  onConfirm?: undefined | (() => void);
  cardRegistryId: undefined | CardRegistryId;
  overlap?: boolean;
  selectedState?: UseStateResponse<boolean>;
  selectedEffect?: "glow" | "closeup";
  hasAttack?: boolean;
}): React.ReactElement {
  const [selected, setSelected] = selectedState ?? [undefined, undefined];
  return (
    <>
      <StaticCard
        cardRegistryId={cardRegistryId}
        overlap={overlap}
        scale={1}
        onClick={
          // do not select face-down cards
          cardRegistryId == null
            ? undefined
            : () => {
                setSelected?.(true);
              }
        }
        transparent={selectedEffect === "closeup" && selected}
        glow={(() => {
          if (selectedEffect === "glow" && selected) return "selected";
          if (hasAttack) return "hasAttack";
        })()}
      />
      <Modal
        open={selectedEffect === "closeup" && selected === true}
        onClose={() => {
          setSelected?.(false);
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
          <StaticCard
            cardRegistryId={cardRegistryId}
            scale={2}
            onClick={onConfirm}
          />
        </Box>
      </Modal>
    </>
  );
}
