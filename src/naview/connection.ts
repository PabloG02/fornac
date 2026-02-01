import { Loop } from './loop.js';
import { Region } from './region.js';

export class Connection {
  private loop: Loop = new Loop();
  private region: Region = new Region();
  // Start and end form the 1st base pair of the region.
  private start: number = 0;
  private end: number = 0;
  private xrad: number = 0;
  private yrad: number = 0;
  private angle: number = 0;
  // True if segment between this connection and the
  // next must be extruded out of the circle
  private extruded: boolean = false;
  // True if the extruded segment must be drawn long.
  private broken: boolean = false;

  private _isNull: boolean = false;

  isNull(): boolean {
    return this._isNull;
  }

  setNull(isNull: boolean): void {
    this._isNull = isNull;
  }

  getLoop(): Loop {
    return this.loop;
  }

  setLoop(loop: Loop): void {
    this.loop = loop;
  }

  getRegion(): Region {
    return this.region;
  }

  setRegion(region: Region): void {
    this.region = region;
  }

  getStart(): number {
    return this.start;
  }

  setStart(start: number): void {
    this.start = start;
  }

  getEnd(): number {
    return this.end;
  }

  setEnd(end: number): void {
    this.end = end;
  }

  getXrad(): number {
    return this.xrad;
  }

  setXrad(xrad: number): void {
    this.xrad = xrad;
  }

  getYrad(): number {
    return this.yrad;
  }

  setYrad(yrad: number): void {
    this.yrad = yrad;
  }

  getAngle(): number {
    return this.angle;
  }

  setAngle(angle: number): void {
    this.angle = angle;
  }

  isExtruded(): boolean {
    return this.extruded;
  }

  setExtruded(extruded: boolean): void {
    this.extruded = extruded;
  }

  isBroken(): boolean {
    return this.broken;
  }

  setBroken(broken: boolean): void {
    this.broken = broken;
  }
}
