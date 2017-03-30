export default class Graph {
  constructor(dom, color) {
    this._color = color || '#666';
    this._max = 0;
    this._current = 0;

    this._canvas = document.createElement('canvas');
    this._ctx = this._canvas.getContext('2d');

    this._canvasDot = document.createElement('canvas');
    this._ctxDot = this._canvasDot.getContext('2d');

    this._canvasAlarm = document.createElement('canvas'),
    this._ctxAlarm = this._canvasAlarm.getContext('2d');

    this._canvas.className = 'pstats-canvas';
    dom.appendChild(this._canvas);
  }

  init(width, height) {
    this._canvas.width = width;
    this._canvas.height = height;
    this._canvas.style.width = `${width}px`;
    this._canvas.style.height = `${height}px`;

    this._ctx.fillStyle = '#444';
    this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

    this._canvasDot.width = 1;
    this._canvasDot.height = 2 * height;

    this._ctxDot.fillStyle = '#444';
    this._ctxDot.fillRect(0, 0, 1, 2 * height);
    this._ctxDot.fillStyle = this._color;
    this._ctxDot.fillRect(0, height, 1, height);
    this._ctxDot.fillStyle = '#fff';
    this._ctxDot.globalAlpha = 0.5;
    this._ctxDot.fillRect(0, height, 1, 1);
    this._ctxDot.globalAlpha = 1;

    this._canvasAlarm.width = 1;
    this._canvasAlarm.height = 2 * height;

    this._ctxAlarm.fillStyle = '#444';
    this._ctxAlarm.fillRect(0, 0, 1, 2 * height);
    this._ctxAlarm.fillStyle = '#b70000';
    this._ctxAlarm.fillRect(0, height, 1, height);
    this._ctxAlarm.globalAlpha = 0.5;
    this._ctxAlarm.fillStyle = '#fff';
    this._ctxAlarm.fillRect(0, height, 1, 1);
    this._ctxAlarm.globalAlpha = 1;
  }

  draw(value, alarm) {
    this._current += (value - this._current) * 0.1;
    this._max *= 0.99;

    if (this._current > this._max) {
      this._max = this._current;
    }

    this._ctx.drawImage(this._canvas,
      1, 0, this._canvas.width - 1, this._canvas.height,
      0, 0, this._canvas.width - 1, this._canvas.height
    );

    if (alarm) {
      this._ctx.drawImage(
        this._canvasAlarm,
        this._canvas.width - 1,
        this._canvas.height - this._current * this._canvas.height / this._max - this._canvas.height
      );
    } else {
      this._ctx.drawImage(
        this._canvasDot,
        this._canvas.width - 1,
        this._canvas.height - this._current * this._canvas.height / this._max - this._canvas.height
      );
    }
  }
}