import React, { useState, useEffect, useContext } from "react";
import type MainController from "@src/MainController";
import { Page } from "@src/MainController";
import LandingPage from "./Landing";
import MainMenu from "./MainMenu";
import OpenLobbies from "./OpenLobbies";
import MyGames from "./MyGames";
import CreateLobby from "./CreateLobby";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./PageCoordinator.scss";
import { AppContext } from "@src/main";
import { Lobby } from "./CardGame/Lobby";
import type { IGetLobbyByIdResult } from "@cards/db";
import BuyPack from "./BuyPack";
import Collection from "./Collection";
import TradeNfts from "./TradeNfts";

const PageCoordinator: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mainController: MainController = useContext(AppContext) as any;
  const navigate = useNavigate();

  const [lobby, setLobby] = useState<null | IGetLobbyByIdResult>(null);

  useEffect(() => {
    mainController.callback = (
      newPage: Page | null,
      isLoading: boolean,
      extraData: IGetLobbyByIdResult | null
    ) => {
      // Update the local state and show a message to the user
      if (newPage === Page.Game) {
        setLobby(extraData);
      }
      if (newPage) {
        navigate(newPage);
      }
    };
  }, [mainController, navigate]);

  return (
    <div>
      <Routes>
        <Route path={Page.MainMenu} element={<MainMenu />} />
        <Route path={Page.OpenLobbies} element={<OpenLobbies />} />
        <Route path={Page.MyGames} element={<MyGames />} />
        <Route path={Page.Game} element={<Lobby initialLobbyRaw={lobby} />} />
        <Route path={Page.CreateLobby} element={<CreateLobby />} />
        <Route path={Page.Landing} element={<LandingPage />} />
        <Route path={Page.Collection} element={<Collection />} />
        <Route path={Page.BuyPacks} element={<BuyPack />} />
        <Route path={Page.TradeNfts} element={<TradeNfts />} />
        <Route element={<div>There was something wrong...</div>} />
      </Routes>
    </div>
  );
};

export default PageCoordinator;
