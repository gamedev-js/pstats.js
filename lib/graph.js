const PR = Math.round(window.devicePixelRatio || 1);

export default class Graph {
  constructor(dom, color) {
    this._color = color || '#666';

    this._canvas = document.createElement('canvas');
    this._ctx = this._canvas.getContext('2d', { alpha: false });

    this._canvas.className = 'pstats-canvas';
    dom.appendChild(this._canvas);
  }

  init(width, height) {
    const WIDTH = width * PR;
    const HEIGHT = height * PR;

    this._canvas.width = WIDTH;
    this._canvas.height = HEIGHT;
    this._canvas.style.width = `${width}px`;
    this._canvas.style.height = `${height}px`;

    this._ctx.globalAlpha = 1;
    this._ctx.fillStyle = '#444';
    this._ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
}