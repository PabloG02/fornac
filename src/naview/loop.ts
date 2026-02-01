import { Connection } from './connection.js';

export class Loop {
  private nconnection: number | null = null;
  private _connections: Connection[] = [];
  private number: number | null = null;
  private depth: number | null = null;
  private mark: boolean | null = null;
  private x: number | null = null;
  private y: number | null = null;
  private radius: number | null = null;

  getNconnection(): number | null {
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

  getNumber(): number | null {
    return this.number;
  }

  setNumber(number: number): void {
    this.number = number;
  }

  getDepth(): number | null {
    return this.depth;
  }

  setDepth(depth: number): void {
    this.depth = depth;
  }

  isMark(): boolean | null {
    return this.mark;
  }

  setMark(mark: boolean): void {
    this.mark = mark;
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

  getRadius(): number | null {
    return this.radius;
  }

  setRadius(radius: number): void {
    this.radius = radius;
  }
}
