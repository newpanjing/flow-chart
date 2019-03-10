function Diamond(width, height) {

    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");

    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';

    ctx.moveTo(0, height / 2 - 1);
    ctx.lineTo(width / 2 - 1, 1);
    ctx.lineTo(width - 1, height / 2 - 1)
    ctx.lineTo(width / 2 - 1, height - 1)
    ctx.lineTo(1, height / 2 - 1);
    ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = 'yellow';
    ctx.fill();


    return canvas.toDataURL('image/png');
}
