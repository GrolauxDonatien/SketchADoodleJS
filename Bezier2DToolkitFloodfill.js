let setPixel = function () { };
let setPixelAA = function (x, y) { setPixel(x, y); };

(function () {

    const fillColor = 16777215;
    const FILL_COLOR = 0xFFFFFF;
    const BORDER_COLOR = 0xFFFFFE;
    const MID_COLOR = 0xFFFFFF / 2;

    function floodfillArray(x, y, pixels, width, height) {
        let borders = [];
        let ranges = [];
        let lFillLoc = x; // the location to check/fill on the left
        let pxIdx = (width * y) + x;

        while (true) {
            // **fill with the color
            let idx = pxIdx * 4;
            pixels[idx] = fillColor;

            // **indicate that this pixel has already been checked and filled
            pixelsChecked[pxIdx] = true;

            // **de-increment
            lFillLoc--; // de-increment counter
            pxIdx--; // de-increment pixel index

            // **exit loop if we're at edge of bitmap or color area
            if (lFillLoc < 0) throw new FloodFill.BorderReachedException();
            if (pixelsChecked[pxIdx]) break;
            if ((pixels[pxIdx] & 0xFFFFFF) != startColor) {
                borders.add(lFillLoc);
                borders.add(y);
                break;
            }
        }

        lFillLoc++;

        // ***Find Right Edge of Color Area
        let rFillLoc = x; // the location to check/fill on the left

        pxIdx = (width * y) + x;

        while (true) {
            // **fill with the color
            pixels[pxIdx] = fillColor;

            // **indicate that this pixel has already been checked and filled
            pixelsChecked[pxIdx] = true;

            // **increment
            rFillLoc++; // increment counter
            pxIdx++; // increment pixel index

            // **exit loop if we're at edge of bitmap or color area
            if (rFillLoc >= width) throw new FloodFill.BorderReachedException();
            if (pixelsChecked[pxIdx]) break;
            if ((pixels[pxIdx] & 0xFFFFFF) != startColor) {
                borders.add(rFillLoc);
                borders.add(y);
                break;
            }
        }

        rFillLoc--;

        // add range to queue
        ranges.push({ startX: lFillLoc, endX: rFillLoc, Y: y });

        return borders;
    }

    function drawRepository(x, y, repository, width, height) {
        let map = [];
        // keep only bsplines points, respecting the order in repository
        for (let i = 0; i < repository.length; i++) {
            if (repository[i] === undefined) debugger;
            switch (repository[i].type) {
                case "closedbspline":
                case "bspline":
                    map.push(repository[i].data);
                    break;
                case "compound":
                    for (let j = 0; j < repository[i].data.length; j++) {
                        map.push(repository[i].data[j].data);
                    }
            }
        }
        pixels = [];
        for (let bs = 0; bs < map.length; bs++) {
            setPixel = function (x, y) {
                pixels[y * width + x] = bs + 1;
            }
            let bspline = map[bs];
            for (let j = 0; j < bspline.length - 4; j += 4) {
                plotQuadBezier(bspline[j], bspline[j + 1], bspline[j + 2], bspline[j + 3], bspline[j + 4], bspline[j + 5]);
            }
        }
        return pixels;
    }

    function linearFill(x, y, pixels, pixelsChecked, ranges, borders, width, height) {
        // ***Find Left Edge of Color Area
        let lFillLoc = x; // the location to check/fill on the left
        let pxIdx = (width * y) + x;

        while (true) {
            // **fill with the color
            pixels[pxIdx] = fillColor;

            // **indicate that this pixel has already been checked and filled
            pixelsChecked[pxIdx] = true;

            // **de-increment
            lFillLoc--; // de-increment counter
            pxIdx--; // de-increment pixel index

            // **exit loop if we're at edge of bitmap or color area
            if (lFillLoc < 0) throw new Error("FloodFill.BorderReachedException");
            if (pixelsChecked[pxIdx]) break;
            if (pixels[pxIdx] != undefined) {
                borders.push(lFillLoc);
                borders.push(y);
                break;
            }
        }

        lFillLoc++;

        // ***Find Right Edge of Color Area
        let rFillLoc = x; // the location to check/fill on the left

        pxIdx = (width * y) + x;

        while (true) {
            // **fill with the color
            pixels[pxIdx] = fillColor;

            // **indicate that this pixel has already been checked and filled
            pixelsChecked[pxIdx] = true;

            // **increment
            rFillLoc++; // increment counter
            pxIdx++; // increment pixel index

            // **exit loop if we're at edge of bitmap or color area
            if (rFillLoc >= width) throw new Error("FloodFill.BorderReachedException");
            if (pixelsChecked[pxIdx]) break;
            if (pixels[pxIdx] != undefined) {
                borders.push(rFillLoc);
                borders.push(y);
                break;
            }
        }

        rFillLoc--;

        // add range to queue
        ranges.push({ startX: lFillLoc, endX: rFillLoc, Y: y });
    }

    function floodfill(x, y, pixels, width, height) {
        let pixelsChecked = [];
        let ranges = [];
        let borders = [];

        linearFill(x, y, pixels, pixelsChecked, ranges, borders, width, height);

        while (ranges.length > 0) {
            // **Get Next Range Off the Queue
            let range = ranges.pop();

            // **Check Above and Below Each Pixel in the Floodfill Range
            let downPxIdx = (width * (range.Y + 1)) + range.startX;
            let upPxIdx = (width * (range.Y - 1)) + range.startX;
            let upY = range.Y - 1;// so we can pass the y coord by ref
            let downY = range.Y + 1;

            for (let i = range.startX; i <= range.endX; i++) {
                // *Start Fill Upwards
                // if we're not above the top of the bitmap and the pixel above
                // this one is within the color tolerance

                if (upY < 0) throw new Error("FloodFill.BorderReachedException");
                if (downY >= height) throw new Error("FloodFill.BorderReachedException");

                if (!pixelsChecked[upPxIdx]) {
                    if (pixels[upPxIdx] === undefined) {
                        linearFill(i, upY, pixels, pixelsChecked, ranges, borders, width, height);
                    } else {
                        borders.push(i);
                        borders.push(upY);
                    }
                }


                // *Start Fill Downwards
                // if we're not below the bottom of the bitmap and the pixel
                // below this one is within the color tolerance

                if (!pixelsChecked[downPxIdx]) {
                    if (pixels[downPxIdx] === undefined) {
                        linearFill(i, downY, pixels, pixelsChecked, ranges, borders, width, height);
                    } else {
                        borders.push(i);
                        borders.push(downY);
                    }
                }

                downPxIdx++;
                upPxIdx++;
            }
        }

        return borders;
    }

    function getPointsOnEdgeOfFloodFill(borders, pixels, width, height) {

        let delta = 0;
        let minx = Number.MAX_VALUE; // find absolute leftmost point
        let miny = Number.MAX_VALUE; // find topmost point for all leftmost points
        let len = borders.length / 2;
        for (let i = 0; i < len; i++) {
            if (borders[i * 2] < minx) {
                minx = borders[i * 2];
                delta = i * 2;
            } else if (borders[i * 2] == minx
                && borders[i * 2 + 1] < miny) {
                miny = borders[i * 2 + 1];
                delta = i * 2;
            }
        }
        let length = borders.length;
        let curves = []; // flag curves & pixels that needs tracking
        for (let i = 0; i < len; i++) {
            let ptx = borders[(i * 2 + delta) % length];
            let pty = borders[(i * 2 + 1 + delta) % length];
            let c = pixels[ptx + pty * width];
            if (c > 0) {
                curves[c - 1] = true;
                pixels[ptx + pty * width] = -c; // negative value means pixel is part of a border but not yet part of a track
            }
        }

        let tracks = [];

        let color = 0;
        for (let i = 0; i < len; i++) {
            let ptx = borders[(i * 2 + delta) % length];
            let pty = borders[(i * 2 + 1 + delta) % length];
            color = pixels[ptx + pty * width];
            if (color < 0) { // follow the border not yet part of a track
                tracks.push(trackLine(pixels, ptx, pty, -color, width));
            }
        }

        // merge tracks
        let i = 0;
        whileloop: while (i < tracks.length) {
            let track1 = tracks[i];
            for (let j = i + 1; j < tracks.length; j++) {
                let track2 = tracks[j];
                let merged = attemptMergingNeighbooringTracks(track1, track2);
                if (merged != null) {
                    tracks[i] = merged;
                    tracks.splice(j, 1);
                    continue whileloop;
                }
            }
            i++;
        }

        return { tracks, curves };
    }

    function attemptMergingNeighbooringTracks(track1, track2) {
        let x = track1[track1.length - 3];
        let y = track1[track1.length - 2];
        let c = track1[track1.length - 1];
        if (Math.abs(track2[0] - x) <= 2 && Math.abs(track2[1] - y) <= 2 && c == track2[2]) {
            let ret = [];
            ret.push.apply(ret, track1);
            ret.push.apply(ret, track2);
            return ret;
        }
        return null;
    }

    function trackLine(pixels, x, y, color, width) {
        pixels[x + y * width] = Math.abs(pixels[x + y * width]); // this border is now part of a track
        let icoords = [];
        // from point, track the line in one direction
        subTrackLine(pixels, x, y, icoords, width);
        let coords = [];
        let len = icoords.length / 3;
        for (let i = len - 1; i >= 0; i--) {
            coords.push(icoords[i * 3]);
            coords.push(icoords[i * 3 + 1]);
            coords.push(icoords[i * 3 + 2]);
        }
        coords.push(x);
        coords.push(y);
        coords.push(color);
        // and then track in the other direction
        subTrackLine(pixels, x, y, coords, width);
        let p1x = 0;
        let p1y = 0;
        let p2x = 0;
        let p2y = 0;
        let subs = [];
        len = coords.length / 3;
        for (let i = 0; i < len; i++) {
            let ptx = coords[i * 3];
            let pty = coords[i * 3 + 1];
            if (i >= 2 && isCorner(p2x, p2y, p1x, p1y, ptx, pty)) {
                subs.push(i - 1);
            }
            p2x = p1x;
            p2y = p1y;
            p1x = ptx;
            p1y = pty;
        }
        let points = [];
        let icount = 0;
        let csub = -1;
        if (subs.length > 0) {
            csub = subs.splice(0, 1);
        }
        for (let count = 0; count < len; count++) {
            if (count != csub) {
                points[icount * 3] = coords[count * 3];
                points[icount * 3 + 1] = coords[count * 3 + 1];
                points[icount * 3 + 2] = coords[count * 3 + 2];
                icount++;
            } else {
                if (subs.length > 0) {
                    csub = subs.splice(0, 1);
                } else {
                    csub = -1;
                }
            }
        }
        return points;

    }

    function subTrackLine(pixels, x, y, coords, width) {
        loop: while (true) {
            for (let i = 0; i < checkPixels.length / 2; i++) {
                let color = pixels[(x + checkPixels[i * 2]) + (y + checkPixels[i * 2 + 1]) * width];
                if (color && color < 0) { // a border not yet part of a track
                    x += checkPixels[i * 2];
                    y += checkPixels[i * 2 + 1];
                    pixels[x + y * width] = -color;
                    coords.push(x);
                    coords.push(y);
                    coords.push(-color);
                    continue loop;
                }
            }
            return;
        }
    }

    function d1(x1, x2) {
        return x1 == x2 + 1 || x1 == x2 - 1;
    }

    function isCorner(x1, y1, x2, y2, x3, y3) {
        return d1(x1, x3) && d1(y1, y3); // if everything else if right, this is enough
    }

    const checkPixels = [1, 0, -1, 0, 0, 1, 0, -1, 1, 1,
        1, -1, -1, -1, -1, 1];

    function process(x, y, repository, width, height) {
        let pixels = drawRepository(x, y, repository, width, height);
        try {
            let borders = floodfill(x, y, pixels, width, height);
            let tracks = getPointsOnEdgeOfFloodFill(borders, pixels, width, height);
            return {
                pixels,
                tracks: tracks.tracks,
                curves: tracks.curves,
                borders,
                wholeBackground: false
            };
        } catch (e) {
            if (e instanceof Error && e.message == "FloodFill.BorderReachedException") {
                return {
                    pixels,
                    wholeBackground: true
                }
            } else {
                throw e; // rethrows so somebody else can catch the exception
            }
        }
    }

    toolkit.floodfill = process;

})();