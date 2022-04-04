import {
  drawActivePoints,
  drawDebugPoints,
  drawFuzzyLightOrbs,
  drawFuzzyLights,
  drawLightOrb,
  drawOutlines,
  drawPrimaryLight,
  getFuzzyGradient,
  getPrimaryGradient,
} from './draw-steps';
import { Point, Segment } from './interfaces';
import { State } from './main';

// DRAWING
const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!;
const ctx = canvas.getContext('2d')!;
const background_canvas = document.createElement('canvas');
const ctx2 = background_canvas.getContext('2d')!;
const cursor_canvas =
  document.querySelector<HTMLCanvasElement>('#cursor_canvas')!;
const ctx_cursor_canvas = cursor_canvas.getContext('2d')!;

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

// const question_mark_path = new Path2D(
//   'M6 0C2.7 0 0 2.7 0 6s2.7 6 6 6s6-2.7 6-6S9.3 0 6 0z M6 9.5c-0.3 0-0.5-0.2-0.5-0.5c0-0.3 0.2-0.5 0.5-0.5 c0.3 0 0.5 0.2 0.5 0.5C6.5 9.2 6.3 9.5 6 9.5z M6.8 6.5C6.6 6.6 6.4 6.9 6.4 7.1v0.3c0 0.1 0 0.1-0.1 0.1H5.7c-0.1 0-0.1 0-0.1-0.1 V7.2c0-0.3 0.1-0.6 0.3-0.9C6 6 6.3 5.8 6.5 5.7c0.5-0.2 0.8-0.6 0.8-1c0-0.6-0.6-1.1-1.3-1.1S4.7 4.2 4.7 4.8v0.1 c0 0.1 0 0.1-0.1 0.1H4c-0.1 0-0.1 0-0.1-0.1V4.8c0-0.5 0.2-1 0.6-1.4C4.9 3 5.4 2.8 6 2.8S7.1 3 7.5 3.4c0.4 0.4 0.6 0.9 0.6 1.4 C8.1 5.5 7.6 6.2 6.8 6.5z'
// );
// const question_mark_hit_detection = new Path2D(
//   'M6 0C2.7 0 0 2.7 0 6s2.7 6 6 6s6-2.7 6-6S9.3 0 6 0z'
// );

export function draw(
  state: State,
  segments: Segment[],
  mouseover: Point,
  points: Point[],
  selected_point: Point | null,
  font: string,
  question_mark: HTMLImageElement,
  question_mark_location: Point,
  question_mark_size: number
) {
  canvas.width = document.body.offsetWidth;
  canvas.height = document.body.offsetHeight;
  background_canvas.width = canvas.width;
  background_canvas.height = canvas.height;
  cursor_canvas.width = canvas.width;
  cursor_canvas.height = canvas.height;
  drawBackground(state, font, ctx2);
  canvas.style.backgroundImage = `url(${background_canvas.toDataURL()})`;
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (draw_outlines) drawOutlines(segments, ctx);

  if (mouseover) {
    const max_dimension = Math.max(canvas.width, canvas.height);

    if (draw_fuzzy_lights)
      drawFuzzyLights(
        mouseover,
        segments,
        dots,
        fuzzyRadius,
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
      ctx.font = font;
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        'Double click me!',
        canvas.width / 2,
        canvas.height / 2 - 120
      );
      ctx.globalCompositeOperation = 'source-over';
    }
    if (state === State.ExploreMe || state === State.FreePlay) {
      drawQuestionMark(
        question_mark_location,
        question_mark,
        question_mark_size,
        ctx
      );
    }

    if (draw_light_orb)
      drawLightOrb(mouseover, fuzzyRadius + 1, ctx_cursor_canvas);
    if (draw_fuzzy_light_orbs)
      drawFuzzyLightOrbs(mouseover, dots, fuzzyRadius, ctx);
  }
  if (draw_debug_points) drawDebugPoints(segments, ctx);
  if (draw_active_points)
    drawActivePoints(
      points,
      selected_point,
      point_radius,
      selected_point_radius,
      ctx
    );
  // ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawQuestionMark(
  center: Point,
  question_mark: HTMLImageElement,
  question_mark_size: number,
  ctx: CanvasRenderingContext2D
) {
  ctx.globalCompositeOperation = 'source-atop';
  ctx.drawImage(
    question_mark,
    center.x - question_mark_size / 2,
    center.y - question_mark_size / 2,
    question_mark_size,
    question_mark_size
  );
  ctx.globalCompositeOperation = 'source-over';
}

function drawBackground(
  state: State,
  font: string,
  ctx: CanvasRenderingContext2D
) {
  if (state === State.MouseoverMe || state === State.ExploreMe) {
    ctx.font = font;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let message =
      state === State.MouseoverMe ? 'Mouse over me!' : 'Explore me!';
    ctx.fillText(
      message,
      canvas.width / 2,
      canvas.height / 2 + (state === State.ExploreMe ? 120 : 0)
    );
  }
}
