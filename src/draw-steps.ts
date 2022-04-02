import { Point, Segment } from './interfaces';
import { getSightPolygon } from './utils';

export function drawPolygon(
  polygon: Point[],
  ctx: CanvasRenderingContext2D,
  fillStyle: string | CanvasGradient | CanvasPattern
) {
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.moveTo(polygon[0].x, polygon[0].y);
  for (let i = 1; i < polygon.length; i++) {
    let intersect = polygon[i];
    ctx.lineTo(intersect.x, intersect.y);
  }
  ctx.fill();
}

export function getPrimaryGradient(
  max_dimension: number,
  mouseover: Point,
  ctx: CanvasRenderingContext2D
) {
  let gradient = ctx.createRadialGradient(
    mouseover.x,
    mouseover.y,
    0,
    mouseover.x,
    mouseover.y,
    max_dimension
  );
  gradient.addColorStop(0, '#aaa');
  gradient.addColorStop(1, 'black');

  return gradient;
}
export function getFuzzyGradient(
  max_dimension: number,
  mouseover: Point,
  dots: number,
  ctx: CanvasRenderingContext2D
) {
  let gradient = ctx.createRadialGradient(
    mouseover.x,
    mouseover.y,
    0,
    mouseover.x,
    mouseover.y,
    max_dimension
  );

  gradient.addColorStop(0, `rgba(255,255,255,${2 / dots})`);
  gradient.addColorStop(1, `rgba(255,255,255,0)`);

  return gradient;
}

export function drawOutlines(
  segments: Segment[],
  ctx: CanvasRenderingContext2D
) {
  ctx.strokeStyle = '#999';
  for (let i = 0; i < segments.length; i++) {
    let seg = segments[i];
    ctx.beginPath();
    ctx.moveTo(seg.a.x, seg.a.y);
    ctx.lineTo(seg.b.x, seg.b.y);
    ctx.stroke();
  }
}

export function drawFuzzyLightOrbs(
  mouseover: Point,
  dots: number,
  radius: number,
  ctx: CanvasRenderingContext2D
) {
  // Draw red dots
  ctx.fillStyle = '#dd3838';
  for (let angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / dots) {
    let dx = Math.cos(angle) * radius;
    let dy = Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.arc(mouseover.x + dx, mouseover.y + dy, 2, 0, 2 * Math.PI, false);
    ctx.fill();
  }
}
export function drawFuzzyLights(
  mouseover: Point,
  segments: Segment[],
  dots: number,
  radius: number,
  ctx: CanvasRenderingContext2D,
  fillStyle: string | CanvasGradient | CanvasPattern
) {
  let shadows: any[] = [];
  for (let angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / dots) {
    let dx = Math.cos(angle) * radius;
    let dy = Math.sin(angle) * radius;
    shadows.push(getSightPolygon(mouseover.x + dx, mouseover.y + dy, segments));
  }
  // DRAW AS A GIANT POLYGON
  for (let shadow of shadows) {
    drawPolygon(shadow, ctx, fillStyle);
  }
}

export function drawLightOrb(
  mouseover: Point,
  radius: number,
  ctx: CanvasRenderingContext2D
) {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(mouseover.x, mouseover.y, radius, 0, 2 * Math.PI, false);
  ctx.fill();
}
export function drawPrimaryLight(
  mouseover: Point,
  segments: Segment[],
  ctx: CanvasRenderingContext2D,
  fillStyle: string | CanvasGradient | CanvasPattern
) {
  let shadow = getSightPolygon(mouseover.x, mouseover.y, segments);
  drawPolygon(shadow, ctx, fillStyle);
}

export function drawDebugPoints(
  segments: Segment[],
  ctx: CanvasRenderingContext2D
) {
  ctx.fillStyle = 'white';
  for (let i = 0; i < segments.length; i++) {
    let seg = segments[i];
    ctx.beginPath();
    ctx.arc(seg.a.x, seg.a.y, 5, 0, 2 * Math.PI);
    ctx.arc(seg.b.x, seg.b.y, 5, 0, 2 * Math.PI);
    ctx.fill();
  }
}

export function drawActivePoints(
  points: Point[],
  selected_point: Point | null,
  point_radius: number,
  selected_point_radius: number,
  ctx: CanvasRenderingContext2D
) {
  ctx.fillStyle = '#dd3838';
  for (let point of points) {
    ctx.beginPath();
    let radius =
      point !== selected_point ? point_radius : selected_point_radius;
    ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
    ctx.fill();
  }
}
