webpackJsonp([1],{

/***/ 109:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(13);
const ReactDOM = __webpack_require__(113);
const app_1 = __webpack_require__(122);
__webpack_require__(105);
__webpack_require__(231);
__webpack_require__(232);
__webpack_require__(240);
const app = React.createElement(app_1.App, null);
var target = document.createElement("div");
ReactDOM.render(app, target);
document.body.appendChild(target);


/***/ }),

/***/ 122:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(13);
const gameview_1 = __webpack_require__(29);
const resources_1 = __webpack_require__(222);
class App extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            gameView: React.createElement(gameview_1.GameView, { firstState: new resources_1.ResourceLoaderState() })
        };
    }
    render() {
        return this.state.gameView;
    }
}
exports.App = App;


/***/ }),

/***/ 21:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Model;
(function (Model) {
    Model.StepsPerSecond = 30;
    Model.TargetSpeed = 10;
    Model.MaxSpeed = 30;
    Model.MaxAcceleration = 100;
    // in meter
    Model.TileWidth = 30;
    Model.TileHeight = 30;
    Model.TrackMin = 13;
    Model.TrackMax = 17;
    Model.CarWidth = 1.8;
    Model.CarLength = 4.5;
    Model.LaneWidth = 3;
    let TileType;
    (function (TileType) {
        TileType[TileType["Empty"] = 0] = "Empty";
        TileType[TileType["Crossing"] = 1] = "Crossing";
        TileType[TileType["Street"] = 2] = "Street";
    })(TileType = Model.TileType || (Model.TileType = {}));
    let TileOrientation;
    (function (TileOrientation) {
        TileOrientation[TileOrientation["NorthSouth"] = 0] = "NorthSouth";
        TileOrientation[TileOrientation["WestEast"] = 1] = "WestEast";
        TileOrientation[TileOrientation["SouthEast"] = 2] = "SouthEast";
        TileOrientation[TileOrientation["NorthEast"] = 3] = "NorthEast";
        TileOrientation[TileOrientation["NorthWest"] = 4] = "NorthWest";
        TileOrientation[TileOrientation["SouthWest"] = 5] = "SouthWest";
    })(TileOrientation = Model.TileOrientation || (Model.TileOrientation = {}));
})(Model = exports.Model || (exports.Model = {}));


/***/ }),

/***/ 222:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const loadstate_1 = __webpack_require__(223);
const gamestate_1 = __webpack_require__(224);
class ResourceLoaderState extends loadstate_1.LoadState {
    constructor() {
        super();
    }
    load(loader) {
        loader.add("atlas", "assets/tiles.json");
    }
    loaded(loader, res) {
        let tiles = res.atlas.textures;
        let tex = (name) => tiles[name];
        let resources = {
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
        return new gamestate_1.GameState(resources);
    }
}
exports.ResourceLoaderState = ResourceLoaderState;


/***/ }),

/***/ 223:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const gameview_1 = __webpack_require__(29);
const PIXI = __webpack_require__(9);
class LoadState extends gameview_1.State {
    constructor() {
        super();
        this.stage = new PIXI.Container();
        this.text = new PIXI.Text("Loading...", { fill: "#ffffff" });
        this.stage.addChild(this.text);
    }
    enter(prev, renderer) {
        this.text.anchor.x = 0.5;
        this.text.anchor.y = 0.5;
        this.text.x = renderer.width / 2;
        this.text.y = renderer.height / 2;
        let loader = new PIXI.loaders.Loader();
        this.load(loader);
        loader.once("complete", this.onLoaded.bind(this));
        loader.load();
    }
    onLoaded(loader, resources) {
        this.nextState = this.loaded(loader, resources);
    }
    leave(next) {
    }
    update(dt) {
        return this.nextState;
    }
    render(dt) {
        return this.stage;
    }
}
exports.LoadState = LoadState;


/***/ }),

