import * as React from "react";
import * as PIXI from "pixi.js";
import { GameView } from "./gameview";
import * as Utils from "./utils";
import { ResourceLoaderState } from "./resources";

interface AppState {
  gameView: JSX.Element | null;
}

export class App extends React.Component<{}, AppState> {
  public state: AppState = {
    gameView: <GameView firstState={new ResourceLoaderState()} />
  };

  render() {
    return <div className="container">{this.state.gameView}</div>;
  }
}
