export class Point {
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  public x: number;
  public y: number;
  public set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  public clear() {
    this.x = 0;
    this.y = 0;
  }
}
