import { Connection } from './connection.js';

export class Loop {
  private nconnection: number = 0;
  private _connections: Connection[] = [];
  private number: number = 0;
  private depth: number = 0;
  private mark: boolean = false;
  private x: number = 0;
  private y: number = 0;
  private radius: number = 0;

  getNconnection(): number {
    return this.nconnection;
  }

  setNconnection(nconnection: number): void {
    this.nconnection = nconnection;
  }

  setConnection(i: number, c: Connection | null): void {
    if (c != null) {
      this._connections[i] = c;
    } else {
      if (!this._connections[i]) {
        this._connections[i] = new Connection();
      }
      this._connections[i].setNull(true);
    }
  }

  getConnection(i: number): Connection | null {
    if (!this._connections[i]) {
      this._connections[i] = new Connection();
    }
    const c = this._connections[i];
    if (c.isNull()) {
      return null;
    } else {
      return c;
    }
  }

  addConnection(_i: number, c: Connection): void {
    this._connections.push(c);
  }

  getNumber(): number {
    return this.number;
  }

  setNumber(number: number): void {
    this.number = number;
  }

  getDepth(): number {
    return this.depth;
  }

  setDepth(depth: number): void {
    this.depth = depth;
  }

  isMark(): boolean {
    return this.mark;
  }

  setMark(mark: boolean): void {
    this.mark = mark;
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

  getRadius(): number {
    return this.radius;
  }

  setRadius(radius: number): void {
    this.radius = radius;
  }
}
