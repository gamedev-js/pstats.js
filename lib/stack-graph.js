const PR = Math.round(window.devicePixelRatio || 1);

export default class StackGraph {
  constructor(dom, colors) {
    this._colors = colors;

    this._canvas = document.createElement('canvas');
    this._ctx = this._canvas.getContext('2d');

    this._canvas.className = 'pstats-canvas';
    dom.appendChild(this._canvas);
  }

  init(width, height, n) {
    const WIDTH = width * PR;
    const HEIGHT = height * PR;

    this._canvas.width = WIDTH;
    this._canvas.height = HEIGHT * n;
    this._canvas.style.width = `${width}px`;
    this._canvas.style.height = `${height * n}px`;

    this._ctx.globalAlpha = 1;
    this._ctx.fillStyle = '#444';
    this._ctx.fillRect(0, 0, WIDTH, HEIGHT * n);
  }

  draw(values) {
    const WIDTH = this._canvas.width;
    const HEIGHT = this._canvas.height;

    this._ctx.globalAlpha = 1;
    this._ctx.drawImage(this._canvas,
      PR, 0, WIDTH - PR, HEIGHT,
      0, 0, WIDTH - PR, HEIGHT
    );

    let th = 0;
    for (let i = 0; i < values.length; ++i) {
      let h = values[i] * HEIGHT;
      this._ctx.fillStyle = this._colors[i];
      this._ctx.fillRect(WIDTH - PR, th, PR, h);
      th += h;
    }
  }
}