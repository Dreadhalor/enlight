import { Point, Segment } from './interfaces';
import { State } from './main';
import { getSightPolygon } from './utils';

// DRAWING
const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!;
const ctx = canvas.getContext('2d')!;

export const fuzzyRadius = 10;
const dots = 10;
const point_radius = 4;
const selected_point_radius = 10;
const draw_light_orb = true;
const draw_fuzzy_light_orbs = false;
const draw_outlines = false;
const draw_debug_points = false;
const draw_active_points = true;
const draw_fuzzy_lights = true;
const draw_primary_light = true;

export function draw(
  state: State,
  segments: Segment[],
  mouseover: Point,
  points: Point[],
  selected_point: Point | null
) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state === State.MouseoverMe || state === State.ExploreMe) {
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    let message =
      state === State.MouseoverMe ? 'Mouse over me!' : 'Explore me!';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
  }

  if (draw_outlines) drawOutlines(segments, ctx);

  if (mouseover) {
    const max_dimension = Math.max(canvas.width, canvas.height);

    if (draw_fuzzy_lights)
      drawFuzzyLights(
        mouseover,
        segments,
        dots,
        ctx,
        getFuzzyGradient(max_dimension, mouseover, dots, ctx)
      );
    if (draw_primary_light)
      drawPrimaryLight(
        mouseover,
        segments,
        ctx,
        getPrimaryGradient(max_dimension, mouseover, ctx)
      );

    if (state === State.MouseoverMe) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.font = '30px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.fillText(
        'Double click me!',
        canvas.width / 2,
        canvas.height / 2 - 150
      );
      ctx.globalCompositeOperation = 'source-over';
    }

    if (draw_light_orb) drawLightOrb(mouseover, fuzzyRadius + 1, ctx);
    if (draw_fuzzy_light_orbs) drawFuzzyLightOrbs(mouseover, dots, ctx);
  }
  if (draw_debug_points) drawDebugPoints(segments, ctx);
  if (draw_active_points) drawActivePoints(points, selected_point, ctx);
}

function drawPolygon(
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

function getPrimaryGradient(
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
function getFuzzyGradient(
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

function drawOutlines(segments: Segment[], ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = '#999';
  for (let i = 0; i < segments.length; i++) {
    let seg = segments[i];
    ctx.beginPath();
    ctx.moveTo(seg.a.x, seg.a.y);
    ctx.lineTo(seg.b.x, seg.b.y);
    ctx.stroke();
  }
}

function drawFuzzyLightOrbs(
  mouseover: Point,
  dots: number,
  ctx: CanvasRenderingContext2D
) {
  // Draw red dots
  ctx.fillStyle = '#dd3838';
  for (let angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / dots) {
    let dx = Math.cos(angle) * fuzzyRadius;
    let dy = Math.sin(angle) * fuzzyRadius;
    ctx.beginPath();
    ctx.arc(mouseover.x + dx, mouseover.y + dy, 2, 0, 2 * Math.PI, false);
    ctx.fill();
  }
}

function drawLightOrb(
  mouseover: Point,
  radius: number,
  ctx: CanvasRenderingContext2D
) {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(mouseover.x, mouseover.y, radius, 0, 2 * Math.PI, false);
  ctx.fill();
}

function drawDebugPoints(segments: Segment[], ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'white';
  for (let i = 0; i < segments.length; i++) {
    let seg = segments[i];
    ctx.beginPath();
    ctx.arc(seg.a.x, seg.a.y, 5, 0, 2 * Math.PI);
    ctx.arc(seg.b.x, seg.b.y, 5, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function drawActivePoints(
  points: Point[],
  selected_point: Point | null,
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

function drawPrimaryLight(
  mouseover: Point,
  segments: Segment[],
  ctx: CanvasRenderingContext2D,
  fillStyle: string | CanvasGradient | CanvasPattern
) {
  let shadow = getSightPolygon(mouseover.x, mouseover.y, segments);
  drawPolygon(shadow, ctx, fillStyle);
}
function drawFuzzyLights(
  mouseover: Point,
  segments: Segment[],
  dots: number,
  ctx: CanvasRenderingContext2D,
  fillStyle: string | CanvasGradient | CanvasPattern
) {
  let shadows: any[] = [];
  for (let angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / dots) {
    let dx = Math.cos(angle) * fuzzyRadius;
    let dy = Math.sin(angle) * fuzzyRadius;
    shadows.push(getSightPolygon(mouseover.x + dx, mouseover.y + dy, segments));
  }
  // DRAW AS A GIANT POLYGON
  for (let shadow of shadows) {
    drawPolygon(shadow, ctx, fillStyle);
  }
}
