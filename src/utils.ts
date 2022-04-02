import { Point, Segment } from './interfaces';

export function getSightPolygon(
  sightX: number,
  sightY: number,
  segments: Segment[]
) {
  // Get all unique points
  let points = (function (segments) {
    let a: Point[] = [];
    segments.forEach(function (seg) {
      a.push(seg.a, seg.b);
    });
    return a;
  })(segments);
  let unique_points = uniquePoints(points);
  let unique_angles = setAngles(unique_points, sightX, sightY);
  return getIntersections(unique_angles, segments, sightX, sightY);
}

function uniquePoints(points: Point[]) {
  const set = new Set<string>();
  return points.filter(function (p) {
    const key = p.x + ',' + p.y;
    return set.size !== set.add(key).size;
  });
}
function setAngles(unique_points: Point[], sightX: number, sightY: number) {
  const unique_angles = [];
  for (let point of unique_points) {
    let angle = Math.atan2(point.y - sightY, point.x - sightX);
    point.angle = angle;
    unique_angles.push(angle - 0.00001, angle, angle + 0.00001);
  }
  return unique_angles;
}
function getIntersections(
  unique_angles: number[],
  segments: Segment[],
  sightX: number,
  sightY: number
) {
  // RAYS IN ALL DIRECTIONS
  let intersects = [];
  for (let j = 0; j < unique_angles.length; j++) {
    let angle = unique_angles[j];

    // Calculate dx & dy from angle
    let dx = Math.cos(angle);
    let dy = Math.sin(angle);

    // Ray from center of screen to mouse
    let ray = {
      a: { x: sightX, y: sightY },
      b: { x: sightX + dx, y: sightY + dy },
    };

    // Find CLOSEST intersection
    let closestIntersect = null;
    for (let i = 0; i < segments.length; i++) {
      let intersect = getIntersection(ray, segments[i]);
      if (!intersect) continue;
      if (!closestIntersect || intersect.param < closestIntersect.param) {
        closestIntersect = intersect;
      }
    }

    // Intersect angle
    if (!closestIntersect) continue;
    closestIntersect.angle = angle;

    // Add to list of intersects
    intersects.push(closestIntersect);
  }

  // Sort intersects by angle
  intersects = intersects.sort(function (a: Point, b: Point) {
    return a.angle! - b.angle!;
  });

  // Polygon intersects, in order of angle
  return intersects;
}

// Find intersection of RAY & SEGMENT
function getIntersection(ray: any, segment: any): any {
  // RAY in parametric: Point + Delta*T1
  let r_px = ray.a.x;
  let r_py = ray.a.y;
  let r_dx = ray.b.x - ray.a.x;
  let r_dy = ray.b.y - ray.a.y;

  // SEGMENT in parametric: Point + Delta*T2
  let s_px = segment.a.x;
  let s_py = segment.a.y;
  let s_dx = segment.b.x - segment.a.x;
  let s_dy = segment.b.y - segment.a.y;

  // Are they parallel? If so, no intersect
  let r_mag = Math.sqrt(r_dx * r_dx + r_dy * r_dy);
  let s_mag = Math.sqrt(s_dx * s_dx + s_dy * s_dy);
  if (r_dx / r_mag == s_dx / s_mag && r_dy / r_mag == s_dy / s_mag) {
    // Unit vectors are the same.
    return null;
  }

  // SOLVE FOR T1 & T2
  // r_px+r_dx*T1 = s_px+s_dx*T2 && r_py+r_dy*T1 = s_py+s_dy*T2
  // ==> T1 = (s_px+s_dx*T2-r_px)/r_dx = (s_py+s_dy*T2-r_py)/r_dy
  // ==> s_px*r_dy + s_dx*T2*r_dy - r_px*r_dy = s_py*r_dx + s_dy*T2*r_dx - r_py*r_dx
  // ==> T2 = (r_dx*(s_py-r_py) + r_dy*(r_px-s_px))/(s_dx*r_dy - s_dy*r_dx)
  let T2 =
    (r_dx * (s_py - r_py) + r_dy * (r_px - s_px)) / (s_dx * r_dy - s_dy * r_dx);
  let T1 = (s_px + s_dx * T2 - r_px) / r_dx;

  // Must be within parametic whatevers for RAY/SEGMENT
  if (T1 < 0) return null;
  if (T2 < 0 || T2 > 1) return null;

  // Return the POINT OF INTERSECTION
  return {
    x: r_px + r_dx * T1,
    y: r_py + r_dy * T1,
    param: T1,
  };
}
