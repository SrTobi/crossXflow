import * as PIXI from "pixi.js";
import { Entity } from "./entity";

export class Creature extends Entity {
  private body = new PIXI.Graphics();

  constructor() {
    super();

    // body
    let g = this.body;
    g.lineStyle(1, 0x000000, 0.7);
    g.beginFill(0xff3333);
    g.drawCircle(0, 0, 1);
    g.endFill();
    this.scale.x = 1 / 30;
    this.scale.y = 1 / 30;

    this.addChild(this.body);
  }

  update(dt: number): void {}
}
