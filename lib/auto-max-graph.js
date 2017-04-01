import Graph from './graph';

export default class AutoMaxGraph extends Graph {
  constructor(dom, color) {
    super(dom, color);

    this._current = 0;
    this._max = 0;
  }

  draw(value, alarm) {
    this._current += (value - this._current) * 0.1;
    this._max *= 0.99;

    if (this._current > this._max) {
      this._max = this._current;
    }

    let h = Math.round(-this._canvas.height * this._current / this._max);

    this._ctx.drawImage(this._canvas,
      1, 0, this._canvas.width - 1, this._canvas.height,
      0, 0, this._canvas.width - 1, this._canvas.height
    );

    if (alarm) {
      this._ctx.drawImage(this._canvasAlarm, this._canvas.width - 1, h);
    } else {
      this._ctx.drawImage(this._canvasDot, this._canvas.width - 1, h);
    }
  }
}