export default class PerfCounter {
  constructor(id, opts) {
    this._id = id;
    this._opts = opts || {};

    this._idstart = `${id}_start`;
    this._idend = `${id}_end`;

    this._value = 0;
    this._total = 0;
    this._averageValue = 0;
    this._accumValue = 0;
    this._accumStart = window.performance.now();
    this._accumSamples = 0;
    this._started = false;

    // TODO: move to somewhere
    // // dom
    // this._dom = document.createElement('div');
    // this._spanId = document.createElement('span');
    // this._spanValue = document.createElement('div');
    // this._spanValueText = document.createTextNode('');
    // this._graph = new Graph(this._dom, this._opts.color);
    // this._graph.init(_elWidth, _elHeight);

    // this._spanId.className = 'rs-counter-id';
    // this._spanId.textContent = (this._opts && this._opts.caption) ? this._opts.caption : this._id;

    // this._spanValue.className = 'rs-counter-value';
    // this._spanValue.appendChild(this._spanValueText);

    // this._dom.appendChild(this._spanId);
    // this._dom.appendChild(this._spanValue);

    // dom.appendChild(this._dom);

    this._time = performance.now();
  }

  _average(v) {
    if (this._opts.average) {
      this._accumValue += v;
      ++this._accumSamples;

      let t = performance.now();
      if (t - this._accumStart >= (this._opts.avgMs || 1000)) {
        this._averageValue = this._accumValue / this._accumSamples;
        this._accumValue = 0;
        this._accumStart = t;
        this._accumSamples = 0;
      }
    }
  }

  get value() { return this._value; }
  set value(v) {
    this._value = v;
    this._average(this._value);
  }

  start() {
    this._time = window.performance.now();
    window.performance.mark(this._idstart);

    this._started = true;
  }

  end() {
    this._value = window.performance.now() - this._time;
    window.performance.mark(this._idend);
    if (this._started) {
      window.performance.measure(this._id, this._idstart, this._idend);
    }

    this._average(this._value);
  }

  tick() {
    this.end();
    this.start();
  }

  frame() {
    let t = window.performance.now();
    let e = t - this._time;
    this._total++;

    if (e > 1000) {
      if (this._opts.interpolate) {
        this._value = this._total * 1000 / e;
      } else {
        this._value = this._total;
      }

      this._total = 0;
      this._time = t;
      this._average(this._value);
    }
  }

  sampleAverage() {
    let v = this._opts.average ? this._averageValue : this._value;
    return Math.round(v * 100) / 100;
  }

  sampleAlarm() {
    return (
      (this._opts.below && this._value < this._opts.below) ||
      (this._opts.over && this._value > this._opts.over)
    );
  }

    // this._graph.draw(this._value, a);
    // this._dom.className = a ? 'pstats-counter-base alarm' : 'pstats-counter-base';
}
