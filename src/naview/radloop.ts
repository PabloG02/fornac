export class Radloop {
  private radius: number = 0;
  private loopnumber: number = 0;
  private next: Radloop | null = null;
  private prev: Radloop | null = null;

  getRadius(): number {
    return this.radius;
  }

  setRadius(radius: number): void {
    this.radius = radius;
  }

  getLoopnumber(): number {
    return this.loopnumber;
  }

  setLoopnumber(loopnumber: number): void {
    this.loopnumber = loopnumber;
  }

  getNext(): Radloop | null {
    return this.next;
  }

  setNext(next: Radloop | null): void {
    this.next = next;
  }

  getPrev(): Radloop | null {
    return this.prev;
  }

  setPrev(prev: Radloop | null): void {
    this.prev = prev;
  }
}
