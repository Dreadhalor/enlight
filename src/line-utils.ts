import { Polygon } from './classes/Polygon';
import { Point, Segment } from './interfaces';

//subdivide all segments in segments array with all other segments in segments array using the subdivide function
export function subdivideAll(segments: Segment[]) {
  let subdivided = subdivideSegments(segments);
  let result = filterIdenticalSegments(subdivided);
  return result;
}

function subdivideSegments(segments: Segment[]) {
  const result = [];
  for (var i = 0; i < segments.length; i++) {
    for (var j = 0; j < segments.length; j++) {
      if (i != j) {
        const subdivided = subdivide(segments[i], segments[j]);
        result.push(...subdivided);
      }
    }
  }
  return result;
}
function filterIdenticalSegments(segments: Segment[]) {
  const result = segments.filter(function (seg, index, self) {
    return (
      self.findIndex(function (t) {
        return (
          t.a.x == seg.a.x &&
          t.a.y == seg.a.y &&
          t.b.x == seg.b.x &&
          t.b.y == seg.b.y
        );
      }) == index
    );
  });
  return result;
}

//define a function that takes 2 line segments as arguments and returns an array of line segments that represent the input segments subdivided into smaller segments based on their intersection
function subdivide(seg1: Segment, seg2: Segment) {
  var seg1_a = seg1.a;
  var seg1_b = seg1.b;
  var seg2_a = seg2.a;
  var seg2_b = seg2.b;

  //find the intersection of the two segments
  var intersect = getIntersection(seg1_a, seg1_b, seg2_a, seg2_b);

  //if the segments intersect, return an array of line segments that represent the input segments subdivided into smaller segments based on their intersection
  if (intersect) {
    let result = [
      { a: seg1_a, b: intersect },
      { a: intersect, b: seg1_b },
      { a: seg2_a, b: intersect },
      { a: intersect, b: seg2_b },
    ];
    for (let i = result.length - 1; i > -1; i--) {
      if (result[i].a.x === result[i].b.x && result[i].a.y === result[i].b.y) {
        result.splice(i, 1);
      }
    }
    return result;
  }
  //if the segments do not intersect, return the original line segments
  else {
    return [seg1, seg2];
  }
}
//define getIntersection
export function getIntersection(
  seg1_a: Point,
  seg1_b: Point,
  seg2_a: Point,
  seg2_b: Point
) {
  var x1 = seg1_a.x;
  var y1 = seg1_a.y;
  var x2 = seg1_b.x;
  var y2 = seg1_b.y;
  var x3 = seg2_a.x;
  var y3 = seg2_a.y;
  var x4 = seg2_b.x;
  var y4 = seg2_b.y;

  var den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  //if the segments are parallel, return false
  if (den == 0) {
    return null;
  }

  var t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
  var u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

  //if the intersection is on the segment, return an object with the intersection coordinates
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return { x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) };
  }
  //if the intersection is not on the segment, return false
  else {
    return null;
  }
}

// create a function which determines whether or not a point is inside a polygon
export function isPointInPolygon(polygon: Polygon, point: Point) {
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

//create a function which determines whether or not a point is within a radius of another point
export function isPointInRadius(point: Point, point2: Point, radius: number) {
  return (
    Math.sqrt(
      Math.pow(point.x - point2.x, 2) + Math.pow(point.y - point2.y, 2)
    ) < radius
  );
}
