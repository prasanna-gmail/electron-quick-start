//common
let fillStyle = "#ffffff";
let strokeStyle = "#000";
let lineWidth = 5;
let lastX = 0;
let lastY = 0;
let debuggerTF = document.getElementById("sectiondebug");


// CANVAS BOARD
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
ctx.fillStyle = fillStyle;
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.strokeStyle = strokeStyle;
ctx.lineWidth = lineWidth;
let isCanvasDrawing = false;

canvas.addEventListener('mousedown', startCanvasDrawing);
canvas.addEventListener('mousemove', continueCanvasDrawing);
canvas.addEventListener('mouseup', stopCanvasDrawing);
canvas.addEventListener('mouseout', stopCanvasDrawing);

function startCanvasDrawing(e) {
    //clearCanvas();
    isCanvasDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function continueCanvasDrawing(e) {
    if (!isCanvasDrawing) return;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function stopCanvasDrawing() {
    isCanvasDrawing = false;
}
function clearCanvas() {
    console.log('clearing canvas');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
// END of CANVAS drawing ------------------------------




// SVG BOARD ----------------------------------------------------------------
const svg = document.getElementById('mySVG');
let isSVGDrawing = false;
let currentPath = null;

svg.addEventListener('mousedown', startSVGDrawing);
svg.addEventListener('mousemove', continueSVGDrawing);
svg.addEventListener('mouseup', stopSVGDrawing);
svg.addEventListener('mouseleave', stopSVGDrawing);

function startSVGDrawing(event) {
    //clearSVG();
    isSVGDrawing = true;
    const { clientX, clientY } = getMousePosition(event);
    currentPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    currentPath.setAttribute('stroke', strokeStyle);
    currentPath.setAttribute('fill', 'none');
    currentPath.setAttribute('stroke-width', lineWidth);
    currentPath.setAttribute('d', `M ${clientX},${clientY}`);
    svg.appendChild(currentPath);
}

function continueSVGDrawing(event) {
    if (isSVGDrawing) {
        const { clientX, clientY } = getMousePosition(event);
        const d = currentPath.getAttribute('d') + ` L ${clientX},${clientY}`;
        currentPath.setAttribute('d', d);
    }
}

function getMousePosition(event) {
    const CTM = svg.getScreenCTM();
    return {
        clientX: (event.clientX - CTM.e) / CTM.a,
        clientY: (event.clientY - CTM.f) / CTM.d
    };
}

function stopSVGDrawing() {
    isSVGDrawing = false;
}

function clearSVG() {
    if (currentPath != null) {
        currentPath.remove();
    }
}
// END of SVG drawing ------------------------------



// submit shapes
function submit_canvas_shape() {
    const canvasElement = document.getElementById("myCanvas");
    const finalBase64 = canvasElement.toDataURL();
    const finalBase64_r = finalBase64.replace('data:image/png;base64,', '');

    predict('source: CANVAS->', finalBase64_r);
}

function submit_svg_shape() {
    const svgElement = document.getElementById('mySVG');
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const decoded = unescape(encodeURIComponent(svgString));
    const base64 = btoa(decoded);
    const finalBase64 = `data:image/svg+xml;base64,${base64}`;
    const finalBase64_r = finalBase64.replace('data:image/svg+xml;base64,', '');
    predict('source: SVG->', finalBase64_r);
}

//submit shape converted to canvas from svg
function submit_svg_to_Canvas_shape() {
    const svgElement = document.getElementById('mySVG');
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const blb = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blb);
    const image = new Image();
    image.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(image, 0, 0);

        const finalBase64 = canvas.toDataURL();
        const finalBase64_r = finalBase64.replace('data:image/png;base64,', '');

        predict('source: SVG->', finalBase64_r);
        URL.revokeObjectURL(url);
    };
    image.src = url;
}

// predict
function predict(source, bs64Data) {
    console.log("pkp clicker1: ~ predict ~ source:", source)

    myLog(source + ' predict ->' + bs64Data);
    //'http://13.200.71.35:5000/check_shape' orginal
    fetch('http://localhost:3003/check_Shape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', },
        body: 'ShapeData=' + encodeURIComponent(bs64Data),
    })
        .then(response => response.json())
        .then(data => {
            //alert('Predicted Text: ' + data.result);
            myLog("Predicted then:: ", source + 'Predicted Text: ' + data.result);
        })
        .catch(error => {
            console.error('Error:', error);
            myLog("Predicted then:: ", source + 'Predicted Text: ' + error);
        });
}
/**
 * 
 * @param {*} callee is the instace or invoker name in string
 * @param {*} str is the error value in string
 */
function myLog(callee, str) {
    debuggerTF.innerText += str + '\n';
    str += str + '\n';

    //debuggerTF.

    console.log(callee, " :: ", str)

    let interval = window.setInterval(() => {
        debuggerTF.scrollTop = debuggerTF.scrollHeight;
        clearInterval(interval);
    }, 100)

}