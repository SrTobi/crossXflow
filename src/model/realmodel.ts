import { Model } from "../modeldef";

class Vector {
    constructor(public readonly x: number, public readonly y: number) {}
    
    add(v: Vector): Vector {
        return new Vector(this.x + v.x, this.y + v.y);
    }
    
    negative(): Vector {
        return new Vector(-this.x, -this.y);
    }
    
    minus(v: Vector): Vector {
        return new Vector(this.x - v.x, this.y - v.y);
    }
    
    mul(s: number): Vector {
        return new Vector(s * this.x, s * this.y);
    }
    rotate(angle: number): Vector {
        return new Vector(
            this.x * Math.cos(angle) - this.y * Math.sin(angle),
            this.x * Math.sin(angle) + this.y * Math.cos(angle)
        );
    }
    
    get angle(): number {
        return Math.atan2(this.y, this.x);
    }
    get length(): number {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
}

var nextId = 1;

class Car {
    private randomList: number[] = [];
    private curRand: number = 0;
    readonly id = nextId++;
    
    public alive: boolean = true;
    
    private get random(): number {
        return this.randomList[this.curRand % 10];
    }
    
    public roadToTake(futureIdx: number, possibleRoads: number): number {
        return Math.floor(
            this.randomList[(this.curRand + futureIdx) % 10] * possibleRoads
        );
    }
    
    public gotoNextRoad(possibleRoads: number): number {
        const road = this.roadToTake(0, possibleRoads);
        ++this.curRand;
        return road;
    }
    
    constructor(
        public edge: Edge,
        public alpha: number = 0,
        public speed: number = 0,
        public acceleration: number = 0
    ) {
        for (let i = 0; i < 10; ++i) {
            this.randomList.push(Math.random());
        }
    }
}

class Node {
    outs: Edge[] = [];
    ins: Edge[] = [];
    
    constructor(public pos: Vector) {}
}

namespace EdgeShapes {
    export const Straight: EdgeShape = {
        fn: t => new Vector(t, 0),
        length: 1
    };
    export const Sinus: EdgeShape = {
        fn: t => new Vector(t, 0.03 * Math.sin(2 * Math.PI * t)),
        length: 1
    };
    export const CrossingInnerTurnRight: EdgeShape = {
        fn: t => {
            const totalLength = Model.CarLength + Math.PI * Model.LaneWidth / 2;
            const baseLength = (Model.CarLength + Model.LaneWidth) / Math.SQRT2;
            const tChange = Model.CarLength / (2 * totalLength);
            if (t <= tChange) {
                return new Vector(t, t).mul(
                    totalLength / (2 * Math.SQRT2 * baseLength)
                );
            } else if (t >= 1 - tChange) {
                return new Vector(1, 0).minus(
                    new Vector(t, t).mul(totalLength / (2 * Math.SQRT2 * baseLength))
                );
            } else {
                const tCircle = (t - tChange) / (1 - 2 * tChange);
                return new Vector(1, 1)
                .mul(Model.CarLength / (4 * Math.SQRT2 * baseLength))
                .add(
                    new Vector(
                        0.5 - Math.cos((2 * tCircle + 1) * Math.PI / 4) / Math.SQRT2,
                        -0.5 + Math.sin((2 * tCircle + 1) * Math.PI / 4) / Math.SQRT2
                    ).mul(Model.LaneWidth / Math.SQRT2)
                );
            }
        },
        length: 1
    };
    export const RightTurn: EdgeShape = {
        fn: t =>
        new Vector(
            0.5 - Math.cos((2 * t + 1) * Math.PI / 4) / Math.SQRT2,
            -0.5 + Math.sin((2 * t + 1) * Math.PI / 4) / Math.SQRT2
        ),
        length: Math.PI / (2 * Math.SQRT2)
    };
}

class Lock {
    holder: null | Car = null
}

interface EdgeShape {
    fn: (t: number) => Vector; // t in [0, 1]; Vector in [(0,0), (1,1)]
    length: number;
}

class Edge {
    public cars: Car[] = [];
    public length: number;
    
