import { Point } from '../interfaces';

export class Polygon {
  private points: Point[];
  private anchors: Point[] = [];
  getPoints() {
    return this.points;
  }
  getPointsCoords() {
    return this.points.map((p) => {
      return { x: p.x, y: p.y };
    });
  }

  constructor(points: Point[]) {
    this.points = points;
  }

  getSegments() {
    const segments = [];
    for (let i = 0; i < this.points.length; i++) {
      let a = this.points[i];
      let b = this.points[(i + 1) % this.points.length];
      segments.push({ a, b });
    }
    return segments;
  }

  click() {
    //store each point's current location in the anchors array
    this.points.forEach((p) => {
      this.anchors.push({ x: p.x, y: p.y });
    });
  }
  unclick() {
    //reset the anchors array
    this.anchors = [];
  }

  move(x: number, y: number) {
    if (this.anchors.length === 0) return;
    //set each point's location to the difference between the mouse location and the anchor points
    this.points.forEach((p, i) => {
      p.x = this.anchors[i].x + x;
      p.y = this.anchors[i].y + y;
    });
  }

  getPoint(x: number, y: number) {
    return this.points.find((p) => p.x === x && p.y === y) ?? null;
  }
}

export function createRectangle(center: Point, width: number, height: number) {
  return new Polygon([
    { x: center.x - width / 2, y: center.y - height / 2 },
    { x: center.x + width / 2, y: center.y - height / 2 },
    { x: center.x + width / 2, y: center.y + height / 2 },
    { x: center.x - width / 2, y: center.y + height / 2 },
  ]);
}
export function createSquare(center: Point, size: number) {
  return createRectangle(center, size, size);
}

export function createRandomPolygon(center: Point) {
  //create a random irregular convex polygon
  //this polygon will have a random number of points between min_points and max_points (inclusive)
  //each point will have a random distance from the provided center point between min_distance and max_distance (inclusive)
  //the generated polygon will inevitably not be centered at the provided center point, so we need to move it to the center
  const min_dimension = Math.min(
    document.body.offsetWidth,
    document.body.offsetHeight
  );
  const min_points = 3,
    max_points = 5;
  const min_radius = Math.min(50, min_dimension / 12),
    // max_radius = Math.min(100, min_dimension / 5);
    max_radius = min_radius * 2;
  const points = [];
  const numPoints =
    Math.floor(Math.random() * (max_points - min_points + 1)) + min_points;
  for (let i = 0; i < numPoints; i++) {
    const angle = ((Math.PI * 2) / numPoints) * i;
    const radius = Math.random() * (max_radius - min_radius + 1) + min_radius;
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
  }

  //find the center of the polygon
  let polygon_center = { x: 0, y: 0 };
  for (let i = 0; i < points.length; i++) {
    polygon_center.x += points[i].x;
    polygon_center.y += points[i].y;
  }
  polygon_center.x /= points.length;
  polygon_center.y /= points.length;

  //move the center of the polygon to the input center point
  for (let i = 0; i < points.length; i++) {
    points[i].x += center.x - polygon_center.x;
    points[i].y += center.y - polygon_center.y;
  }

  return new Polygon(points);
}

export function getCenter(polygon?: Polygon) {
  if (!polygon) return { x: 0, y: 0 };
  let center = { x: 0, y: 0 };
  let points = polygon.getPoints();
  for (let i = 0; i < points.length; i++) {
    center.x += points[i].x;
    center.y += points[i].y;
  }
  center.x /= points.length;
  center.y /= points.length;
  return center;
}
