import * as PIXI from "pixi.js";
import * as Utils from "./utils";
import { Resources } from "./resources";
import { Tile, EmptyTile, CrossingTile, StreetTile } from "./tiledef";
import { Model } from "./modeldef";

export class World extends PIXI.Container {
  constructor(
    public width: number,
    public height: number,
    private tiles: Tile[][]
  ) {
    super();

    for (let x = 0; x < width; ++x) {
      for (let y = 0; y < height; ++y) {
        this.addChild(this.at(x, y));
      }
    }
  }

  setView(x: number, y: number, width: number, height: number) {}

  at(x: number, y: number): Tile {
    return this.tiles[x][y];
  }

  update(dt: number): void {}
}

class Interval {
  private _min: number;
  private _max: number;

  constructor(begin: number, end: number) {
    this._min = Math.min(begin, end);
    this._max = Math.max(begin, end);
  }

  min(): number {
    return this._min;
  }

  max(): number {
    return this._max;
  }

  size(): number {
    return this.max() - this.min() + 1; // max is inclusive!
  }

  intersects(other: Interval): boolean {
    return (
      Math.min(this.max(), other.max()) >= Math.max(this.min(), other.min())
    );
  }

  intersect(other: Interval): Interval {
    if (!this.intersects(other)) {
      throw "Intervals do not intersect!";
    }
    return new Interval(
      Math.max(this.min(), other.min()),
      Math.min(this.max(), other.max())
    );
  }

  hull(other: Interval): Interval {
    return new Interval(
      Math.min(this.min(), other.min()),
      Math.max(this.max(), other.max())
    );
  }

  rand(): number {
    return this.min() + Math.floor(this.size() * Math.random());
  }
}

export class WorldGenerator {
  constructor(private resources: Resources) {}

  buildWorld(map: Model.ITile[][]): World {
    return new World(
      map.length,
      map[0].length,
      map.map((row, x) =>
        row
          .map(tile => {
            switch (tile.type) {
              case Model.TileType.Crossing:
                return new CrossingTile(this.resources);
              case Model.TileType.Street:
                return new StreetTile(tile.orientation, this.resources);
              default:
                return new EmptyTile();
            }
          })
          .map((tile, y) => {
            tile.x = x;
            tile.y = y;
            return tile;
          })
      )
    );
  }
}
