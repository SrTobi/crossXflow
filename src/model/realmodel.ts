import { Model } from "../modeldef";


class Vector {
    constructor(
        public readonly x: number,
        public readonly y: number) {
    }

    add(v: Vector): Vector {
        return new Vector(this.x + v.x, this.y + v.y)
    }

    negative(): Vector {
        return new Vector(-this.x, -this.y)
    }

    minus(v: Vector): Vector {
        return new Vector(this.x - v.x, this.y - v.y)
    }

    mul(s: number): Vector {
        return new Vector(s * this.x, s * this.y)
    }
}

var nextId = 1

class Car {
    private randomList: number[] = []
    private curRand: number = 0
    readonly id = nextId++

    public alive: boolean = true

    private get random(): number {
        return this.randomList[this.curRand % 10]
    }

    public roadToTake(futureIdx: number, possibleRoads: number): number {
        return Math.floor(this.randomList[(this.curRand + futureIdx) % 10] * possibleRoads)
    }

    public gotoNextRoad(possibleRoads: number): number {
        const road = this.roadToTake(0, possibleRoads)
        ++this.curRand
        return road
    }


    constructor(
        public edge: Edge,
        public alpha: number = 0,
        public speed: number = 0,
        public acceleration: number = 0
    ) {
        for (let i = 0; i < 10; ++i) {
            this.randomList.push(Math.random())
        }
    }

}

class Node {
    outs: Edge[] = []
    ins: Edge[] = []

    constructor(public pos: Vector) {

    }
}

class Reserved {
    constructor(
        public edge: Edge,
        public startStep: number,
        public steps: number
    ) {
    }


    get endStep(): number {
        return this.startStep + this.steps
    }
}



class Edge {
    public done = false
    public curRound = 0
    public cars: Car[] = []
    public reserved: Reserved[] = []
    public sameCollision: Edge[] = []
    public antiCollision: Edge[] = []

    constructor(
        public from: Node,
        public to: Node,
        public length: number,
        public resevreNexts = 0
    ) {
    }

    checkRound(round: number): boolean {
        if (round != this.curRound) {
            this.curRound = round
            this.reserved = []
            return true
        } else {
            return false
        }
    }
}


class Tile {
    constructor(
        public coords: Vector,
        public inNodes: (Node | null)[],
        public outNodes: (Node | null)[],
        addNodes: Node[] = []
    ) {
        for (const n of this.inNodes) {
            if (n) {
                n.pos = n.pos.add(this.pos)
            }
        }

        for (const n of this.outNodes) {
            if (n) {
                n.pos = n.pos.add(this.pos)
            }
        }
        for (const n of addNodes) {
            n.pos = n.pos.add(this.pos)
        }
    }

    get pos(): Vector {
        return this.coords.mul(Model.TileWidth)
    }
}

function makeSameCollision(e1: Edge, e2: Edge) {
    e1.sameCollision.push(e2)
    e2.sameCollision.push(e1)
}

function makeAntiCollision(e1: Edge, e2: Edge) {
    e1.antiCollision.push(e2)
    e2.antiCollision.push(e1)
}

function connect(from: Node, to: Node, length: number, reserveNexts?: number): Edge {
    const e = new Edge(from, to, length, reserveNexts)
    from.outs.push(e)
    to.ins.push(e)
    return e
}

function mergeNodes(n1: Node, n2: Node): Node {
    if (n1.pos.x != n2.pos.x || n1.pos.y != n2.pos.y) {
        throw new Error("merged nodes should be on the same position")
    }

    for (let i = 0; i < n2.ins.length; ++i) {
        const e = n2.ins[i]
        e.to = n1
        n1.ins.push(e)
    }

    for (let i = 0; i < n2.outs.length; ++i) {
        const e = n2.outs[i]
        e.from = n1
        n1.outs.push(e)
    }

    return n1
}

