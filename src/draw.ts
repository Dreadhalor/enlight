import { Point, Segment } from './interfaces';
import { getSightPolygon } from './utils';

// DRAWING
const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!;
const ctx = canvas.getContext('2d')!;

export const fuzzyRadius = 10;
const dots = 25;

export function draw(
  segments: Segment[],
  mouseover: Point,
  points: Point[],
  selected_point: Point | null
) {
  canvas.width = document.body.offsetWidth;
  canvas.height = document.body.offsetHeight;
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const draw_outlines = false;
  const draw_debug_points = false;

  if (draw_outlines) {
    // Draw segments
    ctx.strokeStyle = '#999';
    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      ctx.beginPath();
      ctx.moveTo(seg.a.x, seg.a.y);
      ctx.lineTo(seg.b.x, seg.b.y);
      ctx.stroke();
    }
  }

  if (mouseover) {
    // Sight Polygons
    // var fuzzyRadius = 10;
    var polygons = [getSightPolygon(mouseover.x, mouseover.y, segments)];
    for (var angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / dots) {
      var dx = Math.cos(angle) * fuzzyRadius;
      var dy = Math.sin(angle) * fuzzyRadius;
      polygons.push(
        getSightPolygon(mouseover.x + dx, mouseover.y + dy, segments)
      );
    }

    const max_dimension = Math.max(canvas.width, canvas.height);
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
    // DRAW AS A GIANT POLYGON
    for (var i = 1; i < polygons.length; i++) {
      drawPolygon(polygons[i], ctx, gradient);
    }

    gradient = ctx.createRadialGradient(
      mouseover.x,
      mouseover.y,
      0,
      mouseover.x,
      mouseover.y,
      max_dimension
    );
    gradient.addColorStop(0, '#aaa');
    gradient.addColorStop(1, 'black');
    // drawPolygon(polygons[0], ctx, '#aaa');
    drawPolygon(polygons[0], ctx, gradient);

    const draw_outer_ring = false;
    // Draw red dots
    // ctx.fillStyle = '#dd3838';
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(mouseover.x, mouseover.y, fuzzyRadius + 1, 0, 2 * Math.PI, false);
    // ctx.arc(Mouse.x, Mouse.y, 2, 0, 2 * Math.PI, false);
    ctx.fill();
    if (draw_outer_ring) {
      for (var angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / dots) {
        var dx = Math.cos(angle) * fuzzyRadius;
        var dy = Math.sin(angle) * fuzzyRadius;
        ctx.beginPath();
        ctx.arc(mouseover.x + dx, mouseover.y + dy, 2, 0, 2 * Math.PI, false);
        ctx.fill();
      }
    }
  }

  if (draw_debug_points) {
    ctx.fillStyle = 'white';
    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      ctx.beginPath();
      ctx.arc(seg.a.x, seg.a.y, 5, 0, 2 * Math.PI);
      ctx.arc(seg.b.x, seg.b.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  const draw_active_points = true;
  if (draw_active_points) {
    ctx.fillStyle = '#dd3838';
    const point_radius = 5;
    const selected_point_radius = 10;
    for (let point of points) {
      ctx.beginPath();
      let radius =
        point !== selected_point ? point_radius : selected_point_radius;
      ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}

function drawPolygon(
  polygon: Point[],
  ctx: CanvasRenderingContext2D,
  fillStyle: string | CanvasGradient | CanvasPattern
) {
  ctx.fillStyle = fillStyle;

  ctx.beginPath();
  ctx.moveTo(polygon[0].x, polygon[0].y);
  for (var i = 1; i < polygon.length; i++) {
    var intersect = polygon[i];
    ctx.lineTo(intersect.x, intersect.y);
  }
  ctx.fill();
}
