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

  updateCars(cars: Model.ICar[]) {
    const newCarIds: Set<number> = new Set();
    for (const car of cars) {
      newCarIds.add(car.id);
      const graphic = this.graphics.get(car.id);
      if (graphic === undefined) {
        this.addCar(car);
      } else {
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

  private generateCarSprite() {
    const carTileIdx = Math.floor(Math.random() * this.res.tiles.car.length);
    const sprite = new PIXI.Sprite(this.res.tiles.car[carTileIdx]);
    sprite.scale.x = 1 / this.res.tiles.crossing.width;
    sprite.scale.y = 1 / this.res.tiles.crossing.height;
    return sprite;
  }

  private addCar(car: Model.ICar) {
    const carSprite = this.generateCarSprite();
    // center the sprite's anchor point
    carSprite.anchor.set(0.5);

    this.addChild(carSprite);
    this.graphics.set(car.id, carSprite);
    this.updateCarSprite(carSprite, car);
  }
  private updateCarSprite(carSprite: PIXI.Sprite, car: Model.ICar) {
    // move the sprite to the center of the screen
    carSprite.x = car.pos.x / Model.TileWidth;
    carSprite.y = car.pos.y / Model.TileHeight;
    carSprite.rotation = car.angle;
  }
  private removeCar(carId: number) {
    const sprite = this.graphics.get(carId);
    if (sprite === undefined) return;
    this.removeChild(sprite);
    this.graphics.delete(carId);
  }
}
