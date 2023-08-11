import { genCommitments, DECK_LENGTH } from "@cards/game-logic";
import type {
  CardDbId,
  CardRegistryId,
  LocalCard,
  MatchState,
  TickEvent,
  LobbyState,
} from "@cards/game-logic";
import * as Paima from "@cards/middleware";
import type { MatchExecutor } from "paima-sdk/paima-executors";
import type {
  IGetLobbyByIdResult,
  IGetPaginatedUserLobbiesResult,
} from "@cards/db";
import LocalStorage from "./LocalStorage";

// The MainController is a React component that will be used to control the state of the application
// It will be used to check if the user has metamask installed and if they are connected to the correct network
// Other settings also will be controlled here

// create string enum called AppState
export enum Page {
  Landing = "/login",
  MainMenu = "/",
  CreateLobby = "/create_lobby",
  OpenLobbies = "/open_lobbies",
  Game = "/game",
  MyGames = "/my_games",
  Collection = "/collection",
  BuyPacks = "/buy_packs",
  TradeNfts = "/trade_nfts",
}

// This is a class that will be used to control the state of the application
// the benefit of this is that it is very easy to test its logic unlike a react component
class MainController {
  userAddress: string | null = null;

  callback?: (
    page: Page | null,
    isLoading: boolean,
    extraData: null | IGetLobbyByIdResult
  ) => void;

  private checkCallback() {
    if (this.callback == null) {
      throw new Error("Callback is not set");
    }
  }

  private async enforceWalletConnected() {
    this.checkCallback();
    if (!this.isWalletConnected()) {
      this.callback?.(Page.Landing, false, null);
    }
    if (!this.userAddress) {
      await this.silentConnectWallet();
    }
  }

  private isWalletConnected = (): boolean => {
    return typeof window.ethereum !== "undefined" ? true : false;
  };

  async silentConnectWallet() {
    const response = await Paima.default.userWalletLogin("metamask");

    if (response.success === true) {
      this.userAddress = response.result.walletAddress;
    }
  }

  async connectWallet() {
    this.callback?.(Page.Landing, true, null);
    const response = await Paima.default.userWalletLogin("metamask");
    console.log("connect wallet response: ", response);
    if (response.success === true) {
      this.userAddress = response.result.walletAddress;
      this.callback?.(Page.MainMenu, false, null);
    } else {
      this.callback?.(Page.Landing, false, null);
    }
  }

  async fetchNft(address: string): Promise<undefined | number> {
    const response = await Paima.default.getNftForWallet(address);
    console.log("fetch nfts response: ", response);
    if (!response.success) return;
    return response.result.nft;
  }

  async loadLobbyState(lobbyId: string): Promise<LobbyState> {
    await this.enforceWalletConnected();
    this.callback?.(null, true, null);
    const response = await Paima.default.getLobbyState(lobbyId);
    console.log("get lobby state response: ", response);
    this.callback?.(null, false, null);
    if (!response.success || response.result.lobby == null) {
      throw new Error("Could not get lobby state");
    }
    return response.result.lobby;
  }

  async loadLobbyRaw(lobbyId: string): Promise<IGetLobbyByIdResult> {
    await this.enforceWalletConnected();
    this.callback?.(null, true, null);
    const response = await Paima.default.getLobbyRaw(lobbyId);
    console.log("get lobby state response: ", response);
    this.callback?.(null, false, null);
    if (!response.success || response.result.lobby == null) {
      throw new Error("Could not get lobby state");
    }
    return response.result.lobby;
  }

  async searchLobby(
    nftId: number,
    query: string,
    page: number
  ): Promise<IGetLobbyByIdResult[]> {
    await this.enforceWalletConnected();
    this.callback?.(null, true, null);
    const response = await Paima.default.getLobbySearch(nftId, query, page, 1);
    console.log("search lobby response: ", response);
    this.callback?.(null, false, null);
    if (!response.success) {
      throw new Error("Could not search lobby");
    }
    return response.result.lobbies;
  }

