const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const lineWidth = document.getElementById('lineWidth');
const brushSize = document.getElementById('brushSize');
const clearCanvasButton = document.getElementById('clearCanvas');
const undoButton = document.getElementById('undo');
const redoButton = document.getElementById('redo');
const exportSvgButton = document.getElementById('exportSvg');
const exportPngButton = document.getElementById('exportPng');
const markers = document.querySelectorAll('.marker');

let drawing = false;
let points = [];
let undoStack = [];
let redoStack = [];
let currentColor = '#000000';
let currentLineWidth = 2;

function updateLineWidth() {
    ctx.lineWidth = currentLineWidth = lineWidth.value;
}

function updateColor() {
    ctx.strokeStyle = currentColor = colorPicker.value;
}

function updateBrushSize() {
    ctx.lineWidth = currentLineWidth = brushSize.value;
}

function startDrawing(e) {
    drawing = true;
    points = [];
    const { offsetX, offsetY } = e;
    points.push({ x: offsetX, y: offsetY });
}

function draw(e) {
    if (!drawing) return;
    const { offsetX, offsetY } = e;
    points.push({ x: offsetX, y: offsetY });

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.closePath();
}

function endDrawing() {
    if (drawing) {
        undoStack.push({ color: currentColor, lineWidth: currentLineWidth, points: [...points] });
        redoStack = [];
        drawing = false;
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    undoStack = [];
    redoStack = [];
}

function undo() {
    if (undoStack.length > 0) {
        const undoneAction = undoStack.pop();
        redoStack.push(undoneAction); 
        clearCanvas();
        redraw(); 
}

function redo() {
    if (redoStack.length > 0) {
        const redoneAction = redoStack.pop();
        undoStack.push(redoneAction); 
        clearCanvas();
        redraw(); 
    }
}

function redraw() {
    undoStack.forEach(item => {
        ctx.strokeStyle = item.color;
        ctx.lineWidth = item.lineWidth;
        ctx.beginPath();
        ctx.moveTo(item.points[0].x, item.points[0].y);
        for (let i = 1; i < item.points.length; i++) {
            ctx.lineTo(item.points[i].x, item.points[i].y);
        }
        ctx.stroke();
        ctx.closePath();
    });
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentLineWidth;
}

function selectMarker() {
    currentColor = this.getAttribute('data-color');
    colorPicker.value = currentColor;
    ctx.strokeStyle = currentColor;
}

function exportAsSVG() {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
        <rect width="100%" height="100%" fill="white" />
        <path d="${getSVGPath()}" fill="none" stroke="${currentColor}" stroke-width="${currentLineWidth}" />
    </svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drawing.svg';
    a.click();
    URL.revokeObjectURL(url);
}

function getSVGPath() {
    let path = '';
    undoStack.forEach(item => {
        path += `M ${item.points[0].x} ${item.points[0].y} `;
        for (let i = 1; i < item.points.length; i++) {
            path += `L ${item.points[i].x} ${item.points[i].y} `;
        }
    });
    return path;
}

function exportAsPNG() {
    const a = document.createElement('a');
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = 'drawing.png';
        a.click();
        URL.revokeObjectURL(url);
    });
}

lineWidth.addEventListener('input', updateLineWidth);
colorPicker.addEventListener('input', updateColor);
brushSize.addEventListener('input', updateBrushSize);
clearCanvasButton.addEventListener('click', clearCanvas);
undoButton.addEventListener('click', undo);
redoButton.addEventListener('click', redo);
exportSvgButton.addEventListener('click', exportAsSVG);
exportPngButton.addEventListener('click', exportAsPNG);
markers.forEach(marker => marker.addEventListener('click', selectMarker));

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', endDrawing);
