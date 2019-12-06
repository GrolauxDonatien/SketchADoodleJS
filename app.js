app = (() => {
    const canvas = document.getElementById("mycanvas");
    const context = canvas.getContext("2d");
//    const drawing = [{"type":"bspline","data":[198,802,203.07312252964428,801.9999999999999,215,802,227.84706565805118,799.0880299962079,245,799,275.3561753684402,796.3790481455987,317,783,411.2792144191626,758.8392956339726,503,717,631.7719000808652,675.0621059860835,769,651,852.161604235279,642.4482558457844,897,631,922.6915116109416,626.1300619760848,945,618,951,614.5,957,611]}];
//    const drawing=[{type:"bspline",data:[100,100,150,150,200,200,150,250,100,300]}];
    const drawing=[{"type":"bspline","data":[100,100,150,150,200,200,150,250,100,300]},{"type":"bspline","data":[95,161,96.10843121198988,158.19727324834344,102,150,113.09212657738361,135.26014147651813,135,124,173.5090018830844,109.63286836328679,208,100,226.5930223072122,96.96828810743662,246,98]},{"type":"bspline","data":[139,187,143.0618412367782,185.66040239044878,148,182,185.40637763802636,162.22529130847118,207,134,220.53701389906814,111.3609210904433,219,87,220.3113640520554,72.69574696372649,220,64]}];
    let struct;
    let noTool = {
        mousedown() { },
        mouseup() { },
        mousemove() { },
        draw() { },
        select() { },
        deselect() { }
    }
    let tool = noTool;

    document.getElementById("clear").addEventListener("click", () => {
        drawing.splice(0);
        repaint();
    });

    const resize = () => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        repaint();
    }

    window.addEventListener("resize", resize, false);
    resize();

    canvas.addEventListener("mousedown", (event) => {
        tool.mousedown(event);
    });

    canvas.addEventListener("mousemove", (event) => {
        tool.mousemove(event);
    });

    canvas.addEventListener("mouseup", (event) => {
        tool.mouseup(event);
    });

    function repaint() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        for (let i = 0; i < drawing.length; i++) {
            draw(drawing[i]);
        }
        tool.draw(context);
    }

    function draw(element) {
        switch (element.type) {
            case "bspline":
                drawBSpline(element.data)
                break;
            case "compound":
                for (let i = 0; i < element.data.length; i++) {
                    draw(element.data[i]);
                }
                break;
            case "closedbspline":
                drawClosedBSpline(element.data)
                break;
        }
    }

    function drawBSpline(bspline) {
        if (bspline != null && bspline.length > 0) {
            context.moveTo(bspline[0], bspline[1]);
            for (let i = 2; i < bspline.length; i += 4) {
                context.quadraticCurveTo(bspline[i], bspline[i + 1], bspline[i + 2], bspline[i + 3]);
            }
            context.stroke();
        }
    }

    function drawClosedBSpline(cbspline) {
        if (cbspline != null && cbspline.length > 0) {
            context.beginPath();
            for(let b=0; b<cbspline.length; b++) {
                let bspline=cbspline[b];
                context.moveTo(bspline[0], bspline[1]);
                for (let i = 2; i < bspline.length; i += 4) {
                    context.quadraticCurveTo(bspline[i], bspline[i + 1], bspline[i + 2], bspline[i + 3]);
                }
            }
            context.closePath();
            context.stroke();
            context.fillStyle = "gray";
            context.fill();
        }
    }

    function drawSegments(segments) {
        if (segments != null && segments.length > 0) {
            context.moveTo(segments[0], segments[1]);
            for (let i = 2; i < segments.length; i += 2) {
                context.lineTo(segments[i], segments[i + 1]);
            }
            context.stroke();
        }
    }

    function drawSquare(x, y, width) {
        context.beginPath();
        context.moveTo(x - width, y - width);
        context.lineTo(x + width, y - width);
        context.lineTo(x + width, y + width);
        context.lineTo(x - width, y + width);
        context.lineTo(x - width, y - width);
        context.closePath();
        context.stroke();
        context.fillStyle = "gray";
        context.fill();
    }

    document.getElementById("lines").addEventListener("click", () => {
        tool.deselect();
        tool = {
            mousedown(event) {
                struct = toolkit.startBSpline(event.offsetX, event.offsetY);
            },
            mousemove(event) {
                if (struct == null) return;
                struct.feedPoint(event.offsetX, event.offsetY);
                repaint();
            },
            mouseup() {
                if (struct == null) return;
                drawing.push(struct.finish());
                struct = null;
                repaint();
            },
            draw() {
                if (struct != null) {
                    drawBSpline(struct.getBSpline());
                    drawSegments(struct.getSegments());
                }
            },
            deselect() {
                document.getElementById("lines").removeAttribute("class");
            },
        }
        struct = null;
        document.getElementById("lines").setAttribute("class", "selected");
    });

    document.getElementById("delete").addEventListener("click", () => {
        function erase(x,y){
            for (let i = drawing.length - 1; i >= 0; i--) {
                let distance = toolkit.distanceWith(event.offsetX, event.offsetY, drawing[i]);
                if (distance < 2) {
                    drawing.splice(i,1);
                    repaint();
                    return;
                }
            }
        }
        let mode=false;
        tool.deselect();
        tool = {
            mousedown(event) {
                erase(event.offsetX, event.offsetY);
                mode=true;
                repaint();
            },
            mousemove(event) {
                if (!mode) return;
                erase(event.offsetX, event.offsetY);
                repaint();
            },
            mouseup() {
                mode=false;
            },
            draw() {},
            deselect() {
                document.getElementById("delete").removeAttribute("class");
            },
        }
        struct = null;
        document.getElementById("delete").setAttribute("class", "selected");
    });

    document.getElementById("move").addEventListener("click", () => {
        tool.deselect();
        let x, y;
        tool = {
            mousedown(event) {
                for (let i = drawing.length - 1; i >= 0; i--) {
                    let distance = toolkit.distanceWith(event.offsetX, event.offsetY, drawing[i]);
                    if (distance < 2) {
                        struct = drawing[i];
                        x = event.offsetX;
                        y = event.offsetY;
                        return;
                    }
                }
            },
            mousemove(event) {
                if (struct == null) return;
                toolkit.move(event.offsetX - x, event.offsetY - y, struct);
                x = event.offsetX;
                y = event.offsetY;
                repaint();
            },
            mouseup() {
                struct = null;
            },
            draw() {
            },
            deselect() {
                document.getElementById("move").removeAttribute("class");
            },
        }
        struct = null;
        document.getElementById("move").setAttribute("class", "selected");
    });

    document.getElementById("rotate").addEventListener("click", () => {
        tool.deselect();
        let x1, y1, x2, y2, ox, oy, rx1, ry1, rx2, ry2;
        let mode;
        tool = {
            mousedown(event) {
                switch (mode) {
                    case "NONE":
                        for (let i = drawing.length - 1; i >= 0; i--) {
                            let distance = toolkit.distanceWith(event.offsetX, event.offsetY, drawing[i]);
                            if (distance < 2) {
                                struct = drawing[i];
                                x1 = event.offsetX;
                                y1 = event.offsetY;
                                mode = "ONE";
                                repaint();
                                return;
                            }
                        }
                        break;
                    case "ONE":
                        x2 = event.offsetX;
                        y2 = event.offsetY;
                    case "TWO":
                        rx1 = x1; // save reference point
                        ry1 = y1;
                        rx2 = x2;
                        ry2 = y2;
                        struct.copy = JSON.parse(JSON.stringify(struct.data)); // use a reference copy to avoid drift
                        ox = event.offsetX;
                        oy = event.offsetY;
                        if (Math.abs(toolkit.distance(x1, y1, event.offsetX, event.offsetY)) < 2) {
                            mode = "DRAGONE";
                        } else if (Math.abs(toolkit.distance(x2, y2, event.offsetX, event.offsetY)) < 2) {
                            mode = "DRAGTWO";
                        }
                        break;
                }
            },
            mousemove(event) {
                switch (mode) {
                    case "DRAGONE":
                        x1 += event.offsetX - ox;
                        y1 += event.offsetY - oy;
                        ox = event.offsetX;
                        oy = event.offsetY;
                        break;
                    case "DRAGTWO":
                        x2 += event.offsetX - ox;
                        y2 += event.offsetY - oy;
                        ox = event.offsetX;
                        oy = event.offsetY;
                        break;
                }
                switch (mode) {
                    case "DRAGONE":
                    case "DRAGTWO":
                        struct.data = JSON.parse(JSON.stringify(struct.copy));
                        let distsel = toolkit.distance(rx1, ry1, rx2, ry2);
                        let disttmp = toolkit.distance(x1, y1, x2, y2);
                        toolkit.move(-rx1, -ry1, struct);
                        toolkit.scale(disttmp / distsel, struct);
                        let angleself = toolkit.angle(rx2, ry2, rx1, ry1, rx2, ry1);
                        let angletmp = toolkit.angle(x2, y2, x1, y1, x2, y1);
                        toolkit.rotate(angleself - angletmp, struct);
                        toolkit.move(x1, y1, struct);
                        repaint();
                        break;
                }
            },
            mouseup() {
                switch (mode) {
                    case "DRAGONE":
                    case "DRAGTWO":
                        mode = "TWO";
                        delete struct.copy;
                }
            },
            draw() {
                switch (mode) {
                    case "NONE":
                        break;
                    case "ONE":
                        drawSquare(x1, y1, 2);
                        break;
                    default:
                        drawSquare(x1, y1, 2);
                        drawSquare(x2, y2, 2);
                        break;
                }
            },
            deselect() {
                document.getElementById("rotate").removeAttribute("class");
                mode="NONE";
                repaint();
            },
        }
        struct = null;
        mode = "NONE";
        document.getElementById("rotate").setAttribute("class", "selected");
        repaint();
    });


    document.getElementById("cut").addEventListener("click", () => {
        tool.deselect();
        let x1, y1, x2, y2;
        let mode=false;
        tool = {
            mousedown(event) {
                x1=event.offsetX;
                y1=event.offsetY;
                x2=x1;
                y2=y1;
                mode=true;
            },
            mousemove(event) {
                if (mode) {
                    x2=event.offsetX;
                    y2=event.offsetY;
                    repaint();    
                }
            },
            mouseup() {
                if (mode) {
                    mode=false;
                    let i=0;
                    while(i<drawing.length) {
                        let results=toolkit.cut(x1,y1,x2,y2,drawing[i]);
                        if (results && results.length>0) {
                            drawing.splice(i,1);
                            for(let j=0; j<results.length; j++) {
                                drawing.splice(i+j,0,results[j]);
                            }
                            i+=results.length;
                        } else {
                            i++;
                        }
                    }
                    repaint();    
                }
            },
            draw(context) {
                if (mode) {
                    context.beginPath();
                    context.moveTo(x1,y1);
                    context.lineTo(x2,y2);
                    context.closePath();
                    context.stroke();
                }
            },
            deselect() {
                document.getElementById("cut").removeAttribute("class");
            },
        }
        struct = null;
        document.getElementById("cut").setAttribute("class", "selected");
    });

    document.getElementById("glue").addEventListener("click", () => {
        tool.deselect();
        let x1, y1, x2, y2;
        let mode=false;
        tool = {
            mousedown(event) {
                x1=event.offsetX;
                y1=event.offsetY;
                x2=x1;
                y2=y1;
                mode=true;
            },
            mousemove(event) {
                if (mode) {
                    x2=event.offsetX;
                    y2=event.offsetY;
                    repaint();    
                }
            },
            mouseup() {
                if (mode) {
                    mode=false;
                    let i=0;
                    let compound=[];
                    let lastidx=-1;
                    while(i<drawing.length) {
                        if (toolkit.intersects(x1,y1,x2,y2,drawing[i])) {
                            lastidx=i;
                            if (drawing[i].type=="compound") {
                                compound.push.apply(compound,drawing[i].data);
                            } else {
                                compound.push(drawing[i]);
                            }
                            drawing.splice(i,1);
                        } else {
                            i++;
                        }
                    }
                    if (compound.length==1) {// only one drawing glued to itself => keep as is at the right index
                        drawing.splice(lastidx,0,compound[0]); 
                    } else if (compound.length>1) {
                        drawing.splice(lastidx,0,{type:"compound",data:compound});
                    }
                    repaint();    
                }
            },
            draw(context) {
                if (mode) {
                    context.beginPath();
                    context.moveTo(x1,y1);
                    context.lineTo(x2,y2);
                    context.closePath();
                    context.stroke();
                }
            },
            deselect() {
                document.getElementById("glue").removeAttribute("class");
            },
        }
        struct = null;
        document.getElementById("glue").setAttribute("class", "selected");
    });

    
    document.getElementById("fill").addEventListener("click", () => {
        tool.deselect();
        struct=null;
        tool = {
            mousedown(event) {
                let result=toolkit.bucket(event.offsetX,event.offsetY,drawing,canvas.width,canvas.height);
                if (result.wholeBackground) {
                    console.log("Color background");
                } else if (result.closure.length>0) {
                    console.info(result);
                    // create a composite
                    // remove all curves from result.curves from repository and add them to composite
                    // also add result.floodfill at the end of composite
                    // and finally add composite to repository
                    let c=0;
                    let t=drawing.length;
                    let composite={type:"compound", data:[]};
                    composite.data.push({type:"closedbspline", data:result.closure});
                    for(let i=0; i<result.curves.length; i++) {
                        if (result.curves[i]) {
                            composite.data.push(drawing.splice(c,1)[0]);
                            t=c;
                        } else {
                            c++;
                        }
                    }
                    drawing.splice(t,0,composite);
                    repaint();
                } else {
                    console.log("Nothing to do");
                }
/*                if (struct!=null) {
                    struct.remove();
                }
                struct = document.createElement('canvas');
                struct.width  = canvas.width;
                struct.height = canvas.height;
                struct.style="position:fixed; z-index=10000; top:0px; left:0px;";
                canvas.parentNode.insertBefore(struct,canvas);
                let context=struct.getContext("2d");
                let opx=null;
                for(let x=0; x<canvas.width; x++) {
                    for(let y=0; y<canvas.height; y++) {
                        let px=result.pixels[y*canvas.width+x];
                        if (px && px!=0) {
                            if (opx!=px) {
                                opx=px;
                                let hex="00000"+px.toString(16);
                                hex=hex.substring(hex.length-6);
                                context.fillStyle="#"+hex;    
                            }
                            context.fillRect(x,y,1,1);
                        }
                    }
                }
                console.info(result);
                struct.addEventListener("click", function() {
                    struct.remove();
                    struct=null;
                });*/
            },
            mousemove(event) {
            },
            mouseup() {
            },
            draw() {},
            deselect() {
                if (struct!=null) {
                    struct.remove();
                }
                document.getElementById("fill").removeAttribute("class");
            },
        }
        document.getElementById("fill").setAttribute("class", "selected");
    });

    repaint();
    document.getElementById("fill").dispatchEvent(new Event("click"));
    return { drawing };

})();