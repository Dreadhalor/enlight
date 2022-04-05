import { draw, fuzzyRadius } from './draw';
import {
  getArea,
  getLength,
  isPointInPolygon,
  isPointInRadius,
  subdivideAll,
} from './line-utils';
import './style.css';
import { Segment, Point } from './interfaces';
import {
  Polygon,
  createRectangle,
  createRandomPolygon,
  getCenter,
} from './classes/Polygon';
// import polygon_data from './polygons';
import FontFaceObserver from 'fontfaceobserver-es';

const question_mark_size = 36;
const question_mark_idle_url = new URL(
  '/AiFillQuestionCircle.svg',
  import.meta.url
).href;
const question_mark_mouseover_url = new URL(
  '/AiFillQuestionCircleMouseover.svg',
  import.meta.url
).href;
let question_mark_location = { x: 0, y: 0 };
const question_mark_idle = new Image();
question_mark_idle.src = question_mark_idle_url;
const question_mark_mouseover = new Image();
question_mark_mouseover.src = question_mark_mouseover_url;
const question_mark = new Image();

question_mark.src = question_mark_idle_url;

export enum State {
  MouseoverMe,
  ExploreMe,
  FreePlay,
}

const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!;
canvas.width = document.body.offsetWidth;
canvas.height = document.body.offsetHeight;
const mouse = document.createElement('canvas');
const ctx_mouse = mouse.getContext('2d')!;
const mouse_radius = 11;
mouse.width = mouse_radius * 2;
mouse.height = mouse_radius * 2;
ctx_mouse.fillStyle = '#fff';
ctx_mouse.arc(mouse_radius, mouse_radius, mouse_radius, 0, 2 * Math.PI);
ctx_mouse.fill();

const overlay = document.querySelector<HTMLDivElement>('#overlay')!;
const info = document.querySelector<HTMLDivElement>('#info')!;
let info_open = false;
const qmark = document.querySelector<HTMLImageElement>('#qmark')!;

qmark.onclick = () => {
  info_open = info.style.display === 'none' ? true : false;
};
qmark.onpointerover = () => {
  question_mark.src = question_mark_mouseover_url;
};
qmark.onpointerup = () => {
  question_mark.src = question_mark_idle_url;
};
qmark.onpointerleave = () => {
  question_mark.src = question_mark_idle_url;
};

const font_name = 'Annie Use Your Telescope';
const font_size = '60px';

let state = State.MouseoverMe;

let mouseover: Point | null = null;
let mousedown: Point | null = null;
let lastClick: Point | null = null;
let leftClickRadius = false;
let justDblClicked = false;
const dblClickTime = 500;
const clickRadius = 15;

const point_radius = 20;
let updateCanvas = true;
let updateMove = true;

let borders: Polygon[] = [];
const border_margin = 2;

const setBorders = (borders: Polygon[]) => {
  while (borders.pop());
  let width = canvas.width;
  let height = canvas.height;
  console.log('borders, canvas size: ', width, height);
  let center = { x: width / 2, y: height / 2 };
  borders.push(
    createRectangle(center, width + border_margin, height + border_margin),
    createRectangle(center, width + fuzzyRadius * 4, height + fuzzyRadius * 4)
  );
  updateMove = true;
};

let prev_canvas_dimensions = { width: 0, height: 0 };
const checkBorders = () => {
  let width = canvas.width;
  let height = canvas.height;
  if (
    prev_canvas_dimensions.width !== width ||
    prev_canvas_dimensions.height !== height
  ) {
    updateMove = true;
  }
  prev_canvas_dimensions = { width, height };
};
const getBorders = () => {
  checkBorders();
  let width = canvas.width;
  let height = canvas.height;
  let center = { x: width / 2, y: height / 2 };
  let result = [
    createRectangle(center, width + border_margin, height + border_margin),
    createRectangle(center, width + fuzzyRadius * 4, height + fuzzyRadius * 4),
  ];
  return result;
};

setBorders(borders);

