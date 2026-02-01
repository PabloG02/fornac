export {};

declare global {
  interface Array<T> {
    equals(array: T[]): boolean;
  }
}
