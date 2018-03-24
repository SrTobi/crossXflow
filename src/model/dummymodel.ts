import { Model } from "../modeldef";




class DummyModel implements Model.IWorld {
    receiveCars(): Model.ICar[] {
        return []
    }


    tiles: Model.ITile[][] = [[
        {
            coord: {
                x: 0,
                y: 0
            },
            type: Model.TileType.Crossing
        }
    ]]
}