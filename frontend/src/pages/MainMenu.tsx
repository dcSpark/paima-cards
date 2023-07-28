import React, { useContext } from "react";
import { Box, CircularProgress } from "@mui/material";
import MainController, { Page } from "@src/MainController";
import { useNavigate } from "react-router-dom";
import Button from "@src/components/Button";
import Wrapper from "@src/components/Wrapper";
import Logo from "@src/components/Logo";
import { buyNft } from "@src/services/contract";
import { useGlobalStateContext } from "@src/GlobalStateContext";
import { LoadingButton } from "@mui/lab";
import { AppContext } from "@src/main";

const NoNFTMenu = () => {
  const {
    connectedWallet,
    selectedNftState: [selectedNft],
  } = useGlobalStateContext();
  const [isBuying, setIsBuying] = React.useState<boolean>(false);
  // if user successfully submitted a tx, keep loading until we fetch the nft
  const [buyDone, setBuyDone] = React.useState<boolean>(false);

  if (!connectedWallet || selectedNft.loading)
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <CircularProgress />
      </Box>
    );
  return (
    <>
      <LoadingButton
        loading={isBuying || buyDone}
        sx={(theme) => ({
          "&.Mui-disabled": {
            backgroundColor: theme.palette.menuButton.dark,
          },
          backgroundColor: theme.palette.menuButton.main,
        })}
        onClick={async () => {
          try {
            setIsBuying(true);
            await buyNft(connectedWallet);
            setBuyDone(true);
          } catch (_e) {
          } finally {
            setIsBuying(false);
          }
        }}
        variant="contained"
      >
        Create account (NFT)
      </LoadingButton>
      {/* <Select
        value={selectedNft ?? ""}
        onChange={(event) => {
          const newValue = event.target.value;
          if (typeof newValue !== "number") return;
          setSelectedNft(newValue);
        }}
      >
        {nfts?.map((nft) => (
          <MenuItem key={nft} value={nft}>
            {nft}
          </MenuItem>
        ))}
      </Select> */}
    </>
  );
};

const HasNFTMenu = () => {
  const {
    selectedDeckState: [selectedDeck],
  } = useGlobalStateContext();
  const navigate = useNavigate();

  return (
    <>
      <Button
        sx={(theme) => ({ backgroundColor: theme.palette.menuButton.main })}
        onClick={() => navigate(Page.CreateLobby)}
        disabled={selectedDeck == null}
      >
        Create
      </Button>
      <Button
        sx={(theme) => ({ backgroundColor: theme.palette.menuButton.main })}
        onClick={() => navigate(Page.OpenLobbies)}
        disabled={selectedDeck == null}
      >
        Lobbies
      </Button>
      <Button
        sx={(theme) => ({ backgroundColor: theme.palette.menuButton.main })}
        onClick={() => navigate(Page.MyGames)}
      >
        My Games
      </Button>
      <Button
        sx={(theme) => ({ backgroundColor: theme.palette.menuButton.main })}
        onClick={() => navigate(Page.Collection)}
      >
        Collection
      </Button>
      <Button
        sx={(theme) => ({ backgroundColor: theme.palette.menuButton.main })}
        onClick={() => navigate(Page.BuyPacks)}
      >
        Buy Packs
      </Button>
    </>
  );
};

const MainMenu = () => {
  const {
    connectedWallet,
    selectedNftState: [selectedNft],
  } = useGlobalStateContext();

  if (connectedWallet == null) return <></>;

  return (
    <>
      <Logo height={160} mainMenu />
      <Box paddingTop="96px" />
      <Wrapper small>
        <Box marginTop="48px" />
        <Box
          sx={{
            display: "flex",
            flexFlow: "column",
            gap: "24px",
          }}
        >
          {selectedNft.nft != null ? <HasNFTMenu /> : <NoNFTMenu />}
        </Box>
      </Wrapper>
    </>
  );
};

export default MainMenu;