  async createLobby(
    creatorNftId: number,
    creatorDeck: { id: CardDbId; registryId: CardRegistryId }[],
    numOfRounds: number,
    timePerPlayer: number,
    isHidden = false,
    isPractice = false
  ): Promise<void> {
    await this.enforceWalletConnected();
    this.callback?.(null, true, null);
    console.log(
      "create lobby: ",
      creatorNftId,
      creatorDeck,
      numOfRounds,
      timePerPlayer,
      isHidden,
      isPractice
    );

    if (creatorDeck?.length !== DECK_LENGTH) {
      // shouldn't happen
      throw new Error(`createLobby: invalid deck`);
    }

    const commitments = await genCommitments(
      window.crypto,
      creatorDeck.map((card) => card.id)
    );
    const localDeck: LocalCard[] = creatorDeck.map((card, i) => ({
      id: card.id,
      registryId: card.registryId,
      salt: commitments.salt[i],
    }));

    const response = await Paima.default.createLobby(
      creatorNftId,
      commitments.commitments,
      numOfRounds,
      timePerPlayer,
      isHidden,
      isPractice
    );
    console.log("create lobby response: ", response);
    if (!response.success) {
      this.callback?.(null, false, null);
      throw new Error("Could not create lobby");
    }
    const lobbyRaw = await this.loadLobbyRaw(response.lobbyID);
    LocalStorage.setLobbyDeck(response.lobbyID, localDeck);
    this.callback?.(Page.Game, false, lobbyRaw);
  }

  async joinLobby(
    nftId: number,
    deck: { id: CardDbId; registryId: CardRegistryId }[],
    lobbyId: string
  ): Promise<void> {
    await this.enforceWalletConnected();
    this.callback?.(null, true, null);

    if (deck?.length !== DECK_LENGTH) {
      // shouldn't happen
      throw new Error(`joinLobby: invalid deck`);
    }

    const commitments = await genCommitments(
      window.crypto,
      deck.map((card) => card.id)
    );
    const localDeck: LocalCard[] = deck.map((card, i) => ({
      id: card.id,
      registryId: card.registryId,
      salt: commitments.salt[i],
    }));

    const response = await Paima.default.joinLobby(
      nftId,
      lobbyId,
      commitments.commitments
    );
    if (!response.success) {
      this.callback?.(null, false, null);
      throw new Error("Could not join lobby");
    }
    const resp = await Paima.default.getLobbyRaw(lobbyId);
    console.log("move to joined lobby response: ", response);
    if (!resp.success || resp.result.lobby == null) {
      this.callback?.(null, false, null);
      throw new Error("Could not download lobby state from join lobby");
    }
    LocalStorage.setLobbyDeck(resp.result.lobby.lobby_id, localDeck);
    this.callback?.(Page.Game, false, resp.result.lobby);
  }

  async moveToJoinedLobby(lobbyId: string): Promise<void> {
    await this.enforceWalletConnected();
    this.callback?.(null, true, null);
    const response = await Paima.default.getLobbyState(lobbyId);
    console.log("move to joined lobby response: ", response);
    if (!response.success || response.result.lobby == null) {
      this.callback?.(null, false, null);
      throw new Error("Could not join lobby");
    }
    this.callback?.(Page.Game, false, response.result.lobby);
  }

  async closeLobby(nftId: number, lobbyId: string): Promise<void> {
    await this.enforceWalletConnected();
    this.callback?.(null, true, null);
    const response = await Paima.default.closeLobby(nftId, lobbyId);
    console.log("close lobby response: ", response);
    if (!response.success) {
      this.callback?.(null, false, null);
      throw new Error("Could not close lobby");
    }
    this.callback?.(Page.MainMenu, false, null);
  }

  async getOpenLobbies(
    nftId: number,
    page = 0,
    limit = 100
  ): Promise<IGetLobbyByIdResult[]> {
    await this.enforceWalletConnected();
    this.callback?.(null, true, null);
    const response = await Paima.default.getOpenLobbies(nftId, page, limit);
    console.log("get open lobbies response: ", response);
    this.callback?.(null, false, null);
    if (!response.success) {
      throw new Error("Could not get open lobbies");
    }
    return response.result.lobbies;
  }

  async getMyGames(
    nftId: number,
    page = 0,
    limit = 100
  ): Promise<IGetPaginatedUserLobbiesResult[]> {
    await this.enforceWalletConnected();
    this.callback?.(null, true, null);
    const response = await Paima.default.getUserLobbiesMatches(
      nftId,
      page,
      limit
    );
    console.log("get my games response: ", response);
    this.callback?.(null, false, null);
    if (!response.success) {
      throw new Error("Could not get open lobbies");
    }
    return response.result.lobbies;
  }

  async getMatchExecutor(
    lobbyId: string,
    matchWithinLobby: number
  ): Promise<MatchExecutor<MatchState, TickEvent>> {
    await this.enforceWalletConnected();
    this.callback?.(null, true, null);
    const response = await Paima.default.getMatchExecutor(
      lobbyId,
      matchWithinLobby
    );
    console.log("get match executor: ", response);
    this.callback?.(null, false, null);
    if (!response.success) {
      throw new Error("Could not get match executor");
    }
    return response.result;
  }

  initialState(): Page {
    this.silentConnectWallet();
    return this.isWalletConnected() ? Page.MainMenu : Page.Landing;
  }
}

export default MainController;