/***/ 224:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const PIXI = __webpack_require__(9);
const gameview_1 = __webpack_require__(29);
const world_1 = __webpack_require__(225);
const keyboard_1 = __webpack_require__(227);
const modeldef_1 = __webpack_require__(21);
const cars_1 = __webpack_require__(228);
const realmodel_1 = __webpack_require__(230);
const ScreenDimensionX = 100;
const ScreenDimensionY = 100;
const PlayerSpeed = 1;
class Controls {
    constructor() {
        this.up = new keyboard_1.Key(keyboard_1.Keys.Up);
        this.down = new keyboard_1.Key(keyboard_1.Keys.Down);
        this.left = new keyboard_1.Key(keyboard_1.Keys.Left);
        this.right = new keyboard_1.Key(keyboard_1.Keys.Right);
    }
    horizontalMovement() {
        let hm = 0;
        if (this.up.isDown()) {
            hm -= 1;
        }
        if (this.down.isDown()) {
            hm += 1;
        }
        return hm;
    }
    verticalMovement() {
        let vm = 0;
        if (this.left.isDown()) {
            vm -= 1;
        }
        if (this.right.isDown()) {
            vm += 1;
        }
        return vm;
    }
}
class GameState extends gameview_1.State {
    constructor(resources) {
        super();
        this.resources = resources;
        this.model = new realmodel_1.BackendWorld();
        this.entities = [];
        this.stage = new PIXI.Container();
        this.view = new PIXI.Container();
        this.ctrl = new Controls();
        this.gameTime = 0;
        this.screenx = 1.5;
        this.screeny = 1.5;
        this.cars = new cars_1.Cars(resources);
        this.worldGenerator = new world_1.WorldGenerator(resources);
    }
    enter(prev, renderer) {
        this.world = this.worldGenerator.buildWorld(this.model.tiles);
        this.view.addChild(this.world);
        this.view.addChild(this.cars);
        this.stage.addChild(this.view);
    }
    leave(next) {
        this.view.removeChild(this.world);
    }
    addEntity(entity) {
        this.entities.push(entity);
        this.view.addChild(entity);
        return entity;
    }
    update(dt) {
        this.world.update(dt);
        this.gameTime += dt;
        const timePerStep = 1 / modeldef_1.Model.StepsPerSecond;
        while (this.gameTime >= timePerStep) {
            this.gameTime -= timePerStep;
            this.model.update();
            this.cars.updateCars(this.model.cars);
        }
        this.entities.forEach(entity => entity.update(dt));
        // update player
        this.screenx += this.ctrl.verticalMovement() * PlayerSpeed * dt;
        this.screeny += this.ctrl.horizontalMovement() * PlayerSpeed * dt;
        // update view
        this.view.x = -this.screenx;
        this.view.y = -this.screeny;
        this.world.setView(this.screenx, this.screeny, ScreenDimensionX, ScreenDimensionY);
        return null;
    }
    render(dt) {
        return this.stage;
    }
    resized(renderer) {
        this.screenWidth = renderer.width;
        this.screenHeight = renderer.height;
        this.stage.x = this.screenWidth / 2;
        this.stage.y = this.screenHeight / 2;
        let ratio = Math.min(renderer.width / ScreenDimensionX, renderer.height / ScreenDimensionY);
        let scale = this.stage.scale;
        //scale.x = scale.y = ratio;
        scale.x = scale.y = ScreenDimensionX * 4;
    }
}
exports.GameState = GameState;


/***/ }),

/***/ 225:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const PIXI = __webpack_require__(9);
const tiledef_1 = __webpack_require__(226);
const modeldef_1 = __webpack_require__(21);
class World extends PIXI.Container {
    constructor(width, height, tiles) {
        super();
        this.width = width;
        this.height = height;
        this.tiles = tiles;
        for (let x = 0; x < width; ++x) {
            for (let y = 0; y < height; ++y) {
                this.addChild(this.at(x, y));
            }
        }
    }
    setView(x, y, width, height) { }
    at(x, y) {
        return this.tiles[x][y];
    }
    update(dt) { }
}
exports.World = World;
class Interval {
    constructor(begin, end) {
        this._min = Math.min(begin, end);
        this._max = Math.max(begin, end);
    }
    min() {
        return this._min;
    }
    max() {
        return this._max;
    }
    size() {
        return this.max() - this.min() + 1; // max is inclusive!
    }
    intersects(other) {
        return (Math.min(this.max(), other.max()) >= Math.max(this.min(), other.min()));
    }
    intersect(other) {
        if (!this.intersects(other)) {
            throw "Intervals do not intersect!";
        }
        return new Interval(Math.max(this.min(), other.min()), Math.min(this.max(), other.max()));
    }
    hull(other) {
        return new Interval(Math.min(this.min(), other.min()), Math.max(this.max(), other.max()));
    }
    rand() {
        return this.min() + Math.floor(this.size() * Math.random());
    }
}
class WorldGenerator {
    constructor(resources) {
        this.resources = resources;
    }
    buildWorld(map) {
        return new World(map.length, map[0].length, map.map((row, x) => row
            .map(tile => {
            switch (tile.type) {
                case modeldef_1.Model.TileType.Crossing:
                    return new tiledef_1.CrossingTile(this.resources);
                case modeldef_1.Model.TileType.Street:
                    return new tiledef_1.StreetTile(tile.orientation, this.resources);
                default:
                    return new tiledef_1.EmptyTile();
            }
        })
            .map((tile, y) => {
            tile.x = x;
            tile.y = y;
            return tile;
        })));
    }
}
exports.WorldGenerator = WorldGenerator;


