export default class StackGraph {
  constructor(dom, colors) {
    this._colors = colors;

    this._canvas = document.createElement('canvas');
    this._ctx = this._canvas.getContext('2d');

    this._canvas.className = 'pstats-canvas';
    dom.appendChild(this._canvas);
  }

  _init(width, height, n) {
    this._canvas.width = width;
    this._canvas.height = height * n;
    this._canvas.style.width = `${width}px`;
    this._canvas.style.height = `${height}px`;

    this._ctx.fillStyle = '#444';
    this._ctx.fillRect(0, 0, width, height);
  }

  draw(values) {
    this._ctx.drawImage(this._canvas,
      1, 0, this._canvas.width - 1, this._canvas.height,
      0, 0, this._canvas.width - 1, this._canvas.height
    );

    let th = 0;
    for (let i = 0; i < values.length; ++i) {
      let h = values[i] * this._canvas.height;
      this._ctx.fillStyle = this._colors[i];
      this._ctx.fillRect(this._canvas.width - 1, th, 1, h);
      th += h;
    }
  }
}