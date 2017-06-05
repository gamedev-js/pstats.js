import Graph from './graph';

const PR = Math.round(window.devicePixelRatio || 1);

export default class RangedGraph extends Graph {
  constructor(dom, color, min, max) {
    super(dom, color);

    this._min = min;
    this._max = max;
  }

  draw(value, alarm) {
    const WIDTH = this._canvas.width;
    const HEIGHT = this._canvas.height;

    let ratio = (value - this._min) / (this._max - this._min);
    let h = Math.round((1-ratio) * HEIGHT);

    this._ctx.globalAlpha = 1;
    this._ctx.drawImage(this._canvas,
      PR, 0, WIDTH - PR, HEIGHT,
      0, 0, WIDTH - PR, HEIGHT
    );

    if (alarm) {
      // background
      this._ctx.fillStyle = '#444';
      this._ctx.fillRect(WIDTH-PR, 0, PR, HEIGHT);

      // value
      this._ctx.fillStyle = '#b70000';
      this._ctx.fillRect(WIDTH-PR, h, PR, HEIGHT-h);

      // line
      this._ctx.globalAlpha = 0.5;
      this._ctx.fillStyle = '#fff';
      this._ctx.fillRect(WIDTH-PR, h, PR, PR);
    } else {
      // background
      this._ctx.fillStyle = '#444';
      this._ctx.fillRect(WIDTH-PR, 0, PR, HEIGHT);

      // value
      this._ctx.fillStyle = this._color;
      this._ctx.fillRect(WIDTH-PR, h, PR, HEIGHT-h);

      // line
      this._ctx.globalAlpha = 0.5;
      this._ctx.fillStyle = '#fff';
      this._ctx.fillRect(WIDTH-PR, h, PR, PR);
    }
  }
}