/***/ }),

/***/ 226:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const PIXI = __webpack_require__(9);
const modeldef_1 = __webpack_require__(21);
class Tile extends PIXI.Container {
    update(dt) { }
}
exports.Tile = Tile;
class ImageTile extends Tile {
    constructor(res) {
        super();
        this.res = res;
        this.createTex();
    }
    createTex() {
        this.addChild(this.getTileImg(this.res));
    }
    makeSprite(tex) {
        let sprite = new PIXI.Sprite(tex);
        sprite.scale.x = 1 / sprite.width;
        sprite.scale.y = 1 / sprite.height;
        return sprite;
    }
}
exports.ImageTile = ImageTile;
class EmptyTile extends Tile {
}
exports.EmptyTile = EmptyTile;
class CrossingTile extends ImageTile {
    getTileImg(res) {
        return this.makeSprite(res.tiles.crossing);
    }
}
exports.CrossingTile = CrossingTile;
class StreetTile extends ImageTile {
    constructor(orientation, res) {
        super(res);
        this.orientation = orientation;
        super.createTex();
    }
    createTex() { }
    getTileImg(res) {
        let tileOrientation = "";
        switch (this.orientation) {
            case modeldef_1.Model.TileOrientation.NorthSouth:
                tileOrientation = "ns";
                break;
            case modeldef_1.Model.TileOrientation.WestEast:
                tileOrientation = "we";
                break;
            case modeldef_1.Model.TileOrientation.SouthEast:
                tileOrientation = "se";
                break;
            case modeldef_1.Model.TileOrientation.NorthEast:
                tileOrientation = "ne";
                break;
            case modeldef_1.Model.TileOrientation.NorthWest:
                tileOrientation = "nw";
                break;
            case modeldef_1.Model.TileOrientation.SouthWest:
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
exports.StreetTile = StreetTile;


/***/ }),

/***/ 227:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Key {
    constructor(keycode) {
        this.keycode = keycode;
        this._isPressed = false;
        window.addEventListener("keydown", this.handleDown.bind(this));
        window.addEventListener("keyup", this.handleUp.bind(this));
    }
    isDown() {
        return this._isPressed;
    }
    isUp() {
        return !this._isPressed;
    }
    handleDown(event) {
        if (event.keyCode == this.keycode) {
            if (this.isUp() && this.press) {
                this.press();
            }
            this._isPressed = true;
            event.preventDefault();
        }
    }
    handleUp(event) {
        if (event.keyCode == this.keycode) {
            if (this.isDown() && this.release) {
                this.release();
            }
            this._isPressed = false;
            event.preventDefault();
        }
    }
}
exports.Key = Key;
var Keys;
(function (Keys) {
    Keys[Keys["A"] = 65] = "A";
    Keys[Keys["B"] = 66] = "B";
    Keys[Keys["C"] = 67] = "C";
    Keys[Keys["D"] = 68] = "D";
    Keys[Keys["E"] = 69] = "E";
    Keys[Keys["F"] = 70] = "F";
    Keys[Keys["H"] = 71] = "H";
    Keys[Keys["I"] = 72] = "I";
    Keys[Keys["J"] = 73] = "J";
    Keys[Keys["K"] = 74] = "K";
    Keys[Keys["L"] = 75] = "L";
    Keys[Keys["M"] = 76] = "M";
    Keys[Keys["N"] = 77] = "N";
    Keys[Keys["O"] = 78] = "O";
    Keys[Keys["P"] = 79] = "P";
    Keys[Keys["Q"] = 80] = "Q";
    Keys[Keys["R"] = 81] = "R";
    Keys[Keys["S"] = 82] = "S";
    Keys[Keys["T"] = 83] = "T";
    Keys[Keys["U"] = 84] = "U";
    Keys[Keys["V"] = 85] = "V";
    Keys[Keys["W"] = 86] = "W";
    Keys[Keys["X"] = 87] = "X";
    Keys[Keys["Y"] = 88] = "Y";
    Keys[Keys["Z"] = 89] = "Z";
    Keys[Keys["_0"] = 48] = "_0";
    Keys[Keys["_1"] = 49] = "_1";
    Keys[Keys["_2"] = 50] = "_2";
    Keys[Keys["_3"] = 51] = "_3";
    Keys[Keys["_4"] = 52] = "_4";
    Keys[Keys["_5"] = 53] = "_5";
    Keys[Keys["_6"] = 54] = "_6";
    Keys[Keys["_7"] = 55] = "_7";
    Keys[Keys["_8"] = 56] = "_8";
    Keys[Keys["_9"] = 57] = "_9";
    Keys[Keys["Backspace"] = 8] = "Backspace";
    Keys[Keys["Tab"] = 9] = "Tab";
    Keys[Keys["Enter"] = 13] = "Enter";
    Keys[Keys["Shift"] = 16] = "Shift";
    Keys[Keys["Ctrl"] = 17] = "Ctrl";
    Keys[Keys["CapsLock"] = 20] = "CapsLock";
    Keys[Keys["Esc"] = 27] = "Esc";
    Keys[Keys["Space"] = 32] = "Space";
    Keys[Keys["PageUp"] = 33] = "PageUp";
    Keys[Keys["PageDown"] = 34] = "PageDown";
    Keys[Keys["End"] = 35] = "End";
    Keys[Keys["Home"] = 36] = "Home";
    Keys[Keys["Left"] = 37] = "Left";
    Keys[Keys["Up"] = 38] = "Up";
    Keys[Keys["Right"] = 39] = "Right";
    Keys[Keys["Down"] = 40] = "Down";
    Keys[Keys["Insert"] = 45] = "Insert";
    Keys[Keys["Delete"] = 46] = "Delete";
})(Keys = exports.Keys || (exports.Keys = {}));


/***/ }),

