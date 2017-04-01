import Graph from './graph';

export default class RangedGraph extends Graph {
  constructor(dom, color, min, max) {
    super(dom, color);

    this._current = 0;
    this._min = min;
    this._max = max;
  }

  draw(value, alarm) {
    this._current = value;
    let ratio = (this._current - this._min) / (this._max - this._min);
    let h = -Math.ceil(this._canvas.height * ratio);

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