    public done = false;
    public curRound = 0;
    
    constructor(
        public from: Node,
        public to: Node,
        public shape: EdgeShape,
        public locks: Lock[]
    ) {
        this.length = this.to.pos.minus(this.from.pos).length * this.shape.length;
    }
    
    getPosition(t: number) {
        const diffVector = this.to.pos.minus(this.from.pos);
        const amplitudeFactor = diffVector.length;
        const angleShift = diffVector.angle;
        return this.shape
        .fn(t)
        .mul(amplitudeFactor)
        .rotate(angleShift)
        .add(this.from.pos);
    }
    getAngle(t: number) {
        const diffquot = this.getPosition(t + 0.01).minus(
            this.getPosition(t - 0.01)
        );
        return diffquot.angle;
    }
    
    checkRound(round: number): boolean {
        if (round != this.curRound) {
            this.curRound = round;
            //this.reserved = [];
            return true;
        } else {
            return false;
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
                n.pos = n.pos.add(this.pos);
            }
        }
        
        for (const n of this.outNodes) {
            if (n) {
                n.pos = n.pos.add(this.pos);
            }
        }
        for (const n of addNodes) {
            n.pos = n.pos.add(this.pos);
        }
    }
    
    get pos(): Vector {
        return this.coords.mul(Model.TileWidth);
    }
}


function connect(
    from: Node,
    to: Node,
    shape: EdgeShape = EdgeShapes.Straight,
    lock?: Lock[]
) {
    const e = new Edge(from, to, shape, lock || []);
    from.outs.push(e);
    to.ins.push(e);
    return e;
}

function mergeNodes(n1: Node, n2: Node): Node {
    if (n1.pos.x != n2.pos.x || n1.pos.y != n2.pos.y) {
        throw new Error("merged nodes should be on the same position");
    }
    
    for (let i = 0; i < n2.ins.length; ++i) {
        const e = n2.ins[i];
        e.to = n1;
        n1.ins.push(e);
    }
    
    for (let i = 0; i < n2.outs.length; ++i) {
        const e = n2.outs[i];
        e.from = n1;
        n1.outs.push(e);
    }
    
    return n1;
}