/***/ 228:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const PIXI = __webpack_require__(9);
const entity_1 = __webpack_require__(229);
const modeldef_1 = __webpack_require__(21);
class Cars extends entity_1.Entity {
    constructor(res) {
        super();
        this.graphics = new Map();
        this.res = res;
    }
    update(dt) { }
    updateCars(cars) {
        const newCarIds = new Set();
        for (const car of cars) {
            newCarIds.add(car.id);
            const graphic = this.graphics.get(car.id);
            if (graphic === undefined) {
                this.addCar(car);
            }
            else {
                this.updateCarSprite(graphic, car);
            }
        }
        // Garbage collect vanished cars
        for (const carId of this.graphics.keys()) {
            if (!newCarIds.has(carId)) {
                this.removeCar(carId);
            }
        }
    }
    generateCarSprite() {
        const carTileIdx = Math.floor(Math.random() * this.res.tiles.car.length);
        const sprite = new PIXI.Sprite(this.res.tiles.car[carTileIdx]);
        sprite.scale.x = 1 / this.res.tiles.crossing.width;
        sprite.scale.y = 1 / this.res.tiles.crossing.height;
        return sprite;
    }
    addCar(car) {
        const carSprite = this.generateCarSprite();
        // center the sprite's anchor point
        carSprite.anchor.set(0.5);
        this.addChild(carSprite);
        this.graphics.set(car.id, carSprite);
        this.updateCarSprite(carSprite, car);
    }
    updateCarSprite(carSprite, car) {
        // move the sprite to the center of the screen
        carSprite.x = car.pos.x / modeldef_1.Model.TileWidth;
        carSprite.y = car.pos.y / modeldef_1.Model.TileHeight;
        carSprite.rotation = Math.PI + car.angle;
        carSprite.alpha = car.hasLock ? 1.0 : 0.5;
    }
    removeCar(carId) {
        const sprite = this.graphics.get(carId);
        if (sprite === undefined)
            return;
        this.removeChild(sprite);
        this.graphics.delete(carId);
    }
}
exports.Cars = Cars;


/***/ }),

/***/ 229:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const PIXI = __webpack_require__(9);
class Entity extends PIXI.Container {
}
exports.Entity = Entity;


/***/ }),

