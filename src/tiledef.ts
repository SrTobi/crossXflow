import * as PIXI from "pixi.js";
import * as Utils from "./utils";
import { Resources } from "./resources";
import { Model } from "./modeldef";

export abstract class Tile extends PIXI.Container {
  update(dt: number): void {}
}

export abstract class ImageTile extends Tile {
  abstract getTileImg(res: Resources): PIXI.Sprite;

  constructor(private res: Resources) {
    super();
    this.createTex();
  }

  createTex() {
    this.addChild(this.getTileImg(this.res));
  }

  makeSprite(tex: PIXI.Texture) {
    let sprite = new PIXI.Sprite(tex);
    sprite.scale.x = 1 / sprite.width;
    sprite.scale.y = 1 / sprite.height;
    return sprite;
  }
}

export class EmptyTile extends Tile {}

export class CrossingTile extends ImageTile {
  getTileImg(res: Resources) {
    return this.makeSprite(res.tiles.crossing);
  }
}

export class StreetTile extends ImageTile {
  private orientation: Model.TileOrientation;
  constructor(orientation: Model.TileOrientation, res: Resources) {
    super(res);
    this.orientation = orientation;
    super.createTex();
  }

  createTex() {}

  getTileImg(res: Resources) {
    let tileOrientation = "";
    switch (this.orientation) {
      case Model.TileOrientation.NorthSouth:
        tileOrientation = "ns";
        break;
      case Model.TileOrientation.WestEast:
        tileOrientation = "we";
        break;
      case Model.TileOrientation.SouthEast:
        tileOrientation = "se";
        break;
      case Model.TileOrientation.NorthEast:
        tileOrientation = "ne";
        break;
      case Model.TileOrientation.NorthWest:
        tileOrientation = "nw";
        break;
      case Model.TileOrientation.SouthWest:
        tileOrientation = "sw";
        break;
      default:
        console.log(this.orientation);
        tileOrientation = "we";
        break;
    }
    console.log(tileOrientation);
    return this.makeSprite(res.tiles.street[tileOrientation]);
  }
}
