import * as React from "react";
import * as PIXI from 'pixi.js';
import {GameView} from './gameview';
import * as Utils from './utils';
import {ResourceLoaderState} from './resources';


interface AppState {
    gameView: JSX.Element | null;
}

export class App extends React.Component<{}, AppState>{

    public state: AppState = { gameView: <GameView  firstState={new ResourceLoaderState()} /> };

    
    render() {
        return (
                <div>
                    <a href="https://github.com/srtobi/https://github.com/SrTobi/crossXflow">
                        <img
                            style={{position: "absolute", top: 0, right: 0, border: 0}}
                            src="https://camo.githubusercontent.com/a6677b08c955af8400f44c6298f40e7d19cc5b2d/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677261795f3664366436642e706e67"
                            alt="Fork me on GitHub"
                            data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png" />
                    </a>
                    <div className="main-container">
                        <div className="page-header-container">
                            <h1>crossXflow</h1>
                        </div>
                        <div className="content-container">
                            {this.state.gameView}
                        </div>
                    </div>
                </div>
            );
    }
}