function setupTileNodes(tmpl: Model.ITile, pos: Vector): Tile {
    if (tmpl.type === Model.TileType.Street) {
        const o = tmpl.orientation;
        if (o === Model.TileOrientation.NorthSouth) {
            const topMin = new Node(new Vector(Model.TrackMin, Model.TileHeight));
            const topMax = new Node(new Vector(Model.TrackMax, Model.TileHeight));
            const bottomMin = new Node(new Vector(Model.TrackMin, 0));
            const bottomMax = new Node(new Vector(Model.TrackMax, 0));
            
            connect(topMin, bottomMin);
            connect(bottomMax, topMax);
            
            return new Tile(
                pos,
                [bottomMax, null, topMin, null],
                [topMax, null, bottomMin, null]
            );
        } else if (o === Model.TileOrientation.WestEast) {
            const rightMin = new Node(new Vector(Model.TileWidth, Model.TrackMin));
            const rightMax = new Node(new Vector(Model.TileWidth, Model.TrackMax));
            const leftMin = new Node(new Vector(0, Model.TrackMin));
            const leftMax = new Node(new Vector(0, Model.TrackMax));
            
            connect(rightMax, leftMax);
            connect(leftMin, rightMin);
            
            return new Tile(
                pos,
                [null, leftMin, null, rightMax],
                [null, rightMin, null, leftMax]
            );
        } else {
            throw new Error("not implemented");
        }
    } else if (tmpl.type === Model.TileType.Crossing) {
        // todo fix
        const topMin = new Node(new Vector(Model.TrackMin, Model.TileHeight));
        const topMax = new Node(new Vector(Model.TrackMax, Model.TileHeight));
        const bottomMin = new Node(new Vector(Model.TrackMin, 0));
        const bottomMax = new Node(new Vector(Model.TrackMax, 0));
        
        const topIn = new Node(
            new Vector(Model.TrackMin, Model.TileHeight / 2 + 2 * Model.LaneWidth)
        );
        const bottomOut = new Node(
            new Vector(Model.TrackMin, Model.TileHeight / 2 - 2 * Model.LaneWidth)
        );
        const bottomIn = new Node(
            new Vector(Model.TrackMax, Model.TileHeight / 2 - 2 * Model.LaneWidth)
        );
        
        const topOut = new Node(
            new Vector(Model.TrackMax, Model.TileHeight / 2 + 2 * Model.LaneWidth)
        );

        const leftMid = new Node(
            new Vector(Model.TrackMin, Model.TileHeight / 2)
        );
        const rightMid = new Node(
            new Vector(Model.TrackMax, Model.TileHeight / 2)
        );


        const nwLock = new Lock
        const neLock = new Lock
        const swLock = new Lock
        const seLock = new Lock
        
        connect(topMin, topIn);
        connect(topIn, leftMid, undefined, [nwLock, swLock]);
        connect(leftMid, bottomOut, undefined, [nwLock, swLock])
        connect(bottomOut, bottomMin);
        connect(bottomMax, bottomIn);
        connect(bottomIn, rightMid, undefined, [neLock, seLock]);
        connect(rightMid, topOut, undefined, [neLock, seLock]);
        connect(topOut, topMax);
        
        const rightMin = new Node(new Vector(Model.TileWidth, Model.TrackMin));
        const rightMax = new Node(new Vector(Model.TileWidth, Model.TrackMax));
        const leftMin = new Node(new Vector(0, Model.TrackMin));
        const leftMax = new Node(new Vector(0, Model.TrackMax));
        
        const leftIn = new Node(
            new Vector(Model.TileWidth / 2 - 2 * Model.LaneWidth, Model.TrackMin)
        );
        const rightOut = new Node(
            new Vector(Model.TileWidth / 2 + 2 * Model.LaneWidth, Model.TrackMin)
        );
        const rightIn = new Node(
            new Vector(Model.TileWidth / 2 + 2 * Model.LaneWidth, Model.TrackMax)
        );
        const leftOut = new Node(
            new Vector(Model.TileWidth / 2 - 2 * Model.LaneWidth, Model.TrackMax)
        );
        const topMid = new Node(
            new Vector(Model.TileWidth / 2, Model.TrackMax)
        );
        const bottomMid = new Node(
            new Vector(Model.TileWidth / 2, Model.TrackMin)
        );
        
        connect(rightMax, rightIn);
        connect(rightIn, topMid, undefined, [nwLock, neLock]);
        connect(topMid, leftOut, undefined, [nwLock, neLock]);
        connect(leftOut, leftMax);
        connect(leftMin, leftIn);
        connect(leftIn, bottomMid, undefined, [swLock, seLock]),
        connect(bottomMid, rightOut, undefined, [swLock, seLock]);
        connect(rightOut, rightMin);
        
        // Turn rights
        // TODO
        connect(bottomIn, rightOut, EdgeShapes.RightTurn, [seLock]);
        connect(rightIn, topOut, EdgeShapes.RightTurn, [neLock]);
        connect(topIn, leftOut, EdgeShapes.RightTurn, [nwLock]);
        connect(leftIn, bottomOut, EdgeShapes.RightTurn, [swLock]);
        
        
        return new Tile(
            pos,
            [bottomMax, leftMin, topMin, rightMax],
            [topMax, rightMin, bottomMin, leftMax],
            [topIn, bottomIn, leftIn, rightIn, topOut, bottomOut, leftOut, rightOut, topMid, bottomMid, rightMid, leftMid]
        );
    } else {
        return new Tile(pos, [null, null, null, null], [null, null, null, null]);
    }
}

