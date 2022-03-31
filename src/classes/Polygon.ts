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

  getPreviewSegments(dx: number, dy: number) {
    let segments = this.getSegments();
    return segments.map((s) => {
      return {
        a: { x: s.a.x + dx, y: s.a.y + dy },
        b: { x: s.b.x + dx, y: s.b.y + dy },
      };
    });
  }
  getPreviewPoints(dx: number, dy: number) {
    return this.points.map((p) => {
      return { x: p.x + dx, y: p.y + dy };
    });
  }

  click() {
    //set the anchors array equal to each point's current location
    this.anchors = this.points.map((p) => {
      return { x: p.x, y: p.y };
    });
  }

  // move(x: number, y: number) {
  //   this.points.forEach((p) => {
  //     p.x += dx;
  //     p.y += dy;
  //   });
  // }
  move(dx: number, dy: number) {
    this.points.forEach((p) => {
      p.x += dx;
      p.y += dy;
    });
  }
  getPoint(x: number, y: number) {
    return this.points.find((p) => p.x === x && p.y === y) ?? null;
  }

  show(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    ctx.closePath();
    ctx.stroke();
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
