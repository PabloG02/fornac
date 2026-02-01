import { Region } from './region.js';

export class Base {
  private mate: number | null = null;
  private x: number | null = null;
  private y: number | null = null;
  private extracted: boolean | null = null;
  private region: Region = new Region();

  getMate(): number | null {
    return this.mate;
  }

  setMate(mate: number): void {
    this.mate = mate;
  }

  getX(): number | null {
    return this.x;
  }

  setX(x: number): void {
    this.x = x;
  }

  getY(): number | null {
    return this.y;
  }

  setY(y: number): void {
    this.y = y;
  }

  isExtracted(): boolean | null {
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