function empty(): Model.ITile {
    return {
        coord: { x: 0, y: 0 },
        type: Model.TileType.Empty
    };
}
function horizontal(): Model.ITile {
    return {
        coord: { x: 0, y: 0 },
        type: Model.TileType.Street,
        orientation: Model.TileOrientation.NorthSouth
    };
}

function vertical(): Model.ITile {
    return {
        coord: { x: 0, y: 0 },
        type: Model.TileType.Street,
        orientation: Model.TileOrientation.WestEast
    };
}

function cross(): Model.ITile {
    return {
        coord: { x: 0, y: 0 },
        type: Model.TileType.Crossing
    };
}

export class BackendWorld implements Model.IWorld {
    tiles: Model.ITile[][] = [
        [empty(), vertical(), empty()],
        [horizontal(), cross(), horizontal()],
        [empty(), vertical(), empty()]
    ];
    
    private genNodes: Node[] = [];
    
    private pieces: Tile[][] = [];
    private autos: Car[] = [];
    
    private round: number = 1;
    
    constructor() {
        for (let x = 0; x < this.tiles.length; ++x) {
            this.pieces.push([]);
            for (let y = 0; y < this.tiles[0].length; ++y) {
                this.tiles[x][y].coord = { x, y };
                this.pieces[x].push(setupTileNodes(this.tiles[x][y], new Vector(x, y)));
            }
        }
        
        const dirs = [
            new Vector(0, -1),
            new Vector(-1, 0),
            new Vector(0, 1),
            new Vector(1, 0)
        ];
        
        // merge nodes
        for (let x = 0; x < this.pieces.length; ++x) {
            for (let y = 0; y < this.pieces[0].length; ++y) {
                const pos = new Vector(x, y);
                for (const diri of [0, 1, 2, 3]) {
                    const dir = dirs[diri];
                    const to = pos.add(dir);
                    const t1 = this.pieces[x][y];
                    if (
                        to.x >= 0 &&
                        to.y >= 0 &&
                        to.x < this.pieces.length &&
                        to.y < this.pieces[0].length
                    ) {
                        const t2 = this.pieces[to.x][to.y];
                        const n1 = t1.inNodes[diri];
                        const n2 = t2.outNodes[diri];
                        
                        if ((n1 == null) != (n2 == null)) {
                            throw new Error("!!!!");
                        } else if (n1 != null && n2 != null) {
                            const n = mergeNodes(n1, n2);
                            t1.inNodes[diri] = n;
                            t2.outNodes[diri] = n;
                        }
                    } else {
                        if (to.y < 0) {
                            const n = t1.inNodes[0];
                            if (n) {
                                this.genNodes.push(n);
                            }
                        }
                        
                        if (to.x < 0) {
                            const n = t1.inNodes[1];
                            if (n) {
                                this.genNodes.push(n);
                            }
                        }
                        
                        if (to.y >= this.pieces[0].length) {
                            const n = t1.inNodes[2];
                            if (n) {
                                this.genNodes.push(n);
                            }
                        }
                        
                        if (to.x >= this.pieces.length) {
                            const n = t1.inNodes[3];
                            if (n) {
                                this.genNodes.push(n);
                            }
                        }
                        
                        if (to.y >= this.pieces[0].length) {
                            const n = t1.inNodes[2];
                            if (n) {
                                this.genNodes.push(n);
                            }
                        }
                        
                        if (to.x >= this.pieces.length) {
                            const n = t1.inNodes[3];
                            if (n) {
                                this.genNodes.push(n);
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
            const e = n.outs[0];
            const car = e.cars[e.cars.length - 1];
            let canCreate = true;
            if (car) {
                canCreate = false;
                if (car.alpha * e.length > Model.CarLength) {
                    canCreate = true;
                }
            }
            if (canCreate && Math.random() < 0.01) {
                // new car
                const c = new Car(e, 0, 0, 0);
                e.cars.push(c);
                this.autos.push(c);
            }
            false;
        }
    }
    
    updateCars() {
        // update cars
        let kill = false;
        for (const car of this.autos) {
            car.speed += car.acceleration / Model.StepsPerSecond;
            car.speed = Math.max(car.speed, 0)
            let meters = car.speed / Model.StepsPerSecond;
            while (meters > 0) {
                const alphaDiff = meters / car.edge.length;
                car.alpha += alphaDiff;
                
                if (car.alpha > 1) {
                    meters = (car.alpha - 1) * car.edge.length;
                    car.alpha = 0;
                    const index = car.edge.cars.indexOf(car);
                    if (index < 0) {
                        throw new Error("car wasn't on this edge's list");
                    }
                    car.edge.cars.splice(index, 1);
                    const outs = car.edge.to.outs;
                    
                    if ((outs.length == 0 || outs[car.roadToTake(0, outs.length)].locks.every(lock => lock.holder != car))
                        && car.edge.locks.find(lock => lock.holder == car)) {
                        car.edge.locks.filter(lock => lock.holder == car).forEach(lock => lock.holder = null)
                    }

                    if (outs.length == 0) {
                        meters = 0;
                        car.alive = false;
                        kill = true;
                    } else {
                        car.edge = outs[car.gotoNextRoad(outs.length)];
                        car.edge.cars.push(car);
                    }
                } else {
                    meters = 0;
                }
            }
        }
        
        if (kill) {
            this.autos = this.autos.filter(car => car.alive);
        }
    }
    
    controllCars() {
        this.round++;
        const processEdge = (edge: Edge) => {
            if (edge.checkRound(this.round)) {
                const { to } = edge;
                
                // process dependent edges
                for (const next of to.outs) {
                    processEdge(next);
                }
                
                // process all cars that are on this edge
                edge.cars.forEach((car, i) => {
                    const nextEdge = edge.to.outs[car.roadToTake(0, edge.to.outs.length)];
                    const sameEdge = i > 0;
                    car.acceleration = Model.MaxAcceleration / 2;
                    if (sameEdge || nextEdge) {
                        const nextCar: Car | undefined = sameEdge
                        ? edge.cars[i - 1]
                        : nextEdge.cars[nextEdge.cars.length - 1];
                        
                        if (nextCar) {
                            const alphaDiff = sameEdge
                                ? car.alpha - nextCar.alpha
                                : car.alpha - 1 - nextEdge.length / edge.length * nextCar.alpha;
                            car.acceleration = 1 / Model.StepsPerSecond * (-700 * alphaDiff - 100 * (car.speed - nextCar.speed));
                        }
                    }
                    
                    if (car.speed + car.acceleration / Model.StepsPerSecond > Model.MaxSpeed) {
                        car.acceleration = 0;
                        car.speed = Model.MaxSpeed;
                    }

                    if (edge.locks.find(lock => lock.holder != car && lock.holder != null)) {
                        car.acceleration = -Model.MaxAcceleration
                    }

                    if (nextEdge) {
                        const canLock = nextEdge.locks.every((value) => value.holder == null || value.holder == car)
                        if (canLock) {
                            nextEdge.locks.forEach((value) => value.holder = car)
                        }
                    }
                });
            }
        };
        
        for (const n of this.genNodes) {
            for (const e of n.outs) {
                processEdge(e);
            }
        }
    }
    
    update() {
        this.insertCars();
        this.controllCars();
        this.updateCars();
    }
    
    get cars(): Model.ICar[] {
        return this.autos.map(car => {
            const { from, to } = car.edge;
            return {
                pos: car.edge.getPosition(car.alpha),
                angle: car.edge.getAngle(car.alpha),
                id: car.id
            };
        });
    }
}
