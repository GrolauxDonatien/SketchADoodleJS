toolkit = (() => {

    const THRESHOLDAPPROX = 2;

    function distance(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }

    function sqrDistance(x1, y1, x2, y2) {
        return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
    }

    function computeQuadraticBaseValue(t, a, b, c) {
        const mt = 1 - t;
        return mt * mt * a + 2 * mt * t * b + t * t * c;
    }

    /**
     * Returns the coordinate of a point at a specific t of a spécific curve inside a BSpline
     * @param {float[]} points BSpline array
     * @param {int} start the index of the Bézier curve inside the BSpline
     * @param {float} t the t value for the curve
     */
    function getCoordsFor(points, start, t) {
        return {
            x: computeQuadraticBaseValue(t, points[start], points[start + 2], points[start + 4]),
            y: computeQuadraticBaseValue(t, points[start + 1], points[start + 3], points[start + 5])
        }
    }

    /**
     * Return the intermediate control point for a quadratic Bézier curve that passes through the 3 points.
     * @param {float} points0 
     * @param {float} points1 
     * @param {float} points2 
     * @param {float} points3 
     * @param {float} points4 
     * @param {float} points5 
     */
    function getCtrlPointPassingBy(points0, points1, points2, points3, points4, points5) {
        // http://stackoverflow.com/questions/6711707/draw-a-quadratic-bezier-curve-through-three-given-points
        const distanceSP = distance(points0, points1, points2, points3);
        const distanceEP = distance(points4, points5, points2, points3);
        let ratio = (distanceSP - distanceEP) / (distanceSP + distanceEP);
        ratio = 0.5 - (1.0 / 3.0) * ratio;
        const ratioInv = 1 - ratio;
        const term2x = points0 * ratio * ratio;
        const term2y = points1 * ratio * ratio;
        const term3x = points4 * ratioInv * ratioInv;
        const term3y = points5 * ratioInv * ratioInv;
        const term4 = 2 * ratio * ratioInv;
        return { x: (points2 - term2x - term3x) / term4, y: (points3 - term2y - term3y) / term4 };
    }

    /**
     * Transforms part of an array of segments into a Bézier curve. Returns null if the transformation is considered not good enough.
     * @param {float[]} poly Array of segments
     * @param {int} start Start index in the array to convert from
     * @param {int} end End index in the array to convert to
     */
    function partToBezier(poly, start, end) {
        let cand = [];
        if (end - start < 6) { // line segment => colinear bezier control points
            return [
                poly[start], poly[start + 1],
                (poly[start] + poly[end - 2]) / 2, (poly[start + 1] + poly[end - 1]) / 2,
                poly[end - 2], poly[end - 1]
            ];
        } else if ((end - start) % 4 == 2) {
            // odd number of points ; we'll use the middle one to infer a control point
            const mid = (end - (start + 2)) / 2 + start;
            const p = getCtrlPointPassingBy(poly[start], poly[start + 1], poly[mid], poly[mid + 1], poly[end - 2], poly[end - 1]);
            cand = [poly[start], poly[start + 1], p.x, p.y, poly[end - 2], poly[end - 1]];
            if (end - start < 8) return cand; // don't validate, assume it's always right
        } else {
            // even number of points; we'll use the middle of the two points in the middle
            const mid = (end - (start + 2)) / 2 + start - 1;
            const p = getCtrlPointPassingBy(poly[start], poly[start + 1], (poly[mid] + poly[mid + 2]) / 2, (poly[mid + 1] + poly[mid + 3]) / 2, poly[end - 2], poly[end - 1]);
            cand = [poly[start], poly[start + 1], p.x, p.y, poly[end - 2], poly[end - 1]];
        }
        let wholedist = 0;
        for (let i = start; i < end - 2; i += 2) {
            wholedist += distance(poly[i], poly[i + 1], poly[i + 2], poly[i + 3]);
        }
        let curdist = 0;
        for (let i = start + 2; i < end - 2; i += 2) {
            curdist += distance(poly[i - 2], poly[i - 1], poly[i], poly[i + 1]);
            const ratio = curdist / wholedist;
            const p = getCoordsFor(cand, 0, ratio);
            const diff = distance(p.x, p.y, poly[i], poly[i + 1]);
            if (diff > 2) return null;
        }
        return cand;
    }

    /**
     * Transform an array of segments into a BSpline
     * @param {float[]} poly An array of segments of line
     */
    function segmentsToBSpline(poly) {
        let ret = [poly[0], poly[1]];
        let cur = 0;
        while (cur < poly.length - 2) {
            let end = Math.min(cur + 6, poly.length);
            let last = partToBezier(poly, cur, end); // this one always succeed
            while (end + 2 < poly.length) {
                let candidate = partToBezier(poly, cur, end + 2);
                if (candidate == null) break;
                last = candidate;
                end += 2;
            }
            // end points to the end of the curve ; last contains the bezier part
            for (let i = 2; i < last.length; i++) {
                ret.push(last[i]);
            }
            cur = end - 2;
        }
        return ret;
    }

    /**
     * Transform a BSpline into an array of segments
     * @param {float[]} curve An array that represents a BSpline
     * @param {int} segments The number of segments of line each curve is to be approximated into
     */
    function bSplineToSegments(curve, segments) {
        let ret = [bspline[curve + 0], bspline[curve + 1]];
        let wholedist = 0;
        for (let i = 0; i < curve.length - 2; i += 2) {
            wholedist += distance(bspline[curve + i], bspline[curve + i + 1], bspline[curve + i + 2], bspline[curve + i + 3]);
        }
        let curdist = 0;
        let part = 1;
        let threshold = wholedist * part / segments;
        for (let i = 0; i < curve.length - 2; i += 4) {
            const length = distance(bspline[curve + i + 2], bspline[curve + i + 3], bspline[curve + i], bspline[curve + i + 1]) + distance(bspline[curve + i + 2], bspline[curve + i + 3], bspline[curve + i + 4], bspline[curve + i + 5]);
            while (curdist + length >= threshold) {
                const ratio = (threshold - curdist) / length;
                const p = getCoordsFor(curve, i, ratio);
                ret.push(p.x);
                ret.push(p.y);
                part++;
                threshold = wholedist * part / segments;
            }
            curdist += length;
        }
        return ret;
    }

    /**
     * Progressively draw a BSpline to feeding points.
     */
    function startBSpline(x, y) {
        let bspline = [];
        let segments = [x, y];
        function addBSpline(candidate) {
            if (bspline.length == 0) {
                bspline.push.apply(bspline, candidate);
            } else {
                bspline.push(candidate[2], candidate[3], candidate[4], candidate[5]);
            }
        }
        return {
            feedPoint(x, y) {
                segments.push(x, y);
                if (segments.length < 8) return;
                let candidate = partToBezier(segments, 0, segments.length);
                if (candidate == null) {
                    addBSpline(partToBezier(segments, 0, segments.length - 2));
                    segments.splice(0, segments.length - 4);
                }
            },
            getBSpline() {
                return bspline;
            },
            getSegments() {
                return segments;
            },
            finish() {
                addBSpline(partToBezier(segments, 0, segments.length));
                return { type: "bspline", data: bspline };
            }
        }
    }

    function approximateBSplineBySegments(bspline, offset, errors) {
        let fal = [];
        let precision = 0.5;
        let segs = 2;
        errors = errors * errors;
        while (precision > 0.1) {
            let pt = getCoordsFor(bspline, offset, precision);
            let tgt = getCoordsFor(bspline, offset, precision * 2);
            let ref = { x: (tgt.x - bspline[0]) * precision + bspline[0], y: (tgt.y - bspline[1]) * precision + bspline[1] };
            if (sqrDistance(pt.x, pt.y, ref.x, ref.y) < errors) {
                break;
            }
            segs *= 2;
            precision = precision / 2.0;
        }
        for (let i = 0; i < segs; i++) {
            let pt = getCoordsFor(bspline, offset, precision * i);
            fal.push(pt.x, pt.y);
        }
        fal.push(bspline[offset + 4]);
        fal.push(bspline[offset + 5]);
        return fal;
    }

    function getClosestPointToLine(x, y, line) {
        // http://paulbourke.net/geometry/pointline/
        let u = ((x - line[0]) * (line[2] - line[0]) + (y - line[1])
            * (line[3] - line[1]))
            / sqrDistance(line[2], line[3], line[0], line[1]);
        return {
            x: line[0] + u * (line[2] - line[0]),
            y: line[1] + u * (line[3] - line[1]), t: u
        };
    }


    function getClosestPointToSegment(x, y, segment) {
        if (segment[0] > segment[2]) { // reorders
            let s = segment[2];
            segment[2] = segment[0];
            segment[0] = s;
        }
        if (segment[1] > segment[3]) {
            let s = segment[3];
            segment[3] = segment[1];
            segment[1] = s;
        }
        let candidate = getClosestPointToLine(x, y, segment);
        if (candidate.t > 1.0) {
            return { x: segment[2], y: segment[3], t: 1.0 };
        } else if (candidate.t < 0.0) {
            return { x: segment[0], y: segment[1], t: 0.0 };
        } else {
            return candidate;
        }
    }

    function getClosestPointToSegments(x, y, segments) {
        let len = 0;
        for (let i = 0; i < segments.length - 2; i += 2) {
            len += distance(segments[i], segments[i + 1], segments[i + 2], segments[i + 3]);
        }
        let bestdist = Number.MAX_VALUE;
        let best = { x: segments[0], y: segments[1], t: 0 };
        let t = 0.0;
        for (let i = 0; i < segments.length - 2; i += 2) {
            let candidate = getClosestPointToSegment(x, y, [segments[i], segments[i + 1], segments[i + 2], segments[i + 3]]);
            let canddist = distance(x, y, candidate.x, candidate.y);
            if (canddist < bestdist) {
                bestdist = canddist;
                best = { x: candidate.x, y: candidate.y };
                best.t = t + candidate.t * distance(segments[i], segments[i + 1], segments[i + 2], segments[i + 3]) / len;
                if (best.t>1) best.t=1; // avoids approximation errors
            }
            t += distance(segments[i], segments[i + 1], segments[i + 2], segments[i + 3]) / len;
        }
        return best;
    }

    function assertCache(drawing) {
        if (drawing === undefined) debugger;
        if (!("cache" in drawing)) {
            drawing.cache = [];
            for (let i = 0; i < drawing.data.length - 2; i += 4) {
                drawing.cache.push(approximateBSplineBySegments(drawing.data, i, 1.0))
            }
        }
    }

    function getClosestPointToBSpline(x, y, drawing) {
        assertCache(drawing);
        let square_dist = Number.MAX_VALUE;
        let cx = drawing.data[0];
        let cy = drawing.data[1];
        let n = 0, t = 0;
        for (let i = 0; i < drawing.cache.length; i++) {
            let pt = getClosestPointToSegments(x, y, drawing.cache[i]);
            let dist = sqrDistance(x, y, pt.x, pt.y);
            if (dist < square_dist) {
                square_dist = dist;
                n = i;
                t = pt.t;
                cx = pt.x;
                cy = pt.y;
            }
        }
        return {
            x: cx,
            y: cy,
            n: n,
            t: t
        }
    }

    function distanceWithBSpline(x, y, drawing) {
        let pt = getClosestPointToBSpline(x, y, drawing);
        return distance(x, y, pt.x, pt.y);
    }

    function distanceWith(x, y, drawing) {
        let min;
        switch (drawing.type) {
            case "bspline":
                return distanceWithBSpline(x, y, drawing);
            case "compound":
                min = Number.MAX_VALUE;
                for (let i = 0; i < drawing.data.length; i++) {
                    min = Math.min(min, distanceWith(x, y, drawing.data[i]));
                    if (min == 0) return min;
                }
                return min;
            case "closedbspline":
                if (insideClosedbspline(x, y, drawing)) return 0;
                min=Number.MAX_VALUE;
                for(let i=0; i<drawing.data.lengt; i++) {
                    min=Main.min(min,distanceWithBSpline(x, y, {data:drawing.data[i]}));
                }
                return min;
        }
        return Number.MAX_VALUE;
    }


    function isPointInHVRectangle(rect, x, y) {
        let minx, miny, maxx, maxy;
        if (rect[0] < rect[2]) {
            minx = rect[0];
            maxx = rect[2];
        } else {
            minx = rect[2];
            maxx = rect[0];
        }
        if (rect[1] < rect[3]) {
            miny = rect[1];
            maxy = rect[3];
        } else {
            miny = rect[3];
            maxy = rect[1];
        }

        return (x >= minx && x <= maxx && y >= miny && y <= maxy);
    }

    function computeQuadraticFirstDerivativeRoot(a, b, c) {
        let t = -1;
        let denominator = a - 2 * b + c;
        if (denominator != 0) {
            t = (a - b) / denominator;
        }
        return t;
    }

    function getTightBoundingRectangle(curve) {
        let np2 = [curve[2] - curve[0], curve[3] - curve[1]];
        let np3 = [curve[4] - curve[0], curve[5] - curve[1]];

        // get angle for rotation
        let angle = angleAt0(np3[0], np3[1]);

        // rotate everything counter-angle so that it's aligned with the x-axis
        let rnp2 = [(np2[0] * Math.cos(-angle) - np2[1] * Math.sin(-angle)),
        (np2[0] * Math.sin(-angle) + np2[1] * Math.cos(-angle))];
        let rnp3 = [(np3[0] * Math.cos(-angle) - np3[1] * Math.sin(-angle)),
        (np3[0] * Math.sin(-angle) + np3[1] * Math.cos(-angle))];

        // same bounding box approach as before:
        let minx = Number.MAX_VALUE;
        let maxx = -Number.MAX_VALUE;
        if (0 < minx) {
            minx = 0;
        }
        if (0 > maxx) {
            maxx = 0;
        }
        if (rnp3[0] < minx) {
            minx = rnp3[0];
        }
        if (rnp3[0] > maxx) {
            maxx = rnp3[0];
        }
        let t = computeQuadraticFirstDerivativeRoot(0, rnp2[0], rnp3[0]);
        if (t >= 0 && t <= 1) {
            let x = computeQuadraticBaseValue(t, 0, rnp2[0], rnp3[0]);
            if (x < minx) {
                minx = x;
            }
            if (x > maxx) {
                maxx = x;
            }
        }

        let miny = Number.MAX_VALUE;
        let maxy = -Number.MAX_VALUE;
        if (0 < miny) {
            miny = 0;
        }
        if (0 > maxy) {
            maxy = 0;
        }
        if (0 < miny) {
            miny = 0;
        }
        if (0 > maxy) {
            maxy = 0;
        }
        t = computeQuadraticFirstDerivativeRoot(0, rnp2[1], 0);
        if (t >= 0 && t <= 1) {
            let y = computeQuadraticBaseValue(t, 0, rnp2[1], 0);
            if (y < miny) {
                miny = y;
            }
            if (y > maxy) {
                maxy = y;
            }
        }

        // bounding box corner coordinates
        let bb1 = { minx, miny };
        let bb2 = { minx, maxy };
        let bb3 = { maxx, maxy };
        let bb4 = { maxx, miny };

        // rotate back!
        let nbb1 = [(bb1[0] * Math.cos(angle) - bb1[1] * Math.sin(angle)),
            (bb1[0] * Math.sin(angle) + bb1[1] * Math.cos(angle)) ];
        let nbb2 = [(bb2[0] * Math.cos(angle) - bb2[1] * Math.sin(angle)),
            (bb2[0] * Math.sin(angle) + bb2[1] * Math.cos(angle))];
        let nbb3 = [(bb3[0] * Math.cos(angle) - bb3[1] * Math.sin(angle)),
            (bb3[0] * Math.sin(angle) + bb3[1] * Math.cos(angle)) ];
        let nbb4 = [(bb4[0] * Math.cos(angle) - bb4[1] * Math.sin(angle)),
            (bb4[0] * Math.sin(angle) + bb4[1] * Math.cos(angle)) ];

        // move back!
        nbb1[0] += curve[0];
        nbb1[1] += curve[1];
        nbb2[0] += curve[0];
        nbb2[1] += curve[1];
        nbb3[0] += curve[0];
        nbb3[1] += curve[1];
        nbb4[0] += curve[0];
        nbb4[1] += curve[1];

        let bbox = [nbb1[0], nbb1[1], nbb2[0], nbb2[1], nbb3[0], nbb3[1], nbb4[0], nbb4[1] ];
        return bbox;
    }

function intersectsPathSegment(path, segment) {
    let count = 0;
    for (let offset = 0; offset < path.length - 2; offset += 4) {
        let curve = [path[offset], path[offset + 1], path[offset + 2], path[offset + 3], path[offset + 4], path[offset + 5]];
        getTightBoundingRectangle(curve);
        count += intersectsCurveSegment(curve, 0, segment[0], segment[1], segment[2], segment[3]) / 3;
    }
    return count;
}

function insideClosedbspline(x, y, drawing) {
    let sp=drawing.data[0];
    let box = getBoundingHVRectangle(sp, 0, sp.length / 2);
    if (!isPointInHVRectangle(box, x, y))
        return false;
    // segment from left x of the box to x,y
    let segment = [box[0] - 1.0, y, x, y];
    // intersects segment with all path, counting the number of intersections.
    // odd => inside, even => outside
    let count = 0;
    for (let i = 0; i < sp.length; i++) {
        count += intersectsPathSegment(sp[i], segment);
    }
    return count % 2 == 1;

}

function movePoints(dx, dy, points) {
    for (let i = 0; i < points.length; i += 2) {
        points[i] += dx;
        points[i + 1] += dy;
    }
}

function move(dx, dy, drawing) {
    delete drawing.cache;
    switch (drawing.type) {
        case "closedbspline":
            for(let i=0; i<drawing.data.length; i++) {
                movePoints(dx, dy, drawing.data[i]);
            }
            break;
        case "bspline":
            movePoints(dx, dy, drawing.data);
            break;
        case "compound":
            for (let i = 0; i < drawing.data.length; i++) {
                move(dx, dy, drawing.data[i]);
            }
            break;
    }
}

function scalePoints(factor, points) {
    for (let i = 0; i < points.length; i++) {
        points[i] *= factor;
    }
}

function scale(factor, drawing) {
    delete drawing.cache;
    switch (drawing.type) {
        case "closedbspline":
            for(let i=0; i<drawing.data.length; i++) {
                scalePoints(factor, drawing.data[i]);
            }
            break;
        case "bspline":
            scalePoints(factor, drawing.data);
            break;
        case "compound":
            for (let i = 0; i < drawing.data.length; i++) {
                scale(factor, drawing.data[i]);
            }
            break;
    }
}

function angle(x1, y1, x2, y2, x3, y3) {

    let a = sqrDistance(x1, y1, x2, y2);
    let b = sqrDistance(x3, y3, x2, y2);
    let c = sqrDistance(x1, y1, x3, y3);

    let angle = (Math.acos((a + b - c) / (2 * Math.sqrt(a) * Math.sqrt(b))));

    // figure out the quadrant

    if ((x1 - x2) * (y3 - y2) - (y1 - y2) * (x3 - x2) < 0) {
        angle = (Math.PI - angle);
    }
    let sign = Math.sin(angle) > 0; // this is a very ugly fix, I cannot figure out why proper math does not work
    if ((sign & y3 < y1) || (!sign && y3 > y1))
        angle += Math.PI;

    return angle;
}

function angleAt0(dx, dy) {
    return Math.atan2(-dy, -dx) - Math.PI;
}

function rotatePoints(angle, points) {
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);
    for (let i = 0; i < points.length / 2; i++) {
        let x = points[i * 2];
        let y = points[i * 2 + 1];
        points[i * 2] = x * cos - y * sin;
        points[i * 2 + 1] = x * sin + y * cos;
    }
}

function rotate(angle, drawing) {
    delete drawing.cache;
    switch (drawing.type) {
        case "closedbspline":
            for(let i=0; i<drawing.data.length; i++) {
                rotatePoints(angle, drawing.data[i]);
            }
            break;
        case "bspline":
            rotatePoints(angle, drawing.data);
            break;
        case "compound":
            for (let i = 0; i < drawing.data.length; i++) {
                rotate(angle, drawing.data[i]);
            }
            break;
    }
}

function isPointInHVRectangle(rect, x, y, delta) {
    if (delta == undefined) delta = 0;
    let minx, miny, maxx, maxy;
    if (rect[0] < rect[2]) {
        minx = rect[0];
        maxx = rect[2];
    } else {
        minx = rect[2];
        maxx = rect[0];
    }
    if (rect[1] < rect[3]) {
        miny = rect[1];
        maxy = rect[3];
    } else {
        miny = rect[3];
        maxy = rect[1];
    }

    return (x >= minx && x <= maxx && y >= miny && y <= maxy);
}

function solveQuadratic(c, b, a, res) {
    let roots = 0;
    if (a == 0.0) {
        // The quadratic parabola has degenerated to a line.
        if (b == 0.0) {
            // The line has degenerated to a constant.
            return -1;
        }
        res[roots++] = -c / b;
    } else {
        // From Numerical Recipes, 5.6, Quadratic and Cubic Equations
        let d = b * b - 4.0 * a * c;
        if (d < 0.0) {
            // If d < 0.0, then there are no roots
            return 0;
        }
        d = Math.sqrt(d);
        // For accuracy, calculate one root using:
        // (-b +/- d) / 2a
        // and the other using:
        // 2c / (-b +/- d)
        // Choose the sign of the +/- so that b+d gets larger in magnitude
        if (b < 0.0) {
            d = -d;
        }
        let q = (b + d) / -2.0;
        // We already tested a for being 0 above
        res[roots++] = q / a;
        if (q != 0.0) {
            res[roots++] = c / q;
        }
    }
    return roots;
}

function intersectsCurveSegment(bspline, offset, x1, y1, x2, y2) {
    let rect = [x1, y1, x2, y2];
    if (rect[0] > rect[2]) {
        let temp = rect[2];
        rect[2] = rect[0];
        rect[0] = temp;
    }
    if (rect[1] > rect[3]) {
        let temp = rect[3];
        rect[3] = rect[1];
        rect[1] = temp;
    }
    let angle = angleAt0(x2 - x1, y2 - y1);
    let curve = [bspline[offset], bspline[offset + 1], bspline[offset + 2], bspline[offset + 3], bspline[offset + 4], bspline[offset + 5]];
    movePoints(-x1, -y1, curve);
    rotatePoints(-angle, curve);

    // now we can find t for which y(t)=0
    // if t is between 0.0 and 1.0 then we have a solution
    // y(t) = (1-t)*(1-t)P0+2(1-t)tP1+t*tP2

    // = P0-tP0-tP0+t�P0+2tP1-2t�P1+t�P2
    // = t�(P0-2P1+P2)+t(-2P0+2P1)+P0
    let res = [];

    let sol = solveQuadratic(curve[1], -2 * curve[1] + 2 * curve[3], (curve[1] - 2 * curve[3] + curve[5]), res);
    if (sol <= 0) {
        return [];
    }

    let ret = [];
    for (let i = 0; i < sol; i++) {
        if (res[i] >= 0.0 && res[i] <= 1.0) { // part of the bspline
            let c = getCoordsFor(bspline, offset, res[i]);
            if (isPointInHVRectangle(rect, c.x, c.y, THRESHOLDAPPROX)) {
                // also part of the segment
                ret.push(c.x);
                ret.push(c.y);
                ret.push(res[i]);
            }
        }
    }

    return ret;
}

function intersectsLineLine(l1x1, l1y1, l1x2, l1y2, l2x1, l2y1, l2x2, l2y2) {

    let denominator = 1.0 * (l1x1 - l1x2) * (l2y1 - l2y2)
        - (l1y1 - l1y2) * (l2x1 - l2x2);

    // If the ls are parallel, there is no real 'intersection',
    // and if they are colar, the intersection is an entire l,
    // rather than a point.
    if (denominator == 0) {
        return null;
    }

    let x, y;
    if (l1x1 == l1x2) {
        x = l1x1;
    } else if (l2x1 == l2x2) {
        x = l2x1;
    } else {
        x = (((1.0 * l1x1 * l1y2 - l1y1 * l1x2)
            * (l2x1 - l2x2) - (l1x1 - l1x2)
            * (l2x1 * l2y2 - l2y1 * l2x2)) / denominator);
    }

    if (l1y1 == l1y2) {
        y = l1y1;
    } else if (l2y1 == l2y2) {
        y = l2y1;
    } else {
        y = (((1.0 * l1x1 * l1y2 - l1y1 * l1x2)
            * (l2y1 - l2y2) - (l1y1 - l1y2)
            * (l2x1 * l2y2 - l2y1 * l2x2)) / denominator);
    }

    // if denominator isn't zero, there is an intersection, and it's a single point.
    return [x, y];
}

function intersectsSegmentSegment(s1x1, s1y1, s1x2, s1y2, s2x1, s2y1, s2x2, s2y2) {
    if (sqrDistance(s1x1, s1y1, s2x1, s1y1) < 0.1) return [s1x1, s1y1];
    if (sqrDistance(s1x2, s1y2, s2x2, s1y2) < 0.1) return [s1x2, s1y2];
    if (sqrDistance(s1x1, s1y1, s2x1, s2y1) < 0.1) return [s1x1, s1y1];
    if (sqrDistance(s1x2, s1y2, s2x2, s2y2) < 0.1) return [s1x2, s1y2];

    let candidate = intersectsLineLine(s1x1, s1y1, s1x2, s1y2, s2x1, s2y1, s2x2, s2y2);
    if (candidate != null && candidate.length == 2
        && isPointInHVRectangle([s1x1, s1y1, s1x2, s1y2], candidate[0], candidate[1]) && isPointInHVRectangle([s2x1, s2y1, s2x2, s2y2], candidate[0], candidate[1]))
        return candidate;
    return null;
}

function intersectsHVRectangles(r1, r2) {
    function reorder(r) {
        if (r[0] > r[2]) {
            let t = r[0];
            r[0] = r[2];
            r[2] = t;
        }
        if (r[1] > r[3]) {
            let t = r[1];
            r[1] = r[3];
            r[3] = t;
        }
    }
    r1 = [...r1];
    r2 = [...r2];
    reorder(r1);
    reorder(r2);
    // false if r1 is completely on the left of r2
    if (r1[2] < r2[0])
        return false;
    // false if r1 is completely on the right of r2
    if (r1[0] > r2[2])
        return false;
    // false if r1 is completely on top of r2
    if (r1[3] < r2[1])
        return false;
    // false if r1 is completely on bottom of r2
    if (r1[1] > r2[3])
        return false;
    return true;
}

function getBoundingHVRectangle(points, offset, len) {
    let minx = Number.MAX_VALUE;
    let miny = Number.MAX_VALUE;
    let maxx = -Number.MAX_VALUE;
    let maxy = -Number.MAX_VALUE;
    for (let i = 0; i < len / 2; i++) {
        if (points[offset + i * 2] < minx)
            minx = points[offset + i * 2];
        if (points[offset + i * 2] > maxx)
            maxx = points[offset + i * 2];
        if (points[offset + i * 2 + 1] < miny)
            miny = points[offset + i * 2 + 1];
        if (points[offset + i * 2 + 1] > maxy)
            maxy = points[offset + i * 2 + 1];
    }
    return [minx, miny, maxx, maxy];
}

function splitLeft(bspline, offset, t) {
    let p4 = [(1 - t) * bspline[0 + offset] + t * bspline[2 + offset],
    (1 - t) * bspline[1 + offset] + t * bspline[3 + offset]];
    let p5 = [(1 - t) * bspline[2 + offset] + t * bspline[4 + offset],
    (1 - t) * bspline[3 + offset] + t * bspline[5 + offset]];
    let p6 = [(1 - t) * p4[0] + t * p5[0], (1 - t) * p4[1] + t * p5[1]];

    return [bspline[0 + offset], bspline[1 + offset], p4[0], p4[1], p6[0], p6[1]];
}

function splitRight(bspline, offset, t) {
    let p4 = [(1 - t) * bspline[0 + offset] + t * bspline[2 + offset],
    (1 - t) * bspline[1 + offset] + t * bspline[3 + offset]];
    let p5 = [(1 - t) * bspline[2 + offset] + t * bspline[4 + offset],
    (1 - t) * bspline[3 + offset] + t * bspline[5 + offset]];
    let p6 = [(1 - t) * p4[0] + t * p5[0], (1 - t) * p4[1] + t * p5[1]];

    return [p6[0], p6[1], p5[0], p5[1], bspline[4 + offset], bspline[5 + offset]];
}


function splitLeftRight(bspline, offset, t) {
    let p4 = [(1 - t) * bspline[offset] + t * bspline[offset + 2],
    (1 - t) * bspline[offset + 1] + t * bspline[offset + 3]];
    let p5 = [(1 - t) * bspline[offset + 2] + t * bspline[offset + 4],
    (1 - t) * bspline[offset + 3] + t * bspline[offset + 5]];
    let p6 = [(1 - t) * p4[0] + t * p5[0], (1 - t) * p4[1] + t * p5[1]];

    return [bspline[offset], bspline[offset + 1], p4[0], p4[1],
    p6[0], p6[1], p5[0], p5[1], bspline[offset + 4],
    bspline[offset + 5]];
}

function cutBSplineSegment(x1, y1, x2, y2, bspline) {
    // for all curves in points,
    // if the curve does not intersect the line, accumulate the curve in
    // temp
    // if the curve intersects the line :
    // split the curve,
    // accumulate the left part in temp
    // add temp to return
    // clear temp and accumulate right part into it
    // add temp to return
    let ret = [];
    let current = [];
    let cut = false;
    current.push(bspline[0]);
    current.push(bspline[1]);
    for (let offset = 0; offset < bspline.length - 2; offset += 4) {
        // segment ?
        if (Math.abs((bspline[1 + offset] - bspline[3 + offset]) * (bspline[offset] - bspline[offset + 4]) - (bspline[offset + 1] - bspline[offset + 5]) * (bspline[offset] - bspline[offset + 2])) < 0.01) {
            let split = intersectsSegmentSegment(bspline[offset + 0], bspline[offset + 1], bspline[offset + 4], bspline[offset + 5], x1, y1, x2, y2);
            if (split == null) {
                for (let i = 2; i < 6; i++) {
                    current.push(bspline[offset + i]);
                }
            } else {
                cut = true;
                current.push((bspline[offset + 0] + split[0]) / 2.0);
                current.push((bspline[offset + 1] + split[1]) / 2.0);
                current.push(split[0]);
                current.push(split[1]);
                ret.push(current);
                current = [];
                current.push(split[0]);
                current.push(split[1]);
                current.push((bspline[offset + 4] + split[0]) / 2.0);
                current.push((bspline[offset + 5] + split[1]) / 2.0);
                current.push(bspline[offset + 4]);
                current.push(bspline[offset + 5]);
            }
            continue;
        }
        // quickly check if offset has a chance of intersecting the line or
        // not
        if (!intersectsHVRectangles([x1, y1, x2, y2], getBoundingHVRectangle(bspline, offset, 6))) {
            for (let i = 2; i < 6; i++) {
                current.push(bspline[offset + i]);
            }
            continue;
        } else {
            let intersects = intersectsCurveSegment(bspline, offset, x1, y1, x2, y2);
            if (intersects.length == 0) {
                // appends offset to current
                for (let i = 2; i < 6; i++) {
                    current.push(bspline[offset + i]);
                }
            } else if (intersects.length == 3) {
                cut = true;
                // one intersection
                let leftright = splitLeftRight(bspline, offset, intersects[2]);
                current.push(leftright[2]);
                current.push(leftright[3]);
                current.push(leftright[4]);
                current.push(leftright[5]);
                ret.push(current);
                current = [];
                current.push(leftright[4]);
                current.push(leftright[5]);
                current.push(leftright[6]);
                current.push(leftright[7]);
                current.push(leftright[8]);
                current.push(leftright[9]);
            } else {
                cut = true;
                // two intersections
                let leftright = splitLeft(bspline, offset, intersects[2]);
                current.push(leftright[2]);
                current.push(leftright[3]);
                current.push(leftright[4]);
                current.push(leftright[5]);
                ret.push(current);
                let right = splitLeftRight(leftright, 0,
                    (intersects[5] - intersects[2])
                    / (1.0 - intersects[2]));
                ret.push(right.slice(0, 6));
                current = [];
                current.push(right[4]);
                current.push(right[5]);
                current.push(right[6]);
                current.push(right[7]);
                current.push(right[8]);
                current.push(right[9]);
            }
        }
    }
    for (let i = bspline.length - (bspline.length - 2) % 4; i < bspline.length; i++) {
        current.push(bspline[i]);
    }
    if (current.let != 2)
        ret.push(current);
    return cut ? ret : null;
}

function intersectsBSplineSegment(x1, y1, x2, y2, bspline) {
    for (let offset = 0; offset < bspline.length - 2; offset += 4) {
        // segment ?
        if (Math.abs((bspline[1 + offset] - bspline[3 + offset]) * (bspline[offset] - bspline[offset + 4]) - (bspline[offset + 1] - bspline[offset + 5]) * (bspline[offset] - bspline[offset + 2])) < 0.01) {
            if (intersectsSegmentSegment(bspline[offset + 0], bspline[offset + 1], bspline[offset + 4], bspline[offset + 5], x1, y1, x2, y2) != null) return true;
            continue;
        }
        // quickly check if offset has a chance of intersecting the line or
        // not
        if (!intersectsHVRectangles([x1, y1, x2, y2], getBoundingHVRectangle(bspline, offset, 6))) {
            continue;
        } else {
            if (intersectsCurveSegment(bspline, offset, x1, y1, x2, y2).length > 0) return true;
        }
    }
    return false;
}

function cutBSPline(x1, y1, x2, y2, drawing) {
    let ret = cutBSplineSegment(x1, y1, x2, y2, drawing.data);
    if (ret == null) return null;
    switch (drawing.type) {
        case "closedbspline":
            for (let i = 0; i < ret.length; i++) {
                ret[i].push((ret[i][0] + ret[i][ret[i].length - 2]) / 2);
                ret[i].push((ret[i][1] + ret[i][ret[i].length - 1]) / 2);
                ret[i].push(ret[i][0]);
                ret[i].push(ret[i][1]);
                ret[i] = { type: "closedbspline", data: ret[i] };
            }
            break;
        case "bspline":
            for (let i = 0; i < ret.length; i++) {
                ret[i] = { type: "bspline", data: ret[i] };
            }
            break;
    }
    return ret;
}

function cut(x1, y1, x2, y2, drawing) {
    function sortSlice(all, x1, y1, x2, y2) {

        let above = [];
        let below = [];
        let both = [];

        for (let n = 0; n < all.length; n++) {
            let si = all[n];
            let ab = false;
            let be = false;
            function check(points) {
                for (let i = 0; i < points.length; i += 2) {
                    let x = points[i];
                    let y = points[i + 1];
                    let value = (x2 - x1) * (y - y1) - (x - x1) * (y2 - y1);
                    if (Math.abs(value) < 0.1) continue; // don't decide anything, the other points will determine the position
                    if (value < 0) {
                        if (ab) continue;
                        ab = true;
                        if (be) break;
                    } else if (value > 0) {
                        if (be) continue;
                        be = true;
                        if (ab) break;
                    } else {
                        ab = true; be = true;
                        break;
                    }
                }
            }
            check(si.data);
            if (ab && !be) {
                above.push(si);
            } else if (!ab && be) {
                below.push(si);
            } else {
                both.push(si);
            }
        }

        return { above, below, both };
    }

    let ret = [];
    let temp, isCut, groups;
    switch (drawing.type) {
        case "closedbspline":
                temp = [];
                isCut = false;
                for (let i = 0; i < drawing.data.length; i++) {
                    let o = cutBSPline(x1, y1, x2, y2, {data:drawing.data[i], type:"closedbspline"});
                    if (o !=null) {
                        for (let j=0; j<o.length; j++) {
                            temp.push(o[j]);
                        }
                        isCut = true;
                    } else {
                        temp.push({data:drawing.data[i], type:"closedbspline"});
                    }
                }
                if (!isCut) return [];
                groups = sortSlice(temp, x1, y1, x2, y2);
                function pushcb(drawings) {
                    if (drawings.length == 0) return; // empty set
                    let d=[];
                    for(let i=0; i<drawings.length; i++) {
                        d.push(drawings[i].data);
                    }
                    ret.push({ type: "closedbspline", data: d });
                }
                pushcb(groups.above);
                pushcb(groups.below);
                pushcb(groups.both);
                break;
        case "bspline":
            let o = cutBSPline(x1, y1, x2, y2, drawing);
            if (o != null) ret.push.apply(ret, o);
            break;
        case "compound":
            temp = [];
            isCut = false;
            for (let i = 0; i < drawing.data.length; i++) {
                let o = cut(x1, y1, x2, y2, drawing.data[i]);
                if (o.length > 0) {
                    temp.push.apply(temp, o);
                    isCut = true;
                } else {
                    temp.push(drawing.data[i]);
                }
            }
            if (!isCut) return [];
            groups = sortSlice(temp, x1, y1, x2, y2);
            function push(drawings) {
                if (drawings.length == 0) return; // empty set
                if (drawings.length == 1) ret.push(drawings[0]); // do not compound a single drawing
                ret.push({ type: "compound", data: drawings });
            }
            push(groups.above);
            push(groups.below);
            push(groups.both);
            break;
    }
    return ret;
}

function intersects(x1, y1, x2, y2, drawing) {
    switch (drawing.type) {
        case "bspline":
            return intersectsBSplineSegment(x1, y1, x2, y2, drawing.data);
        case "closedbspline":
            if (intersectsBSplineSegment(x1, y1, x2, y2, drawing.data)) return true;
            return insideSegmentClosedBSpline(x1, y1, x2, y2, drawing.data);
        case "compound":
            for (let i = 0; i < drawing.data.length; i++) {
                if (intersects(x1, y1, x2, y2, drawing.data[i])) return true;
            }
    }
    return false;
}

function curveFromBSpline(bspline, offset) {
    let idx = offset * 4;
    return [bspline[idx], bspline[idx + 1], bspline[idx + 2], bspline[idx + 3], bspline[idx + 4], bspline[idx + 5]];
}

function intersectsCurveCurve(curve1, curve1Offset, curve2, curve2Offset, x, y) {
    let s1 = approximateBSplineBySegments(curve1, curve1Offset, 1.0);
    let s2 = approximateBSplineBySegments(curve2, curve2Offset, 1.0);
    let tl1 = 0.0;
    let tl2 = 0.0;
    for (let i = 0; i < s1.length - 2; i += 2) {
        tl1 += distance(s1[i], s1[i + 1], s1[i + 2], s1[i + 3]);
    }
    for (let i = 0; i < s2.length - 2; i += 2) {
        tl2 += distance(s2[i], s2[i + 1], s2[i + 2], s2[i + 3]);
    }
    let l1 = 0.0;
    let cand = null;
    for (let i = 0; i < s1.length - 2; i += 2) {
        let l2 = 0.0;
        for (let j = 0; j < s2.length - 2; j += 2) {
            let inter = intersectsSegmentSegment(s1[i], s1[i + 1], s1[i + 2], s1[i + 3], s2[j], s2[j + 1], s2[j + 2], s2[j + 3]);
            if (inter != null) {
                if (cand == null || sqrDistance(inter[0], inter[1], x, y) < sqrDistance(cand[0], cand[1], x, y)) {
                    cand = [inter[0], inter[1], ((l1 + distance(inter[0], inter[1], s1[i], s1[i + 1])) / tl1), ((l2 + distance(inter[0], inter[1], s2[j], s2[j + 1])) / tl2)];
                }
            }
            l2 += distance(s2[j], s2[j + 1], s2[j + 2], s2[j + 3]);
        }
        l1 += distance(s1[i], s1[i + 1], s1[i + 2], s1[i + 3]);
    }
    return cand;
}

return {
    distance,
    sqrDistance,
    distanceWith,
    getCoordsFor,
    splitLeft,
    splitRight,
    splitLeftRight,
    segmentsToBSpline,
    bSplineToSegments,
    startBSpline,
    getClosestPointToLine,
    getClosestPointToSegment,
    getClosestPointToSegments,
    getClosestPointToBSpline,
    move,
    scale,
    angle,
    angleAt0,
    rotate,
    cut,
    curveFromBSpline,
    intersectsCurveCurve,
    intersects
}
}) ();