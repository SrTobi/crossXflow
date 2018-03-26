import * as PIXI from "pixi.js";
import { State } from "./gameview";
import { LoadState } from "./loadstate";
import { GameState } from "./gamestate";

type OrientationString = "ns" | "we" | "se" | "ne" | "nw" | "sw";

export interface Resources {
  tiles: {
    crossing: PIXI.Texture;
    street: { [key: string]: PIXI.Texture };
    car: PIXI.Texture[];
  };
}

export class ResourceLoaderState extends LoadState {
  constructor() {
    super();
  }

  load(loader: PIXI.loaders.Loader): void {
    loader.add("atlas", "assets/tiles.json");
    loader.add("music", "assets/waltz_short.mp3")
  }

  loaded(loader: PIXI.loaders.Loader, res: any): State {
    let tiles: any = res.atlas.textures;
    let tex = (name: string): PIXI.Texture => tiles[name];

    let resources: Resources = {
      tiles: {
        crossing: tex("crossing.png"),
        street: {
          ns: tex("street-ns.png"),
          we: tex("street-we.png"),
          se: tex("street-se.png"),
          ne: tex("street-ne.png"),
          nw: tex("street-nw.png"),
          sw: tex("street-sw.png")
        },
        car: [1, 2, 3].map(idx => tex(`car-${idx}.png`))
      }
    };

    const music = res.music.data as PIXI.sound.Sound
    music.loop = true
    music.play({ loop: true })

    return new GameState(resources);
  }
}
