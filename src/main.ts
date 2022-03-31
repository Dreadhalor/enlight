import { draw } from './draw';
import { subdivideAll } from './line-utils';
import './style.css';
import { Segment, Point } from './interfaces';
import { Polygon, createRectangle, createSquare } from './classes/Polygon';
import polygon_data from './polygons';

const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!;

// LINE SEGMENTS
// const width = 1000;
let width = document.body.offsetWidth;
let height = document.body.offsetHeight;
let center = { x: width / 2, y: height / 2 };
const border = new Polygon([
  // Border
  { x: 0, y: 0 },
  { x: document.body.offsetWidth, y: 0 },
  { x: document.body.offsetWidth, y: document.body.offsetHeight },
  { x: 0, y: document.body.offsetHeight },
]);
const polygons = [
  // createSquare({ x: 400, y: 300 }, 100),
  // createRectangle({ x: 500, y: 500 }, 200, 100),
  // createRectangle(center, width * 0.9, height * 0.9),
  // createRectangle(center, width * 0.8, height * 0.8),
  // createRectangle(center, width * 0.7, height * 0.7),
  // createRectangle(center, width * 0.6, height * 0.6),
  // createRectangle(center, width * 0.5, height * 0.5),
  // createRectangle(center, width * 0.4, height * 0.4),
  // createRectangle(center, width * 0.3, height * 0.3),
];
for (let points of polygon_data) {
  polygons.push(new Polygon(points));
}

let selected_polygons: Polygon[] = [];
let selected_point: Point | null = null;

let segments: Segment[] = [
  { a: { x: 700, y: 150 }, b: { x: 900, y: 150 } },
  { a: { x: 800, y: 50 }, b: { x: 800, y: 250 } },
  { a: { x: 0, y: 0 }, b: { x: 640, y: 360 } },
];
segments = [];

// MOUSE
var Mouse: Point = {
  x: canvas.width / 2,
  y: canvas.height / 2,
};

let mousedown: Point | null = { x: 0, y: 0 };

function calculateSegments(
  border: Polygon,
  polygons: Polygon[],
  segments: Segment[]
) {
  let result = border.getSegments();
  result = result.concat(segments);
  polygons.forEach((polygon) => {
    if (selected_point) {
      result = result.concat(polygon.getSegments());
    } else if (selected_polygons.includes(polygon)) {
      result = result.concat(polygon.getPreviewSegments(...getMovement()));
    } else result = result.concat(polygon.getSegments());
  });
  result = subdivideAll(result);
  return result;
}

let physics_segments: Segment[] = calculateSegments(border, polygons, segments);
let visible_points: Point[] = [];

// DRAW LOOP
var updateCanvas = true;
let updateMove = true;
function drawLoop() {
  requestAnimationFrame(drawLoop);
  if (updateCanvas || updateMove) {
    draw(physics_segments, Mouse, visible_points, selected_point);
    updateCanvas = false;
    updateMove = false;
  }
}
window.onload = function () {
  drawLoop();
};

//store the mouse position on mouse down over the canvas
canvas.onmousedown = function (event) {
  mousedown = { x: event.clientX, y: event.clientY };

  let in_point = false;
  //loop through each point in the visible_points array and check if the mouse is within the radius of the point
  for (let point of visible_points) {
    if (isPointInRadius(point, Mouse, 20)) {
      in_point = true;
      selected_point = point;
      break;
    }
  }
  if (!in_point) selected_point = null;

  if (!selected_point) {
    // add all polygons in the irregular polygon array polygons which contain the mouse position to selected_polygons
    selected_polygons = polygons.filter((polygon) =>
      isPointInPolygon(polygon, { x: event.clientX, y: event.clientY })
    );
  }
  updateVisiblePoints();
};
canvas.onmouseup = function () {
  if (!selected_point) {
    //move the polygon to the mouse position
    for (let polygon of selected_polygons) {
      if (!updateMove) updateMove = true;
      polygon.move(...getMovement());
    }
    // if (!selected_point) selected_polygons = [];
  }
  mousedown = null;
};

function updateVisiblePoints() {
  //add each point from selected_polygons to the visible_points array
  visible_points = selected_polygons
    .map((polygon) => {
      if (selected_point) return polygon.getPoints();
      return polygon.getPreviewPoints(...getMovement());
    })
    .flat(1);
  //if there are points in the visible_points array then update the canvas
  updateCanvas = true;
}

// create a function which determines whether or not a point is inside a polygon
function isPointInPolygon(polygon: Polygon, point: Point) {
  let inside = false;
  let points = polygon.getPoints();
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    let xi = points[i].x,
      yi = points[i].y;
    let xj = points[j].x,
      yj = points[j].y;
    let intersect =
      yi > point.y != yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function getMovement(): [number, number] {
  if (!Mouse || !mousedown) return [0, 0];
  return [Mouse.x - mousedown?.x, Mouse.y - mousedown!.y];
  // return {
  //   x: Mouse.x - mousedown!.x,
  //   y: Mouse.y - mousedown!.y,
  // };
}

//create a function which determines whether or not a point is within a radius of another point
function isPointInRadius(point: Point, point2: Point, radius: number) {
  return (
    Math.sqrt(
      Math.pow(point.x - point2.x, 2) + Math.pow(point.y - point2.y, 2)
    ) < radius
  );
}

canvas.onmousemove = (event) => {
  // if the mouse is down and selected_polygons is not empty, set updateMove to true
  // if (mousedown && selected_polygons.length > 0) updateMove = true;
  updateMove = true;
  if (updateMove) {
    // update selected_point's position
    if (selected_point) {
      for (let polygon of selected_polygons) {
        let point = polygon.getPoint(selected_point.x, selected_point.y);
        if (point) {
          point.x = event.clientX;
          point.y = event.clientY;
          selected_point = point;
          break;
        }
      }
      updateVisiblePoints();
      // updateMove = true;
    }
    // recalculate the segments
    physics_segments = calculateSegments(border, polygons, segments);

    updateVisiblePoints();
  }
  Mouse.x = event.clientX;
  Mouse.y = event.clientY;
  updateCanvas = true;
};

window.exportPolygons = function () {
  let result = polygons.map((polygon) => polygon.getPointsCoords());
  console.log(result);
};
