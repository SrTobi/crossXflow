

export namespace Model {
    // in meter
    export const TileWidth = 30
    export const TileHeight = 30

    export const CarWidth = 1.8
    export const CarLength = 4.5

    export interface ICar {
        // in world coordinates
        pos: {
            x: number,
            y: number
        },
        // (0-360), 0 is up and it goes clockwise
        angle: number
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
            x: number,
            y: number
        }
    }

    export interface IStreet extends ITileBase {
        type: TileType.Street
        orientation: TileOrientation
    }

    export interface IEmpty extends ITileBase {
        tpye: TileType.Empty
    }

    export interface ICrossing extends ITileBase {
        tpye: TileType.Crossing
    }


    export type ITile = IStreet | ICrossing | IEmpty

    export interface IWorld {
        receiveCars(): ICar[]
        tiles: ITile[][]
    }
}