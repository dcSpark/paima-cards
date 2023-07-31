import { IGetOwnedPacksResult } from "@dice/db/build/select.queries";
import { CardRegistryId } from "@dice/game-logic";
import { LoadingButton } from "@mui/lab";
import { Box, Typography } from "@mui/material";
import { useGlobalStateContext } from "@src/GlobalStateContext";
import Navbar from "@src/components/Navbar";
import Wrapper from "@src/components/Wrapper";
import { buyCardPack } from "@src/services/contract";
import React, { useEffect, useState } from "react";
import Card from "./CardGame/Card";

export default function BuyPack(): React.ReactElement {
  const { connectedWallet, collection } = useGlobalStateContext();
  const [isBuying, setIsBuying] = React.useState<boolean>(false);

  // Cache the length of collection.
  // When it changes, assume the last pack is the one we just bought.
  const [collectionCache, setCollectionCache] = useState<undefined | number>();
  const [boughtPack, setBoughtPack] = React.useState<
    undefined | CardRegistryId[]
  >();
  useEffect(() => {
    if (collection == null || collection.packs.length === collectionCache)
      return;
    setCollectionCache(collection.packs.length);

    // first set
    if (collectionCache == null) return;

    const lastPackRaw = collection.raw.reduce(
      (acc, next) => (acc == null || acc.id < next.id ? next : acc),
      undefined as undefined | IGetOwnedPacksResult
    );

    setBoughtPack(lastPackRaw.cards);
  }, [collection]);

  return (
    <>
      <Navbar />
      <Wrapper blurred={false}>
        <LoadingButton
          loading={isBuying}
          sx={(theme) => ({
            "&.Mui-disabled": {
              backgroundColor: theme.palette.menuButton.dark,
            },
            backgroundColor: theme.palette.menuButton.main,
          })}
          onClick={async () => {
            try {
              setIsBuying(true);
              await buyCardPack(connectedWallet);
            } catch (_e) {
            } finally {
              setIsBuying(false);
            }
          }}
          variant="contained"
        >
          Buy pack
        </LoadingButton>
        {boughtPack && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1,
            }}
          >
            {boughtPack.map((cardId) => (
              <Card
                selectedEffect="glow"
                selectedState={[false, () => {}]}
                cardId={cardId}
              />
            ))}
          </Box>
        )}
      </Wrapper>
    </>
  );
}
