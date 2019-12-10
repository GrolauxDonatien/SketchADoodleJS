app = (() => {
    const canvas = document.getElementById("mycanvas");
    const context = canvas.getContext("2d");
//    const drawing = [{"type":"bspline","data":[198,802,203.07312252964428,801.9999999999999,215,802,227.84706565805118,799.0880299962079,245,799,275.3561753684402,796.3790481455987,317,783,411.2792144191626,758.8392956339726,503,717,631.7719000808652,675.0621059860835,769,651,852.161604235279,642.4482558457844,897,631,922.6915116109416,626.1300619760848,945,618,951,614.5,957,611]}];
//    const drawing=[{type:"bspline",data:[100,100,150,150,200,200,150,250,100,300]}];
//    const drawing=[{"type":"bspline","data":[100,100,150,150,200,200,150,250,100,300]},{"type":"bspline","data":[95,161,96.10843121198988,158.19727324834344,102,150,113.09212657738361,135.26014147651813,135,124,173.5090018830844,109.63286836328679,208,100,226.5930223072122,96.96828810743662,246,98]},{"type":"bspline","data":[139,187,143.0618412367782,185.66040239044878,148,182,185.40637763802636,162.22529130847118,207,134,220.53701389906814,111.3609210904433,219,87,220.3113640520554,72.69574696372649,220,64]}];
//    const drawing=[{"type":"compound","data":[{"type":"closedbspline","data":[[128.59033486671865,127.70168427537247,131.2198650351723,125.94290215591403,135,124,173.5090018830844,109.63286836328679,208,100,213.34278059430537,99.1288252550082,218.75277140600235,98.59317700298206,218.80743927550895,98.58963757235355,218.86210714501553,98.58609814172506,217.35063831396684,116.68976309684464,207,134,192.3887081615624,153.09860057843926,170.5374961762149,168.3280751081005,169.8813605716673,168.77665003761012,169.22522496711971,169.22522496711971,148.5675522537628,148.5675522537628,127.90987954040595,127.90987954040595,127.86201709341294,127.29854951634161,127.81415464641994,126.68721949227725,128.40707732320996,126.84360974613863,129,127,129.3293795828397,127.42751694339707,129.65875916567936,127.85503388679413,129.12454701619902,127.7783590810833,128.59033486671865,127.70168427537247]]},{"type":"bspline","data":[100,100,150,150,200,200,150,250,100,300],"cache":[[100,100,150,150,200,200],[200,200,193.75,206.25,187.5,212.5,181.25,218.75,175,225,168.75,231.25,162.5,237.5,156.25,243.75,150,250,143.75,256.25,137.5,262.5,131.25,268.75,125,275,118.75,281.25,112.5,287.5,106.25,293.75,100,300]]},{"type":"bspline","data":[95,161,96.10843121198988,158.19727324834344,102,150,113.09212657738361,135.26014147651813,135,124,173.5090018830844,109.63286836328679,208,100,226.5930223072122,96.96828810743662,246,98],"cache":[[95,161,95.8531617044962,159.2614774681288,97.30421560599494,156.84863662417172,99.3531617044962,153.7614774681288,102,150],[102,150,103.42876483328715,148.17111032927946,104.94202768880267,146.36940594798835,106.53978856654658,144.5948868561266,108.22204746651886,142.8475530536943,109.98880438871953,141.12740454069137,111.84005933314856,139.4344413171179,113.775812299806,137.76866338297378,115.79606328869181,136.13007073825906,117.900812299806,134.51866338297378,120.09005933314856,132.9344413171179,122.36380438871953,131.37740454069137,124.72204746651886,129.8475530536943,127.16478856654658,128.3448868561266,129.69202768880265,126.86940594798834,132.30376483328715,125.42111032927947,135,124],[135,124,139.79792990817396,122.22260176132266,144.5644691619247,120.48218995446899,149.29961776125228,118.77876457943894,154.00337570615665,117.11232563623255,158.67574299663784,115.48287312484979,163.31671963269582,113.89040704529069,167.9263056143306,112.33492739755522,172.5045009415422,110.81643418164339,177.0513056143306,109.33492739755522,181.56671963269582,107.89040704529069,186.05074299663784,106.48287312484979,190.50337570615665,105.11232563623255,194.92461776125228,103.77876457943894,199.3144691619247,102.48218995446899,203.67292990817396,101.22260176132266,208,100],[208,100,210.32730730162643,99.63690876259022,212.66097362970265,99.30556302350176,215.00099898422872,99.0059627827346,217.34738336520456,98.73810804028874,219.70012677263026,98.50199879616417,222.05922920650573,98.29763505036092,224.424690666831,98.12501680287896,226.7965111536061,97.98414405371831,229.174690666831,97.87501680287896,231.55922920650573,97.79763505036092,233.95012677263026,97.75199879616417,236.34738336520456,97.73810804028874,238.75099898422872,97.7559627827346,241.16097362970265,97.80556302350176,243.57730730162643,97.88690876259022,246,98]]},{"type":"bspline","data":[139,187,143.0618412367782,185.66040239044878,148,182,185.40637763802636,162.22529130847118,207,134,220.53701389906814,111.3609210904433,219,87,220.3113640520554,72.69574696372649,220,64],"cache":[[139,187,143.2809206183891,185.0802011952244,148,182],[148,182,152.61402862945621,179.49515132521145,157.10452010831827,176.92428247372806,161.47147443658616,174.2873934455498,165.7148916142599,171.5844842406767,169.83477164133944,168.81555485910872,173.83111451782486,165.98060530084587,177.70392024371608,163.07963556588817,181.45318881901318,160.1126456542356,185.07892024371608,157.07963556588817,188.58111451782486,153.98060530084587,191.95977164133944,150.81555485910872,195.2148916142599,147.5844842406767,198.34647443658616,144.2873934455498,201.35452010831827,140.92428247372806,204.23902862945621,137.49515132521145,207,134],[207,134,208.63324381629704,131.16338919028632,210.14872179042115,128.31332648853447,211.54643392237233,125.44981189474444,212.82638021215055,122.57284540891624,213.98856065975585,119.68242703104985,215.03297526518818,116.7785567611453,215.9596240284476,113.86123459920256,216.76850694953407,110.93046054522165,217.4596240284476,107.98623459920256,218.03297526518818,105.0285567611453,218.48856065975585,102.05742703104985,218.82638021215055,99.07284540891624,219.04643392237233,96.07481189474444,219.14872179042115,93.06332648853447,219.13324381629704,90.03838919028632,219,87],[219,87,219.15758172485025,85.2338765973117,219.3024858863871,83.51156964831517,219.43471248461063,81.83307915301042,219.55426151952076,80.19840511139743,219.66113299111754,78.60754752347623,219.75532689940098,77.0605063892468,219.83684324437104,75.55728170870913,219.9056820260277,74.09787348186325,219.96184324437104,72.68228170870913,220.00532689940098,71.3105063892468,220.03613299111754,69.98254752347623,220.05426151952076,68.69840511139743,220.05971248461063,67.45807915301042,220.0524858863871,66.26156964831517,220.03258172485025,65.1088765973117,220,64]]}]}];
    const drawing=[{"type":"compound","data":[{"type":"closedbspline","data":[[177.02229219530605,109.34429585823374,192.89638541833958,104.21823487339441,208,100,213.34278059430537,99.1288252550082,218.75277140600235,98.59317700298206,218.80743927550895,98.58963757235355,218.86210714501553,98.58609814172506,217.40371887730169,116.05398899783371,207.71609695599733,132.78320131185254,192.3691945756517,121.06374858504313,177.02229219530605,109.34429585823374]]},{"type":"bspline","data":[177.02229219530605,109.34429585823374,192.89638541833958,104.21823487339441,208,100,226.5930223072122,96.96828810743662,246,98],"cache":[[177.02229219530605,109.34429585823374,192.7037657579963,104.44519140125564,208,100],[208,100,210.32730730162643,99.63690876259022,212.66097362970265,99.30556302350176,215.00099898422872,99.0059627827346,217.34738336520456,98.73810804028874,219.70012677263026,98.50199879616417,222.05922920650573,98.29763505036092,224.424690666831,98.12501680287896,226.7965111536061,97.98414405371831,229.174690666831,97.87501680287896,231.55922920650573,97.79763505036092,233.95012677263026,97.75199879616417,236.34738336520456,97.73810804028874,238.75099898422872,97.7559627827346,241.16097362970265,97.80556302350176,243.57730730162643,97.88690876259022,246,98]]},{"type":"bspline","data":[207.71601387239275,132.78313786619088,220.49574838627055,110.70688282727043,219,87,220.3113640520554,72.69574696372649,220,64],"cache":[[207.71601387239275,132.78313786619088,209.25771708154878,130.0172363465276,210.68789308054738,127.2385955472678,212.00654186938857,124.44721546841154,213.2136634480724,121.64309610995878,214.30925781659877,118.82623747190955,215.29332497496773,115.99663955426382,216.1658649231793,113.15430235702163,216.92687766123345,110.29922588018295,217.5763631891302,107.43141012374777,218.11432150686954,104.55085508771612,218.5407526144515,101.65756077208798,218.85565651187602,98.75152717686335,219.05903319914313,95.83275430204223,219.15088267625282,92.90124214762464,219.13120494320512,89.95699071361057,219,87],[219,87,219.15758172485025,85.2338765973117,219.3024858863871,83.51156964831517,219.43471248461063,81.83307915301042,219.55426151952076,80.19840511139743,219.66113299111754,78.60754752347623,219.75532689940098,77.0605063892468,219.83684324437104,75.55728170870913,219.9056820260277,74.09787348186325,219.96184324437104,72.68228170870913,220.00532689940098,71.3105063892468,220.03613299111754,69.98254752347623,220.05426151952076,68.69840511139743,220.05971248461063,67.45807915301042,220.0524858863871,66.26156964831517,220.03258172485025,65.1088765973117,220,64]]}]}];
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
    document.getElementById("cut").dispatchEvent(new Event("click"));
    return { drawing };

})();

//plotQuadBezierSeg(187.02229219530602,172.34429585823375,202.8963854183396,167.2182348733944,218,163);   