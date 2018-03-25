import * as PIXI from "pixi.js";
import { Entity } from "./entity";
import { Model } from "./modeldef";
import { Resources } from "./resources";

export class Cars extends Entity {
  private graphics: Map<number, PIXI.Sprite> = new Map();
  private res: Resources;

  constructor(res: Resources) {
    super();
    this.res = res;
  }

  update(dt: number): void {}

  private generateCarSprite() {
    const sprite = new PIXI.Sprite(this.res.tiles.car["red"]);
    sprite.scale.x = 1 / sprite.width;
    sprite.scale.y = 1 / sprite.height;
    return sprite;
  }

  private addCar(car: Model.ICar) {
    const carSprite = this.generateCarSprite();
    // center the sprite's anchor point
    carSprite.anchor.set(0.5);

    // move the sprite to the center of the screen
    carSprite.x = car.pos.x;
    carSprite.y = car.pos.y;
    carSprite.rotation = car.angle;

    this.addChild(carSprite);
    this.graphics.set(car.id, carSprite);
  }
}
