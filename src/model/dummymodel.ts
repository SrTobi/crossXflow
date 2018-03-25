import { Model } from "../modeldef";




class DummyModel implements Model.IWorld {
    update() {
    }

    get cars(): Model.ICar[] {
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