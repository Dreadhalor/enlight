// import { Point } from '../interfaces';

// let mouseover: Point | null = null;
// let mousedown: Point | null = null;
// let lastClick: Point | null = null;
// let leftClickRadius = false;
// const dblClickTime = 500;
// const clickRadius = 15;

// function chebyshevDistance(a: Point, b: Point) {
//   return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
// }

// function checkClick(pointerup: PointerEvent) {
//   if (
//     mousedown &&
//     !leftClickRadius &&
//     chebyshevDistance(mousedown, pointerup) < clickRadius
//   ) {
//     return true;
//   }
//   return false;
// }
// function checkDblClick(event: PointerEvent) {
//   //if the time between event & lastClick is less than dblClickTime
//   //and the distance between event & lastClick is less than clickRadius
//   //then return true
//   if (
//     !leftClickRadius &&
//     lastClick &&
//     lastClick.timeStamp &&
//     event.timeStamp - lastClick.timeStamp < dblClickTime &&
//     chebyshevDistance(lastClick, event) < clickRadius
//   ) {
//     return true;
//   }
//   return false;
// }

// function setMouseover(event: PointerEvent | null) {
//   if (event) {
//     // checkExploreMe(event);
//     mouseover = { x: event.clientX, y: event.clientY };
//     // if mousedown is not null & the chebyshev distance between mouseover and mousedown is greater than clickRadius, set leftClickRadius to true
//     if (mousedown && chebyshevDistance(mousedown, mouseover) > clickRadius) {
//       leftClickRadius = true;
//     }
//   } else mouseover = null;
// }
// function setMousedown(event: PointerEvent | null) {
//   if (event) {
//     // checkExploreMe(event);
//     mousedown = {
//       x: event.clientX,
//       y: event.clientY,
//       timeStamp: event.timeStamp,
//     };
//   } else mousedown = null;
//   leftClickRadius = false;
// }

// function getMovement(): [number, number] {
//   if (!mouseover || !mousedown) return [0, 0];
//   return [mouseover.x - mousedown?.x, mouseover.y - mousedown!.y];
// }

// export default {};

// const onmouseleave = () => {
//   setMousedown(null);
//   setMouseover(null);
// };

// const pointermove = (event: PointerEvent) => {
//   setMouseover(event);
// };

// const onpointerup = function (event: PointerEvent) {
//   let clicked = checkClick(event);
//   let dblClick = checkDblClick(event);
//   if (clicked);
//   //  click(event);
//   if (clicked && dblClick) {
//     // onDblClick(event);
//   }
//   setMousedown(null);
// };

// //store the mouse position on mouse down over the canvas
// onpointerdown = function (event) {
//   setMousedown(event);
//   setMouseover(event);
// };
