import {
  MatchState,
  TickEvent,
  LobbyState,
  genBotDeck,
  genCommitments,
  DECK_LENGTH,
} from "@dice/game-logic";
import type { CardRegistryId, LocalCard } from "@dice/game-logic";
import * as Paima from "@dice/middleware";
import { MatchExecutor } from "paima-sdk/paima-executors";
import { IGetLobbyByIdResult, IGetPaginatedUserLobbiesResult } from "@dice/db";
import { localDeckCache } from "./GlobalStateContext";

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
}

// This is a class that will be used to control the state of the application
// the benefit of this is that it is very easy to test its logic unlike a react component
class MainController {
  userAddress: string | null = null;

  callback: (
    page: Page | null,
    isLoading: boolean,
    extraData: IGetLobbyByIdResult
  ) => void;

  private checkCallback() {
    if (this.callback == null) {
      throw new Error("Callback is not set");
    }
  }

  private async enforceWalletConnected() {
    this.checkCallback();
    if (!this.isWalletConnected()) {
      this.callback(Page.Landing, false, null);
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
    this.callback(Page.Landing, true, null);
    const response = await Paima.default.userWalletLogin("metamask");
    console.log("connect wallet response: ", response);
    if (response.success === true) {
      this.userAddress = response.result.walletAddress;
      this.callback(Page.MainMenu, false, null);
    } else {
      this.callback(Page.Landing, false, null);
    }
  }

  async fetchNft(address: string): Promise<undefined | number> {
    const response = await Paima.default.getNftForWallet(address);
    console.log("fetch nfts response: ", response);
    if (!response.success) return;
    return response.result;
  }

  async loadLobbyState(lobbyId: string): Promise<LobbyState> {
    await this.enforceWalletConnected();
    this.callback(null, true, null);
    const response = await Paima.default.getLobbyState(lobbyId);
    console.log("get lobby state response: ", response);
    this.callback(null, false, null);
    if (!response.success) {
      throw new Error("Could not get lobby state");
    }
    return response.lobby;
  }

  async loadLobbyRaw(lobbyId: string): Promise<IGetLobbyByIdResult> {
    await this.enforceWalletConnected();
    this.callback(null, true, null);
    const response = await Paima.default.getLobbyRaw(lobbyId);
    console.log("get lobby state response: ", response);
    this.callback(null, false, null);
    if (!response.success) {
      throw new Error("Could not get lobby state");
    }
    return response.lobby;
  }

  async searchLobby(
    nftId: number,
    query: string,
    page: number
  ): Promise<LobbyState[]> {
    await this.enforceWalletConnected();
    this.callback(null, true, null);
    const response = await Paima.default.getLobbySearch(nftId, query, page, 1);
    console.log("search lobby response: ", response);
    this.callback(null, false, null);
    if (!response.success) {
      throw new Error("Could not search lobby");
    }
    return response.lobbies;
  }

  async createLobby(
    creatorNftId: number,
    creatorDeck: CardRegistryId[],
    numOfRounds: number,
    roundLength: number,
    timePerPlayer: number,
    isHidden = false,
    isPractice = false
  ): Promise<void> {
    await this.enforceWalletConnected();
    this.callback(null, true, null);
    console.log(
      "create lobby: ",
      creatorNftId,
      creatorDeck,
      numOfRounds,
      roundLength,
      timePerPlayer,
      isHidden,
      isPractice
    );

    if (creatorDeck?.length !== DECK_LENGTH) {
      // shouldn't happen
      throw new Error(`createLobby: invalid deck`);
    }

    const commitments = await genCommitments(window.crypto, creatorDeck);
    const localDeck: LocalCard[] = creatorDeck.map((cardId, i) => ({
      cardId,
      salt: commitments.salt[i],
    }));

    const response = await Paima.default.createLobby(
      creatorNftId,
      commitments.commitments,
      numOfRounds,
      roundLength,
      timePerPlayer,
      isHidden,
      isPractice
    );
    console.log("create lobby response: ", response);
    if (!response.success) {
      this.callback(null, false, null);
      throw new Error("Could not create lobby");
    }
    const lobbyRaw = await this.loadLobbyRaw(response.lobbyID);
    localDeckCache.set(response.lobbyID, localDeck);
    this.callback(Page.Game, false, lobbyRaw);
  }

  async joinLobby(
    nftId: number,
    deck: CardRegistryId[],
    lobbyId: string
  ): Promise<void> {
    await this.enforceWalletConnected();
    this.callback(null, true, null);

    if (deck?.length !== DECK_LENGTH) {
      // shouldn't happen
      throw new Error(`joinLobby: invalid deck`);
    }

    const commitments = await genCommitments(window.crypto, deck);
    const localDeck: LocalCard[] = deck.map((cardId, i) => ({
      cardId,
      salt: commitments.salt[i],
    }));

    const response = await Paima.default.joinLobby(
      nftId,
      lobbyId,
      commitments.commitments
    );
    if (!response.success) {
      this.callback(null, false, null);
      throw new Error("Could not join lobby");
    }
    const resp = await Paima.default.getLobbyRaw(lobbyId);
    console.log("move to joined lobby response: ", response);
    if (!resp.success) {
      this.callback(null, false, null);
      throw new Error("Could not download lobby state from join lobby");
    }
    localDeckCache.set(resp.lobby.lobby_id, localDeck);
    this.callback(Page.Game, false, resp.lobby);
  }

  async moveToJoinedLobby(lobbyId: string): Promise<void> {
    await this.enforceWalletConnected();
    this.callback(null, true, null);
    const response = await Paima.default.getLobbyState(lobbyId);
    console.log("move to joined lobby response: ", response);
    if (!response.success) {
      this.callback(null, false, null);
      throw new Error("Could not join lobby");
    }
    this.callback(Page.Game, false, response.lobby);
  }

  async closeLobby(nftId: number, lobbyId: string): Promise<void> {
    await this.enforceWalletConnected();
    this.callback(null, true, null);
    const response = await Paima.default.closeLobby(nftId, lobbyId);
    console.log("close lobby response: ", response);
    if (!response.success) {
      this.callback(null, false, null);
      throw new Error("Could not close lobby");
    }
    this.callback(Page.MainMenu, false, null);
  }

  async getOpenLobbies(
    nftId: number,
    page = 0,
    limit = 100
  ): Promise<LobbyState[]> {
    await this.enforceWalletConnected();
    this.callback(null, true, null);
    const response = await Paima.default.getOpenLobbies(nftId, page, limit);
    console.log("get open lobbies response: ", response);
    this.callback(null, false, null);
    if (!response.success) {
      throw new Error("Could not get open lobbies");
    }
    return response.lobbies;
  }

  async getMyGames(
    nftId: number,
    page = 0,
    limit = 100
  ): Promise<IGetPaginatedUserLobbiesResult[]> {
    await this.enforceWalletConnected();
    this.callback(null, true, null);
    const response = await Paima.default.getUserLobbiesMatches(
      nftId,
      page,
      limit
    );
    console.log("get my games response: ", response);
    this.callback(null, false, null);
    if (!response.success) {
      throw new Error("Could not get open lobbies");
    }
    return response.lobbies;
  }

  async getMatchExecutor(
    lobbyId: string,
    matchWithinLobby: number
  ): Promise<MatchExecutor<MatchState, TickEvent>> {
    await this.enforceWalletConnected();
    this.callback(null, true, null);
    const response = await Paima.default.getMatchExecutor(
      lobbyId,
      matchWithinLobby
    );
    console.log("get match executor: ", response);
    this.callback(null, false, null);
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
