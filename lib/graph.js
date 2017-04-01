export default class Graph {
  constructor(dom, color) {
    this._color = color || '#666';

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
    this._ctx.fillRect(0, 0, width, height);

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
}