const polygons: Polygon[] = [
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
// for (let points of polygon_data) {
//   polygons.push(new Polygon(points));
// }

let selected_polygons: Polygon[] = [];
let selected_point: Point | null = null;

let segments: Segment[] = [
  // { a: { x: 700, y: 150 }, b: { x: 900, y: 150 } },
  // { a: { x: 800, y: 50 }, b: { x: 800, y: 250 } },
  // { a: { x: 0, y: 0 }, b: { x: 640, y: 360 } },
];

function calculateSegments(
  borders: Segment[],
  polygons: Polygon[],
  segments: Segment[]
) {
  let result = borders;
  result = result.concat(segments);
  polygons.forEach((polygon) => {
    if (selected_point) {
      result = result.concat(polygon.getSegments());
    } else if (selected_polygons.includes(polygon)) {
      // result = result.concat(polygon.getPreviewSegments(...getMovement()));
      result = result.concat(polygon.getSegments());
    } else result = result.concat(polygon.getSegments());
  });
  result = subdivideAll(result);
  return result;
}
function getBorderSegments() {
  // return borders.map((border) => border.getSegments()).flat(1);
  return getBorders()
    .map((border) => border.getSegments())
    .flat(1);
}

function setSelectedPolygons(event: PointerEvent) {
  let potential_polygons = getIntersectingPolygons(event, polygons);
  //if potential_polygons is larger than 1, remove all but the polygon with the smallest area
  if (potential_polygons.length > 1) {
    potential_polygons = potential_polygons.sort(
      (a, b) => getArea(a) - getArea(b)
    );
    potential_polygons = potential_polygons.slice(0, 1);
  }
  selected_polygons = potential_polygons;
}
function getIntersectingPolygons(
  event: PointerEvent,
  polygons: Polygon[] = []
) {
  return polygons.filter((polygon) =>
    isPointInPolygon(polygon, { x: event.clientX, y: event.clientY })
  );
}

let physics_segments: Segment[] = calculateSegments(
  getBorderSegments(),
  polygons,
  segments
);
let visible_points: Point[] = [];

// DRAW LOOP
function drawLoop() {
  checkBorders();
  if (updateMove) {
    updateSegments();
    updateMove = false;
  }
  //set the cursor of info to the mouse canvas
  // document.body.style.cursor = `url(${mouse.toDataURL()}) ${mouse_radius} ${mouse_radius}, auto`;

  if (info_open) qmark.style.pointerEvents = 'none';
  else qmark.style.pointerEvents = 'auto';
  if (
    info.style.display !== 'none' &&
    !info_open &&
    state === State.ExploreMe
  ) {
    state = State.FreePlay;
  }
  info.style.display = info_open ? 'flex' : 'none';

  switch (state) {
    case State.ExploreMe:
      question_mark_location = { x: canvas.width / 2, y: canvas.height / 2 };
      qmark.style.display = 'block';
      break;
    case State.FreePlay:
      question_mark_location = {
        x: canvas.width - question_mark_size / 2 - 10,
        y: question_mark_size / 2 + 10,
      };
      qmark.style.display = 'block';
      break;
    default:
      qmark.style.display = 'none';
      break;
  }
  qmark.style.left = `${question_mark_location.x - question_mark_size / 2}px`;
  qmark.style.top = `${question_mark_location.y - question_mark_size / 2}px`;
  let rect = qmark.getBoundingClientRect();
  if (updateCanvas || updateMove) {
    draw(
      state,
      physics_segments,
      mouseover!,
      visible_points,
      selected_point,
      `${font_size} ${font_name}`,
      question_mark,
      {
        x: rect.left + question_mark_size / 2,
        y: rect.top + question_mark_size / 2,
      },
      question_mark_size
    );
    updateCanvas = true;
    // updateMove = false;
  }
  requestAnimationFrame(drawLoop);
}
window.onload = function () {
  //dont start the draw loop until the font is loaded
  const font_loader = new FontFaceObserver(font_name);
  font_loader.load().then(() => {
    document.body.style.opacity = '1';
    drawLoop();
  });
};

function chebyshevDistance(a: Point, b: Point) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}
function checkClick(pointerup: PointerEvent) {
  if (
    mousedown &&
    !leftClickRadius &&
    chebyshevDistance(mousedown, pointerup) < clickRadius
  ) {
    return true;
  }
  return false;
}
function checkDblClick(event: PointerEvent) {
  //if the time between event & lastClick is less than dblClickTime
  //and the distance between event & lastClick is less than clickRadius
  //then return true
  if (
    !justDblClicked &&
    !leftClickRadius &&
    lastClick &&
    lastClick.timeStamp &&
    event.timeStamp - lastClick.timeStamp < dblClickTime &&
    chebyshevDistance(lastClick, event) < clickRadius
  ) {
    return true;
  }
  return false;
}
function click(event: PointerEvent) {
  if (info_open) info_open = false;
  justDblClicked = false;
  lastClick = {
    x: event.clientX,
    y: event.clientY,
    timeStamp: event.timeStamp,
  };
  if (!selected_point) {
    // add all polygons in the irregular polygon array polygons which contain the mouse position to selected_polygons
    setSelectedPolygons(event);
  }
  updateVisiblePoints();
}