function setupTileNodes(tmpl: Model.ITile, pos: Vector): Tile {
    if (tmpl.type === Model.TileType.Street) {
        const o = tmpl.orientation
        if (o === Model.TileOrientation.NorthSouth) {
            const topMin = new Node(new Vector(Model.TrackMin, Model.TileHeight))
            const topMax = new Node(new Vector(Model.TrackMax, Model.TileHeight))
            const bottomMin = new Node(new Vector(Model.TrackMin, 0))
            const bottomMax = new Node(new Vector(Model.TrackMax, 0))

            connect(topMin, bottomMin, Model.TileHeight)
            connect(bottomMax, topMax, Model.TileHeight)

            return new Tile(pos, [bottomMax, null, topMin, null], [topMax, null, bottomMin, null])

        } else if (o === Model.TileOrientation.WestEast) {
            const rightMin = new Node(new Vector(Model.TileWidth, Model.TrackMin))
            const rightMax = new Node(new Vector(Model.TileWidth, Model.TrackMax))
            const leftMin = new Node(new Vector(0, Model.TrackMin))
            const leftMax = new Node(new Vector(0, Model.TrackMax))

            connect(rightMax, leftMax, Model.TileWidth)
            connect(leftMin, rightMin, Model.TileWidth)

            return new Tile(pos, [null, leftMin, null, rightMax], [null, rightMin, null, leftMax])

        } else {
            throw new Error("not implemented")
        }
    } else if (tmpl.type === Model.TileType.Crossing) {

        // todo fix
        const topMin = new Node(new Vector(Model.TrackMin, Model.TileHeight))
        const topMax = new Node(new Vector(Model.TrackMax, Model.TileHeight))
        const vMidMax = new Node(new Vector(Model.TrackMax, Model.TileHeight / 2))
        const vMidMin = new Node(new Vector(Model.TrackMin, Model.TileHeight / 2))
        const bottomMin = new Node(new Vector(Model.TrackMin, 0))
        const bottomMax = new Node(new Vector(Model.TrackMax, 0))

        const vnw = connect(topMin, vMidMin, Model.TileHeight / 2, 2)
        const vsw = connect(vMidMin, bottomMin, Model.TileHeight / 2)
        const vse = connect(bottomMax, vMidMax, Model.TileHeight / 2, 2)
        const vne = connect(vMidMax, topMax, Model.TileHeight / 2)

        const rightMin = new Node(new Vector(Model.TileWidth, Model.TrackMin))
        const rightMax = new Node(new Vector(Model.TileWidth, Model.TrackMax))
        const hMidMin = new Node(new Vector(Model.TileWidth / 2, Model.TrackMin))
        const hMidMax = new Node(new Vector(Model.TileWidth / 2, Model.TrackMax))
        const leftMin = new Node(new Vector(0, Model.TrackMin))
        const leftMax = new Node(new Vector(0, Model.TrackMax))

        const hne = connect(rightMax, hMidMax, Model.TileWidth / 2, 2)
        const hnw = connect(hMidMax, leftMax, Model.TileWidth / 2)
        const hsw = connect(leftMin, hMidMin, Model.TileWidth / 2, 2)
        const hse = connect(hMidMin, rightMin, Model.TileWidth / 2)

        makeAntiCollision(vnw, hnw)
        makeAntiCollision(vne, hne)
        makeAntiCollision(vsw, hsw)
        makeAntiCollision(vse, vse)

        return new Tile(pos, [bottomMax, leftMin, topMin, rightMax], [topMax, rightMin, bottomMin, leftMax], [vMidMax, vMidMin, hMidMin, hMidMax])
    } else {
        return new Tile(pos, [null, null, null, null], [null, null, null, null])
    }
}

function empty(): Model.ITile{
    return {
        coord: { x:0, y: 0},
        type: Model.TileType.Empty
    }
}
function horizontal(): Model.ITile {
    return {
        coord: {x: 0, y: 0},
        type: Model.TileType.Street,
        orientation: Model.TileOrientation.NorthSouth
    }
}

function vertical(): Model.ITile {
    return {
        coord: {x: 0, y: 0},
        type: Model.TileType.Street,
        orientation: Model.TileOrientation.WestEast
    }
}

function cross(): Model.ITile {
    return {
        coord: {x: 0, y: 0},
        type: Model.TileType.Crossing
    }
}

export class BackendWorld implements Model.IWorld {
    
    tiles: Model.ITile[][] = [
        [empty(), vertical(), empty()],
        [horizontal(), cross(), horizontal()],
        [empty(), vertical(), empty()]
    ]

    private genNodes: Node[] = []

    private pieces: Tile[][] = []
    private autos: Car[] = []

    private round: number = 1

