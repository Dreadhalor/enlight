export interface Point {
  x: number;
  y: number;
  angle?: number;
  timeStamp?: number;
}

export interface Segment {
  a: Point;
  b: Point;
}
