import Graph from './graph';

export default class ThresholdGraph extends Graph {
  constructor(dom, color) {
    super(dom, color);

    this._current = 0;
    this._threshold = 0;

    this._canvas2 = document.createElement('canvas');
    this._ctx2 = this._canvas2.getContext('2d');
  }

  init(width, height) {
    super.init(width, height);

    this._canvas2.width = width;
    this._canvas2.height = height;

    this._ctx2.fillStyle = '#444';
    this._ctx2.fillRect(0, 0, width, height);
  }

  draw(value, alarm) {
    this._current = value;
    // this._current += (value - this._current) * 0.1;
    // this._threshold *= 0.99;

    if (this._current > this._threshold) {
      let factor = (this._current - (this._current % this._canvas.height)) / this._canvas.height;
      let newThreshold = this._canvas.height * (factor + 1);

      let lastThreshold = this._threshold;
      this._threshold = newThreshold;

      let ratio = lastThreshold / newThreshold;

      this._ctx2.drawImage(this._canvas, 0, 0);

      this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
      this._ctx.drawImage(this._canvas2,
        1, 0, this._canvas.width - 1, this._canvas.height,
        0, (1.0 - ratio) * this._canvas.height, this._canvas.width - 1, this._canvas.height
      );
    } else {
      this._ctx.drawImage(this._canvas,
        1, 0, this._canvas.width - 1, this._canvas.height,
        0, 0, this._canvas.width - 1, this._canvas.height
      );
    }

    let h = Math.round(-this._canvas.height * this._current / this._threshold);

    if (alarm) {
      this._ctx.drawImage(this._canvasAlarm, this._canvas.width - 1, h);
    } else {
      this._ctx.drawImage(this._canvasDot, this._canvas.width - 1, h);
    }
  }
}