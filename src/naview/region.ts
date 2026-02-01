export class Region {
  private _start1: number | null = null;
  private _end1: number | null = null;
  private _start2: number | null = null;
  private _end2: number | null = null;

  getStart1(): number | null {
    return this._start1;
  }

  setStart1(start1: number): void {
    this._start1 = start1;
  }

  getEnd1(): number | null {
    return this._end1;
  }

  setEnd1(end1: number): void {
    this._end1 = end1;
  }

  getStart2(): number | null {
    return this._start2;
  }

  setStart2(start2: number): void {
    this._start2 = start2;
  }

  getEnd2(): number | null {
    return this._end2;
  }

  setEnd2(end2: number): void {
    this._end2 = end2;
  }
}
