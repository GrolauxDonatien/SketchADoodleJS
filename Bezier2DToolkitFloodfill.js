let setPixel = function () { };
let setPixelAA = function(x,y) {setPixel(x,y);};

(function () {

    function floodfillArray(x, y, array, width, height) {
        /*        let borders=[];
                let ranges=[];
                let lFillLoc = x; // the location to check/fill on the left
                let pxIdx = (width * y) + x;
        
                while (true) {
                    // **fill with the color
                    let idx=pxIdx*4;
                    pixels[idx] = fillColor;
        
                    // **indicate that this pixel has already been checked and filled
                    pixelsChecked[pxIdx] = true;
        
                    // **de-increment
                    lFillLoc--; // de-increment counter
                    pxIdx--; // de-increment pixel index
        
                    // **exit loop if we're at edge of bitmap or color area
                    if (lFillLoc<0) throw new FloodFill.BorderReachedException();
                    if (pixelsChecked[pxIdx]) break;
                    if ((pixels[pxIdx]& 0xFFFFFF)!=startColor) {
                        borders.add(lFillLoc);
                        borders.add(y);
                        break;
                    }
                }
        
                lFillLoc++;
        
                // ***Find Right Edge of Color Area
                int rFillLoc = x; // the location to check/fill on the left
        
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
                    if (rFillLoc>=width) throw new FloodFill.BorderReachedException();
                    if (pixelsChecked[pxIdx]) break;
                    if ((pixels[pxIdx]& 0xFFFFFF)!=startColor) {
                        borders.add(rFillLoc);
                        borders.add(y);
                        break;
                    }
                }
        
                rFillLoc--;
        
                // add range to queue
                FloodFillRange r = new FloodFillRange(lFillLoc, rFillLoc, y);
        
                ranges.offer(r);
        
                return borders;*/
    }

    function floodfill(x, y, repository, width, height) {
        let map = [];
        // keep only bsplines points, respecting the order in repository
        for (let i = 0; i < repository.length; i++) {
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
            for (let j = 0; j < bspline.length-4; j += 4) {
                plotQuadBezier(bspline[j], bspline[j + 1], bspline[j + 2], bspline[j + 3], bspline[j + 4], bspline[j + 5]);
            }
        }
        let borders=floodfillArray(x, y, pixels, width, height);
        return { pixels, borders };
    }

    toolkit.floodfill = floodfill;

})();