function onDblClick(event: PointerEvent) {
  justDblClicked = true;
  let in_selected = false;
  for (let polygon of getIntersectingPolygons(event, polygons)) {
    let polygon_index = polygons.indexOf(polygon);
    let selected_index = selected_polygons.indexOf(polygon);
    if (polygon_index > -1 && selected_index > -1) {
      polygons.splice(polygon_index, 1);
      in_selected = true;
    }
  }
  if (!in_selected) {
    let random_polygon = createRandomPolygon({
      x: event.clientX,
      y: event.clientY,
    });
    polygons.push(random_polygon);
    // selected_polygons = [random_polygon];
    if (state === State.MouseoverMe) state = State.ExploreMe;
  } else selected_polygons = [];
  updateSegments();
  selected_point = null;
  updateVisiblePoints();
}

function setMouseover(event: PointerEvent | null) {
  if (event) {
    mouseover = { x: event.clientX, y: event.clientY };
    // if mousedown is not null & the chebyshev distance between mouseover and mousedown is greater than clickRadius, set leftClickRadius to true
    if (mousedown && chebyshevDistance(mousedown, mouseover) > clickRadius) {
      leftClickRadius = true;
    }
  } else mouseover = null;
}
function setMousedown(event: PointerEvent | null) {
  if (event) {
    mousedown = {
      x: event.clientX,
      y: event.clientY,
      timeStamp: event.timeStamp,
    };
  } else mousedown = null;
  leftClickRadius = false;
}

function updateVisiblePoints() {
  //set the visible_points array to the points of all polygons in the selected_polygons array
  visible_points = selected_polygons
    .map((polygon) => polygon.getPoints())
    .flat(1);
  updateCanvas = true;
}

function getMovement(): [number, number] {
  if (!mouseover || !mousedown) return [0, 0];
  return [mouseover.x - mousedown?.x, mouseover.y - mousedown!.y];
}

updateSegments();
//define updateSegments()
function updateSegments() {
  physics_segments = calculateSegments(getBorderSegments(), polygons, segments);
}

window.onresize = () => {
  setBorders(borders);
  updateSegments();
};

const pointermove = (event: PointerEvent) => {
  // if the mouse is down and selected_polygons is not empty, set updateMove to true
  if (mousedown && selected_polygons.length > 0) updateMove = true;
  // updateMove = true;
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
    } else {
      // update all selected_polygons' positions
      for (let polygon of selected_polygons) {
        if (!updateMove) updateMove = true;
        polygon.move(...getMovement());
      }
    }
    // recalculate the segments
    physics_segments = calculateSegments(
      getBorderSegments(),
      polygons,
      segments
    );

    updateVisiblePoints();
  }
  setMouseover(event);
  updateCanvas = true;
};
// canvas.onpointermove = pointermove;
overlay.onpointermove = pointermove;

//store the mouse position on mouse down over the canvas
const pointerdown = (event: PointerEvent) => {
  question_mark_location = { x: event.clientX, y: event.clientY };
  setMousedown(event);
  let in_point = false;
  //loop through each point in the visible_points array and check if the mouse is within the radius of the point
  for (let point of visible_points) {
    if (isPointInRadius(point, mousedown, point_radius)) {
      in_point = true;
      selected_point = point;
      break;
    }
  }
  if (!in_point) selected_point = null;
  if (!selected_point) {
    let in_selected = false;
    for (let polygon of selected_polygons) {
      //if the mouse is inside of the polygon, set in_selected to true
      if (isPointInPolygon(polygon, { x: event.clientX, y: event.clientY })) {
        in_selected = true;
        break;
      }
    }
    if (!in_selected) {
      selected_polygons = [];
    } else {
      // click each polygon in selected_polygons
      for (let polygon of selected_polygons) {
        polygon.click();
      }
    }
  }
  updateVisiblePoints();
  setMouseover(event);
  updateCanvas = true;
};
// canvas.onpointerdown = pointerdown;
overlay.onpointerdown = pointerdown;

const pointerup = (event: PointerEvent) => {
  if (!selected_point) {
    // for each polygon in selected_polygons, unclick()
    for (let polygon of selected_polygons) {
      polygon.unclick();
    }
  }
  let clicked = checkClick(event);
  let dblClick = checkDblClick(event);
  if (dblClick) onDblClick(event);
  else if (clicked) click(event);
  selected_point = null;
  setMousedown(null);
  updateCanvas = true;
};
// canvas.onpointerup = pointerup;
overlay.onpointerup = pointerup;

const mouseleave = () => {
  setMousedown(null);
  setMouseover(null);
  //unclick all selected_polygons
  for (let polygon of selected_polygons) {
    polygon.unclick();
  }
  selected_point = null;
  updateVisiblePoints();
};
// canvas.onmouseleave = mouseleave;
overlay.onmouseleave = mouseleave;

// disable typescript linting for the next line
// @ts-ignore
window.exportPolygons = function () {
  let result = polygons.map((polygon) => polygon.getPointsCoords());
  console.log(result);
};