    constructor() {
        for (let x = 0; x < this.tiles.length; ++x) {
            this.pieces.push([])
            for (let y = 0; y < this.tiles[0].length; ++y) {
                this.tiles[x][y].coord = {x, y}
                this.pieces[x].push(setupTileNodes(this.tiles[x][y], new Vector(x, y)))
            }
        }

        const dirs = [new Vector(0, -1), new Vector(-1, 0), new Vector(0, 1), new Vector(1, 0)]

        // merge nodes
        for (let x = 0; x < this.pieces.length; ++x) {
            for (let y = 0; y < this.pieces[0].length; ++y) {
                const pos = new Vector(x, y)
                for (const diri of [0, 1, 2, 3]) {
                    const dir = dirs[diri]
                    const to = pos.add(dir)
                    const t1 = this.pieces[x][y]
                    if (to.x >= 0 && to.y >= 0 && to.x < this.pieces.length && to.y < this.pieces[0].length) {
                        const t2 = this.pieces[to.x][to.y]
                        const n1 = t1.inNodes[diri]
                        const n2 = t2.outNodes[diri]

                        if((n1 == null) != (n2 == null)) {
                            throw new Error("!!!!")
                        } else if (n1 != null && n2 != null) {
                            const n = mergeNodes(n1, n2)
                            t1.inNodes[diri] = n
                            t2.outNodes[diri] = n
                        }
                    } else {
                        if (to.y < 0) {
                            const n = t1.inNodes[0]
                            if (n) {
                                this.genNodes.push(n)
                            }
                        }

                        if (to.x < 0) {
                            const n = t1.inNodes[1]
                            if (n) {
                                this.genNodes.push(n)
                            }
                        }
                        
                        if (to.y >= this.pieces[0].length) {
                            const n = t1.inNodes[2]
                            if (n) {
                                this.genNodes.push(n)
                            }
                        }

                        if (to.x >= this.pieces.length) {
                            const n = t1.inNodes[3]
                            if (n) {
                                this.genNodes.push(n)
                            }
                        }
                    }
                }
            }
        }
    }

    insertCars() {
        // insert cars
        for (const n of this.genNodes) {
            const e = n.outs[0]
            const car = e.cars[e.cars.length - 1]
            let canCreate = true
            if (car) {
                canCreate = false
                if (car.alpha * e.length > Model.CarLength) {
                    canCreate = true
                }
            }
            if (canCreate && Math.random() < 0.07) {
                // new car
                const c = new Car(e, 0, 0, 0)
                e.cars.push(c)
                this.autos.push(c)
            }
        }
    }

    updateCars() {
        // update cars
        let kill = false
        for (const car of this.autos) {
            car.speed += car.acceleration / Model.StepsPerSecond
            let meters = car.speed / Model.StepsPerSecond
            while (meters > 0) {
                const alphaDiff = meters / car.edge.length
                car.alpha += alphaDiff

                if (car.alpha > 1) {
                    meters = (car.alpha - 1) * car.edge.length
                    car.alpha = 0
                    const index = car.edge.cars.indexOf(car)
                    if (index < 0) {
                        throw new Error("car wasn't on this edge's list")
                    }
                    car.edge.cars.splice(index, 1)
                    const outs = car.edge.to.outs
                    if (outs.length == 0) {
                        meters = 0
                        car.alive = false
                        kill = true
                    } else {
                        car.edge = outs[car.gotoNextRoad(outs.length)]
                        car.edge.cars.push(car)
                    }
                } else {
                    meters = 0
                }
            }
        }

        if (kill) {
            this.autos = this.autos.filter(car => car.alive)
        }
    }

    controllCars() {
        this.round++
        const processEdge = (edge: Edge) => {
            if (edge.checkRound(this.round)) {
                const {to} = edge

                // process dependent edges
                for (const next of to.outs) {
                    processEdge(next)
                }

                // process all cars that are on this edge
                edge.cars.forEach((car, i) => {
                    const nextEdge = edge.to.outs[car.roadToTake(0, edge.to.outs.length)]
                    const sameEdge = i > 0
                    car.acceleration = Model.MaxAcceleration / 2
                    if (sameEdge || nextEdge) {
                        const nextCar: Car | undefined = sameEdge ? edge.cars[i - 1] : nextEdge.cars[nextEdge.cars.length - 1]

                        if (nextCar) {
                            const alphaDiff = sameEdge? car.alpha - nextCar.alpha : car.alpha - 1 - (nextEdge.length / edge.length) * nextCar.alpha
                            car.acceleration = (1/Model.StepsPerSecond) * (-700 * (alphaDiff) - 100 * (car.speed - nextCar.speed))
                        }
                    }

                    if (car.speed + car.acceleration / Model.StepsPerSecond > Model.MaxSpeed) {
                        car.acceleration = 0
                        car.speed = Model.MaxSpeed
                    }
                    
                })
            }
        }

        for (const n of this.genNodes) {
            for (const e of n.outs) {
                processEdge(e)
            }
        }
    }

    update() {
        this.insertCars()
        this.controllCars()
        this.updateCars()
    }

    get cars(): Model.ICar[] {
        return this.autos.map((car) => {
            const {from, to} = car.edge
            return {
                pos: to.pos.minus(from.pos).mul(car.alpha).add(from.pos),
                angle: 0,
                id: car.id
            }
        })
    }
}