import React, { createContext, useContext, useEffect, useState } from "react";
import MainController from "./MainController";
import { AppContext } from "./main";
import { UseStateResponse } from "./utils";
import { WalletAddress } from "paima-sdk/paima-utils";
import * as Paima from "@dice/middleware";
import ConnectingModal from "./ConnectingModal";
import { PaimaNotice } from "./components/PaimaNotice";
import { OasysNotice } from "./components/PaimaNotice";
import { Box } from "@mui/material";
import { CardRegistryId, LocalCard } from "@dice/game-logic";
import { IGetOwnedPacksResult } from "@dice/db/build/select.queries";

export const localDeckCache: Map<string, LocalCard[]> = new Map();

type GlobalState = {
  connectedWallet?: WalletAddress;
  selectedNftState: UseStateResponse<{
    loading: boolean;
    nft: undefined | number;
  }>;
  collection:
    | undefined
    | {
        raw: IGetOwnedPacksResult[];
        packs: CardRegistryId[][];
        cards: CardRegistryId[];
      };
  selectedDeckState: UseStateResponse<undefined | CardRegistryId[]>;
};

export const GlobalStateContext = createContext<GlobalState>(
  null as GlobalState
);

export function GlobalStateProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const mainController: MainController = useContext(AppContext);
  const [connectedWallet, setConnectedWallet] = useState<
    undefined | WalletAddress
  >();
  const [selectedNft, setSelectedNft] = useState<{
    loading: boolean;
    nft: undefined | number;
  }>({
    loading: true,
    nft: undefined,
  });
  const [collection, setCollection] = useState<
    | undefined
    | {
        raw: IGetOwnedPacksResult[];
        packs: CardRegistryId[][];
        cards: CardRegistryId[];
      }
  >();
  const [selectedDeck, setSelectedDeck] = useState<
    undefined | CardRegistryId[]
  >();

  useEffect(() => {
    // poll owned nfts
    const fetch = async () => {
      if (connectedWallet == null) return;

      const result = await Paima.default.getNftForWallet(connectedWallet);
      if (result.success && result.result !== selectedNft.nft) {
        setSelectedNft({
          loading: false,
          nft: result.result,
        });
      }
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, [mainController, connectedWallet]);

  useEffect(() => {
    // poll collection
    const fetch = async () => {
      if (selectedNft.nft == null) return;

      const result = await Paima.default.getUserPacks(selectedNft.nft);
      if (result.success) {
        const raw = result.result;
        const packs = raw.map((pack) => pack.cards);
        const cards = packs.flat();
        setCollection({
          raw,
          packs,
          cards,
        });
      } else {
        setCollection(undefined);
      }
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [mainController, selectedNft]);

  useEffect(() => {
    // poll connection to wallet
    const fetch = async () => {
      const connectResult = await Paima.default.userWalletLogin("metamask");
      const newWallet = connectResult.success
        ? connectResult.result.walletAddress
        : undefined;
      setConnectedWallet(newWallet);
    };
    fetch();
    const interval = setInterval(fetch, 2000);
    return () => clearInterval(interval);
  }, [connectedWallet, mainController]);

  // if a user disconnects, we will suspend the pages the previously connected wallet
  // instead of setting connected wallet back to undefined
  const [lastConnectedWallet, setLastConnectedWallet] = useState<
    undefined | WalletAddress
  >();
  useEffect(() => {
    if (connectedWallet == null) return;

    setLastConnectedWallet(connectedWallet);
  }, [connectedWallet]);

  const value = React.useMemo<GlobalState>(
    () => ({
      connectedWallet: lastConnectedWallet,
      selectedNftState: [selectedNft, setSelectedNft],
      collection,
      selectedDeckState: [selectedDeck, setSelectedDeck],
    }),
    [lastConnectedWallet, selectedNft, setSelectedNft]
  );

  return (
    <GlobalStateContext.Provider value={value}>
      <ConnectingModal open={connectedWallet == null} />
      {children}
      <PaimaNotice />
      <Box sx={{ marginRight: 1 }} />
      <OasysNotice />
    </GlobalStateContext.Provider>
  );
}

export const useGlobalStateContext = (): GlobalState => {
  const context = React.useContext(GlobalStateContext);
  if (context == null) {
    throw new Error(
      "useGlobalStateContext must be used within an GlobalStateProvider"
    );
  }
  return context;
};