/***/ 230:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const modeldef_1 = __webpack_require__(21);
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }
    negative() {
        return new Vector(-this.x, -this.y);
    }
    minus(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }
    mul(s) {
        return new Vector(s * this.x, s * this.y);
    }
    rotate(angle) {
        return new Vector(this.x * Math.cos(angle) - this.y * Math.sin(angle), this.x * Math.sin(angle) + this.y * Math.cos(angle));
    }
    get angle() {
        return Math.atan2(this.y, this.x);
    }
    get length() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
}
var nextId = 1;
class Car {
    constructor(edge, alpha = 0, speed = 0, acceleration = 0) {
        this.edge = edge;
        this.alpha = alpha;
        this.speed = speed;
        this.acceleration = acceleration;
        this.randomList = [];
        this.curRand = 0;
        this.id = nextId++;
        this.alive = true;
        this.heldLocks = 0;
        for (let i = 0; i < 10; ++i) {
            this.randomList.push(Math.random());
        }
    }
    get random() {
        return this.randomList[this.curRand % 10];
    }
    roadToTake(futureIdx, possibleRoads) {
        return Math.floor(this.randomList[(this.curRand + futureIdx) % 10] * possibleRoads);
    }
    gotoNextRoad(possibleRoads) {
        const road = this.roadToTake(0, possibleRoads);
        ++this.curRand;
        return road;
    }
}
class Node {
    constructor(pos) {
        this.pos = pos;
        this.outs = [];
        this.ins = [];
    }
}
var EdgeShapes;
(function (EdgeShapes) {
    EdgeShapes.Straight = {
        fn: t => new Vector(t, 0),
        length: 1
    };
    EdgeShapes.Sinus = {
        fn: t => new Vector(t, 0.03 * Math.sin(2 * Math.PI * t)),
        length: 1
    };
    EdgeShapes.CrossingInnerTurnRight = {
        fn: t => {
            const totalLength = modeldef_1.Model.CarLength + Math.PI * modeldef_1.Model.LaneWidth / 2;
            const baseLength = (modeldef_1.Model.CarLength + modeldef_1.Model.LaneWidth) / Math.SQRT2;
            const tChange = modeldef_1.Model.CarLength / (2 * totalLength);
            if (t <= tChange) {
                return new Vector(t, t).mul(totalLength / (2 * Math.SQRT2 * baseLength));
            }
            else if (t >= 1 - tChange) {
                return new Vector(1, 0).minus(new Vector(t, t).mul(totalLength / (2 * Math.SQRT2 * baseLength)));
            }
            else {
                const tCircle = (t - tChange) / (1 - 2 * tChange);
                return new Vector(1, 1)
                    .mul(modeldef_1.Model.CarLength / (4 * Math.SQRT2 * baseLength))
                    .add(new Vector(0.5 - Math.cos((2 * tCircle + 1) * Math.PI / 4) / Math.SQRT2, -0.5 + Math.sin((2 * tCircle + 1) * Math.PI / 4) / Math.SQRT2).mul(modeldef_1.Model.LaneWidth / Math.SQRT2));
            }
        },
        length: 1
    };
    EdgeShapes.RightTurn = {
        fn: t => new Vector(0.5 - Math.cos((2 * t + 1) * Math.PI / 4) / Math.SQRT2, -0.5 + Math.sin((2 * t + 1) * Math.PI / 4) / Math.SQRT2),
        length: Math.PI / (2 * Math.SQRT2)
    };
})(EdgeShapes || (EdgeShapes = {}));
class Lock {
    constructor() {
        this.holder = null;
    }
}
class Edge {
    constructor(from, to, shape, locks) {
        this.from = from;
        this.to = to;
        this.shape = shape;
        this.locks = locks;
        this.cars = [];
        this.done = false;
        this.curRound = 0;
        this.length = this.to.pos.minus(this.from.pos).length * this.shape.length;
    }
    getPosition(t) {
        const diffVector = this.to.pos.minus(this.from.pos);
        const amplitudeFactor = diffVector.length;
        const angleShift = diffVector.angle;
        return this.shape
            .fn(t)
            .mul(amplitudeFactor)
            .rotate(angleShift)
            .add(this.from.pos);
    }
    getAngle(t) {
        const diffquot = this.getPosition(t + 0.01).minus(this.getPosition(t - 0.01));
        return diffquot.angle;
    }
    checkRound(round) {
        if (round != this.curRound) {
            this.curRound = round;
            //this.reserved = [];
            return true;
        }
        else {
            return false;
        }
    }
}
class Tile {
    constructor(coords, inNodes, outNodes, addNodes = []) {
        this.coords = coords;
        this.inNodes = inNodes;
        this.outNodes = outNodes;
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
    get pos() {
        return this.coords.mul(modeldef_1.Model.TileWidth);
    }
}
function connect(from, to, shape = EdgeShapes.Straight, lock) {
    const e = new Edge(from, to, shape, lock || []);
    from.outs.push(e);
    to.ins.push(e);
    return e;
}
function mergeNodes(n1, n2) {
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
function setupTileNodes(tmpl, pos) {
    if (tmpl.type === modeldef_1.Model.TileType.Street) {
        const o = tmpl.orientation;
        if (o === modeldef_1.Model.TileOrientation.NorthSouth) {
            const topMin = new Node(new Vector(modeldef_1.Model.TrackMin, modeldef_1.Model.TileHeight));
            const topMax = new Node(new Vector(modeldef_1.Model.TrackMax, modeldef_1.Model.TileHeight));
            const bottomMin = new Node(new Vector(modeldef_1.Model.TrackMin, 0));
            const bottomMax = new Node(new Vector(modeldef_1.Model.TrackMax, 0));
            connect(topMin, bottomMin);
            connect(bottomMax, topMax);
            return new Tile(pos, [bottomMax, null, topMin, null], [topMax, null, bottomMin, null]);
        }
        else if (o === modeldef_1.Model.TileOrientation.WestEast) {
            const rightMin = new Node(new Vector(modeldef_1.Model.TileWidth, modeldef_1.Model.TrackMin));
            const rightMax = new Node(new Vector(modeldef_1.Model.TileWidth, modeldef_1.Model.TrackMax));
            const leftMin = new Node(new Vector(0, modeldef_1.Model.TrackMin));
            const leftMax = new Node(new Vector(0, modeldef_1.Model.TrackMax));
            connect(rightMax, leftMax);
            connect(leftMin, rightMin);
            return new Tile(pos, [null, leftMin, null, rightMax], [null, rightMin, null, leftMax]);
        }
        else {
            throw new Error("not implemented");
        }
    }
    else if (tmpl.type === modeldef_1.Model.TileType.Crossing) {
        // todo fix
        const topMin = new Node(new Vector(modeldef_1.Model.TrackMin, modeldef_1.Model.TileHeight));
        const topMax = new Node(new Vector(modeldef_1.Model.TrackMax, modeldef_1.Model.TileHeight));
        const bottomMin = new Node(new Vector(modeldef_1.Model.TrackMin, 0));
        const bottomMax = new Node(new Vector(modeldef_1.Model.TrackMax, 0));
        const topIn = new Node(new Vector(modeldef_1.Model.TrackMin, modeldef_1.Model.TileHeight / 2 + 2 * modeldef_1.Model.LaneWidth));
        const bottomOut = new Node(new Vector(modeldef_1.Model.TrackMin, modeldef_1.Model.TileHeight / 2 - 2 * modeldef_1.Model.LaneWidth));
        const bottomIn = new Node(new Vector(modeldef_1.Model.TrackMax, modeldef_1.Model.TileHeight / 2 - 2 * modeldef_1.Model.LaneWidth));
        const topOut = new Node(new Vector(modeldef_1.Model.TrackMax, modeldef_1.Model.TileHeight / 2 + 2 * modeldef_1.Model.LaneWidth));
        const leftMid = new Node(new Vector(modeldef_1.Model.TrackMin, modeldef_1.Model.TileHeight / 2));
        const rightMid = new Node(new Vector(modeldef_1.Model.TrackMax, modeldef_1.Model.TileHeight / 2));
        const nwLock = new Lock;
        const neLock = new Lock;
        const swLock = new Lock;
        const seLock = new Lock;
        connect(topMin, topIn);
        connect(topIn, leftMid, undefined, [nwLock, swLock]);
        connect(leftMid, bottomOut, undefined, [nwLock, swLock]);
        connect(bottomOut, bottomMin);
        connect(bottomMax, bottomIn);
        connect(bottomIn, rightMid, undefined, [neLock, seLock]);
        connect(rightMid, topOut, undefined, [neLock, seLock]);
        connect(topOut, topMax);
        const rightMin = new Node(new Vector(modeldef_1.Model.TileWidth, modeldef_1.Model.TrackMin));
        const rightMax = new Node(new Vector(modeldef_1.Model.TileWidth, modeldef_1.Model.TrackMax));
        const leftMin = new Node(new Vector(0, modeldef_1.Model.TrackMin));
        const leftMax = new Node(new Vector(0, modeldef_1.Model.TrackMax));
        const leftIn = new Node(new Vector(modeldef_1.Model.TileWidth / 2 - 2 * modeldef_1.Model.LaneWidth, modeldef_1.Model.TrackMin));
        const rightOut = new Node(new Vector(modeldef_1.Model.TileWidth / 2 + 2 * modeldef_1.Model.LaneWidth, modeldef_1.Model.TrackMin));
        const rightIn = new Node(new Vector(modeldef_1.Model.TileWidth / 2 + 2 * modeldef_1.Model.LaneWidth, modeldef_1.Model.TrackMax));
        const leftOut = new Node(new Vector(modeldef_1.Model.TileWidth / 2 - 2 * modeldef_1.Model.LaneWidth, modeldef_1.Model.TrackMax));
        const topMid = new Node(new Vector(modeldef_1.Model.TileWidth / 2, modeldef_1.Model.TrackMax));
        const bottomMid = new Node(new Vector(modeldef_1.Model.TileWidth / 2, modeldef_1.Model.TrackMin));
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
        return new Tile(pos, [bottomMax, leftMin, topMin, rightMax], [topMax, rightMin, bottomMin, leftMax], [topIn, bottomIn, leftIn, rightIn, topOut, bottomOut, leftOut, rightOut, topMid, bottomMid, rightMid, leftMid]);
    }
    else {
        return new Tile(pos, [null, null, null, null], [null, null, null, null]);
    }
}
function empty() {
    return {
        coord: { x: 0, y: 0 },
        type: modeldef_1.Model.TileType.Empty
    };
}
function horizontal() {
    return {
        coord: { x: 0, y: 0 },
        type: modeldef_1.Model.TileType.Street,
        orientation: modeldef_1.Model.TileOrientation.NorthSouth
    };
}
function vertical() {
    return {
        coord: { x: 0, y: 0 },
        type: modeldef_1.Model.TileType.Street,
        orientation: modeldef_1.Model.TileOrientation.WestEast
    };
}
function cross() {
    return {
        coord: { x: 0, y: 0 },
        type: modeldef_1.Model.TileType.Crossing
    };
}
class BackendWorld {
    constructor() {
        this.tiles = [
            [empty(), vertical(), vertical(), vertical(), empty()],
            [horizontal(), cross(), cross(), cross(), horizontal()],
            [horizontal(), cross(), cross(), cross(), horizontal()],
            [horizontal(), cross(), cross(), cross(), horizontal()],
            [empty(), vertical(), vertical(), vertical(), empty()]
        ];
        this.genNodes = [];
        this.pieces = [];
        this.autos = [];
        this.round = 1;
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
                    if (to.x >= 0 &&
                        to.y >= 0 &&
                        to.x < this.pieces.length &&
                        to.y < this.pieces[0].length) {
                        const t2 = this.pieces[to.x][to.y];
                        const n1 = t1.inNodes[diri];
                        const n2 = t2.outNodes[diri];
                        if ((n1 == null) != (n2 == null)) {
                            throw new Error("!!!!");
                        }
                        else if (n1 != null && n2 != null) {
                            const n = mergeNodes(n1, n2);
                            t1.inNodes[diri] = n;
                            t2.outNodes[diri] = n;
                        }
                    }
                    else {
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
                if (car.alpha * e.length > modeldef_1.Model.CarLength) {
                    canCreate = true;
                }
            }
            if (canCreate && this.autos.length < 40 && Math.random() < 0.21) {
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
            car.speed += car.acceleration / modeldef_1.Model.StepsPerSecond;
            car.speed = Math.max(car.speed, 0);
            let meters = car.speed / modeldef_1.Model.StepsPerSecond;
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
                        car.edge.locks.filter(lock => lock.holder == car).forEach(lock => {
                            lock.holder = null;
                            --car.heldLocks;
                        });
                    }
                    if (outs.length == 0) {
                        meters = 0;
                        car.alive = false;
                        kill = true;
                    }
                    else {
                        car.edge = outs[car.gotoNextRoad(outs.length)];
                        car.edge.cars.push(car);
                    }
                }
                else {
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
        const processEdge = (edge) => {
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
                    car.acceleration = modeldef_1.Model.MaxAcceleration / 2;
                    const canLock = edge.locks.every((value) => value.holder == null || value.holder == car);
                    if (canLock && i == 0) {
                        edge.locks.forEach((value) => {
                            if (value.holder == null)
                                car.heldLocks++;
                            value.holder = car;
                        });
                    }
                    if (nextEdge) {
                        const canLock = nextEdge.locks.every((value) => value.holder == null || value.holder == car);
                        if (canLock && i == 0) {
                            nextEdge.locks.forEach((value) => {
                                if (value.holder == null)
                                    car.heldLocks++;
                                value.holder = car;
                            });
                        }
                        if (nextEdge.locks.find(lock => lock.holder != car && lock.holder != null)) {
                            car.acceleration = -modeldef_1.Model.MaxAcceleration * 2;
                        }
                    }
                    if (sameEdge || nextEdge) {
                        const nextCar = sameEdge
                            ? edge.cars[i - 1]
                            : nextEdge.cars[nextEdge.cars.length - 1];
                        const driveToTileEnd = i == 0 && nextEdge && nextEdge.cars.length == 0 && nextEdge.locks.find(lock => lock.holder != car && lock.holder != null);
                        if (driveToTileEnd) {
                            const alphaDiff = car.alpha - 0.8 - nextEdge.length / edge.length + (modeldef_1.Model.CarLength + 1) / edge.length;
                            car.acceleration = 1 / modeldef_1.Model.StepsPerSecond * (-700 * alphaDiff - 100 * (car.speed));
                        }
                        if (nextCar && nextCar.acceleration > -modeldef_1.Model.MaxAcceleration * 2 + 1) {
                            const driveTo = (driveToTileEnd ? 1 : nextCar.alpha);
                            const alphaDiff = sameEdge
                                ? car.alpha - driveTo + (modeldef_1.Model.CarLength + 1) / edge.length
                                : car.alpha - 1 - nextEdge.length / edge.length * driveTo + (modeldef_1.Model.CarLength + 1) / edge.length;
                            car.acceleration = 1 / modeldef_1.Model.StepsPerSecond * (-700 * alphaDiff - 100 * (car.speed - nextCar.speed));
                        }
                    }
                    if (car.speed + car.acceleration / modeldef_1.Model.StepsPerSecond > modeldef_1.Model.MaxSpeed) {
                        car.acceleration = 0;
                        car.speed = modeldef_1.Model.MaxSpeed;
                    }
                    if (edge.locks.find(lock => lock.holder != car && lock.holder != null)) {
                        car.acceleration = -modeldef_1.Model.MaxAcceleration * 2;
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
    get cars() {
        return this.autos.map(car => {
            const { from, to } = car.edge;
            return {
                pos: car.edge.getPosition(car.alpha),
                angle: car.edge.getAngle(car.alpha),
                id: car.id,
                hasLock: car.heldLocks > 0
            };
        });
    }
}
exports.BackendWorld = BackendWorld;


/***/ }),

/***/ 240:
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(241);

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(108)(content, options);

if(content.locals) module.exports = content.locals;

if(false) {
	module.hot.accept("!!../../node_modules/css-loader/index.js!./style.css", function() {
		var newContent = require("!!../../node_modules/css-loader/index.js!./style.css");

		if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];

		var locals = (function(a, b) {
			var key, idx = 0;

			for(key in a) {
				if(!b || a[key] !== b[key]) return false;
				idx++;
			}

			for(key in b) idx--;

			return idx === 0;
		}(content.locals, newContent.locals));

		if(!locals) throw new Error('Aborting CSS HMR due to changed css-modules locals.');

		update(newContent);
	});

	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 241:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(106)(false);
// imports


// module
exports.push([module.i, "html,\nbody {\n  width: 100%;\n  height: 100%;\n\n  padding: 0;\n  margin: 0;\n\n  overflow: hidden;\n}\nbody {\n  background-color: black;\n}\n", ""]);

// exports


/***/ }),

/***/ 29:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(13);
const PIXI = __webpack_require__(9);
class State {
    enter(prev, renderer) { }
    leave(next) { }
    resized(renderer) { }
}
exports.State = State;
class GameView extends React.Component {
    constructor(props) {
        super(props);
    }
    run(state) {
        this.setGameState(state);
        this.lastUpdate = Date.now();
        this.onFrame();
    }
    setGameState(nextState) {
        let prevState = this.currentState;
        if (prevState) {
            prevState.leave(nextState);
        }
        this.currentState = nextState;
        if (nextState) {
            nextState.enter(prevState, this.renderer);
            nextState.resized(this.renderer);
        }
    }
    resized() {
        if (!this.gameCanvas) {
            return;
        }
        this.renderer.resize(window.innerWidth, // this.gameCanvas.clientWidth,
        window.innerHeight // this.gameCanvas.clientHeight //this.gameCanvas.clientWidth * 0.7
        );
        if (this.currentState) {
            this.currentState.resized(this.renderer);
        }
    }
    onFrame() {
        let now = Date.now();
        let dt = (now - this.lastUpdate) / 1000;
        this.lastUpdate = now;
        if (this.currentState) {
            // render
            let stage = this.currentState.render(dt);
            if (stage) {
                this.renderer.render(stage);
            }
            // update
            let nextState = this.currentState.update(dt);
            if (nextState) {
                this.setGameState(nextState);
            }
            // reqest next frame
            requestAnimationFrame(this.onFrame.bind(this));
        }
    }
    componentDidMount() {
        this.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {
            backgroundColor: 0x000000,
            antialias: true
        });
        this.gameCanvas.appendChild(this.renderer.view);
        this.resized();
        //this.renderer.resize(this.gameCanvas.clientWidth, this.gameCanvas.clientHeight);
        window.onresize = () => {
            this.resized();
        };
        console.log("componentDidMount");
        this.run(this.props.firstState);
        setTimeout(() => this.resized(), 200);
    }
    render() {
        return (React.createElement("div", { className: "game-canvas-container", ref: c => (this.gameCanvas = c) }));
    }
}
exports.GameView = GameView;


/***/ })

},[109]);
//# sourceMappingURL=main-4167da987a9bef1e2c22.js.map