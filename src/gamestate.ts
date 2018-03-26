import * as PIXI from "pixi.js";
import * as Sound from 'pixi-sound'
import { State } from "./gameview";
import { Resources } from "./resources";
import { World, WorldGenerator } from "./world";
import { Entity } from "./entity";
import { Key, Keys } from "./keyboard";
import { DummyModel } from "./model/dummymodel";
import { Tile } from "./tiledef";
import { Model } from "./modeldef";
import { Cars } from "./cars";
import { BackendWorld } from "./model/realmodel";

const ScreenDimensionX = 75;
const ScreenDimensionY = 75;
const PlayerSpeed = 1;

class Controls {
  up = new Key(Keys.Up);
  down = new Key(Keys.Down);
  left = new Key(Keys.Left);
  right = new Key(Keys.Right);

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

export class GameState extends State {
  private model = new BackendWorld();

  private worldGenerator: WorldGenerator;
  private world: World;
  private entities: Entity[] = [];
  private stage = new PIXI.Container();
  private view = new PIXI.Container();
  private screenWidth: number;
  private screenHeight: number;
  private ctrl = new Controls();
  private cars: Cars;

  private gameTime = 0;

  private screenx = 2.5;
  private screeny = 2.5;

  constructor(private resources: Resources) {
    super();
    this.cars = new Cars(resources);
    this.worldGenerator = new WorldGenerator(resources);
  }

  enter(prev: State, renderer: PIXI.SystemRenderer): void {
    Sound.Sound.from({
      autoPlay: true,
      url: "assets/waltz_short.mp3",
      loop: true
    })
    this.world = this.worldGenerator.buildWorld(this.model.tiles);

    this.view.addChild(this.world);
    this.view.addChild(this.cars);
    this.stage.addChild(this.view);
  }

  leave(next: State): void {
    this.view.removeChild(this.world);
  }

  addEntity<T extends Entity>(entity: T): T {
    this.entities.push(entity);
    this.view.addChild(entity);

    return entity;
  }

  update(dt: number): State | null {
    this.world.update(dt);

    this.gameTime += dt;

    const timePerStep = 1 / Model.StepsPerSecond;
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
    this.world.setView(
      this.screenx,
      this.screeny,
      ScreenDimensionX,
      ScreenDimensionY
    );

    return null;
  }

  render(dt: number): PIXI.Container | null {
    return this.stage;
  }

  resized(renderer: PIXI.SystemRenderer): void {
    this.screenWidth = renderer.width;
    this.screenHeight = renderer.height;
    this.stage.x = this.screenWidth / 2;
    this.stage.y = this.screenHeight / 2;
    let ratio = Math.min(
      renderer.width / ScreenDimensionX,
      renderer.height / ScreenDimensionY
    );
    let scale = this.stage.scale;
    //scale.x = scale.y = ratio;
    scale.x = scale.y = ScreenDimensionX * 4;
  }
}
