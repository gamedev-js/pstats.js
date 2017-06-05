import Graph from './graph';

const PR = Math.round(window.devicePixelRatio || 1);

export default class ThresholdGraph extends Graph {
  constructor(dom, color) {
    super(dom, color);

    this._threshold = 0;

    this._canvas2 = document.createElement('canvas');
    this._ctx2 = this._canvas2.getContext('2d');
  }

  init(width, height) {
    super.init(width, height);

    const WIDTH = width * PR;
    const HEIGHT = height * PR;

    this._canvas2.width = WIDTH;
    this._canvas2.height = HEIGHT;
    this._canvas2.style.width = `${width}px`;
    this._canvas2.style.height = `${height}px`;

    this._ctx2.globalAlpha = 1;
    this._ctx2.fillStyle = '#444';
    this._ctx2.fillRect(0, 0, WIDTH, HEIGHT);
  }

  draw(value, alarm) {
    const WIDTH = this._canvas.width;
    const HEIGHT = this._canvas.height;
    this._ctx.globalAlpha = 1;
    this._ctx2.globalAlpha = 1;

    if (value > this._threshold) {
      let factor = (value - (value % HEIGHT)) / HEIGHT;
      let newThreshold = HEIGHT * (factor + 1);

      let lastThreshold = this._threshold;
      this._threshold = newThreshold;

      let ratio = lastThreshold / newThreshold;

      this._ctx2.drawImage(this._canvas, 0, 0);

      this._ctx.fillStyle = '#444';
      this._ctx.fillRect(0, 0, WIDTH, HEIGHT);
      this._ctx.drawImage(this._canvas2,
        PR, 0, WIDTH - PR, HEIGHT,
        0, Math.round((1.0 - ratio) * HEIGHT), WIDTH - PR, HEIGHT
      );
    } else {
      this._ctx.drawImage(this._canvas,
        PR, 0, WIDTH - PR, HEIGHT,
        0, 0, WIDTH - PR, HEIGHT
      );
    }

    let h = Math.round(HEIGHT * (1.0 - value / this._threshold));

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