import { Region } from './region.js';

export class Base {
  private mate: number = 0;
  private x: number = 0;
  private y: number = 0;
  private extracted: boolean = false;
  private region: Region = new Region();

  getMate(): number {
    return this.mate;
  }

  setMate(mate: number): void {
    this.mate = mate;
  }

  getX(): number {
    return this.x;
  }

  setX(x: number): void {
    this.x = x;
  }

  getY(): number {
    return this.y;
  }

  setY(y: number): void {
    this.y = y;
  }

  isExtracted(): boolean {
    return this.extracted;
  }

  setExtracted(extracted: boolean): void {
    this.extracted = extracted;
  }

  getRegion(): Region {
    return this.region;
  }

  setRegion(region: Region): void {
    this.region = region;
  }
}
