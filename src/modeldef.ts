export namespace Model {
  export const StepsPerSecond = 30;
  export const TargetSpeed = 10;
  export const MaxSpeed = 30;
  export const MaxAcceleration = 100;

  // in meter
  export const TileWidth = 30;
  export const TileHeight = 30;

  export const TrackMin = 13;
  export const TrackMax = 17;

  export const CarWidth = 1.8;
  export const CarLength = 4.5;

  export const LaneWidth = 3;

  export interface ICar {
    // in world coordinates
    pos: {
      x: number;
      y: number;
    };
    // (0-360), 0 is up and it goes clockwise
    angle: number;
    id: number;
  }

  export enum TileType {
    Empty,
    Crossing,
    Street
  }

  export enum TileOrientation {
    NorthSouth,
    WestEast,
    SouthEast,
    NorthEast,
    NorthWest,
    SouthWest
  }

  export interface ITileBase {
    // so that IWorld.tiles[x][y]
    coord: {
      x: number;
      y: number;
    };
  }

  export interface IStreet extends ITileBase {
    type: TileType.Street;
    orientation: TileOrientation;
  }

  export interface IEmpty extends ITileBase {
    type: TileType.Empty;
  }

  export interface ICrossing extends ITileBase {
    type: TileType.Crossing;
  }

  export type ITile = IStreet | ICrossing | IEmpty;

  export interface IWorld {
    update(): void;

    readonly cars: ICar[];
    readonly tiles: ITile[][];
  }
}
