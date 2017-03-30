
/*
 * pstats v1.0.0
 * (c) 2017 @Johnny Wu
 * Released under the MIT License.
 */

'use strict';

function polyfill() {
  if (typeof window.performance === 'undefined') {
    window.performance = {};
  }

  if (!window.performance.now) {

    var nowOffset = Date.now();

    if (performance.timing && performance.timing.navigationStart) {
      nowOffset = performance.timing.navigationStart;
    }

    window.performance.now = function now() {
      return Date.now() - nowOffset;
    };
  }

  if (!window.performance.mark) {
    window.performance.mark = function () { };
  }

  if (!window.performance.measure) {
    window.performance.measure = function () { };
  }

  if (!window.performance.memory) {
    window.performance.memory = { usedJSHeapSize: 0, totalJSHeapSize: 0 };
  }
}

class Graph {
  constructor(dom, color) {
    this._color = color || '#666';
    this._max = 0;
    this._current = 0;

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
    this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

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

  draw(value, alarm) {
    this._current += (value - this._current) * 0.1;
    this._max *= 0.99;

    if (this._current > this._max) {
      this._max = this._current;
    }

    // DISABLE: pstats is not designed for monitor ranged value
    // if (this._current < this._min) {
    //   this._min = this._current;
    // }
    // let ratio = (this._current - this._min) / (this._max - this._min);

    this._ctx.drawImage(this._canvas,
      1, 0, this._canvas.width - 1, this._canvas.height,
      0, 0, this._canvas.width - 1, this._canvas.height
    );

    if (alarm) {
      this._ctx.drawImage(this._canvasAlarm,
        this._canvas.width - 1,
        -this._canvas.height * this._current / this._max
      );
    } else {
      this._ctx.drawImage(this._canvasDot,
        this._canvas.width - 1,
        -this._canvas.height * this._current / this._max
      );
    }
  }
}

class StackGraph {
  constructor(dom, colors) {
    this._colors = colors;

    this._canvas = document.createElement('canvas');
    this._ctx = this._canvas.getContext('2d');

    this._canvas.className = 'pstats-canvas';
    dom.appendChild(this._canvas);
  }

  init(width, height, n) {
    this._canvas.width = width;
    this._canvas.height = height * n;
    this._canvas.style.width = `${width}px`;
    this._canvas.style.height = `${height * n}px`;

    this._ctx.fillStyle = '#444';
    this._ctx.fillRect(0, 0, width, height * n);
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

class PerfCounter {
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

let _canvasWidth = 100;
let _canvasHeight = 10;
let _css = `
  .pstats {
    position: absolute;
    z-index: 9999;

    padding: 5px;
    width: ${_canvasWidth+150}px;
    right: 0;
    bottom: 0;

    font-size: 10px;
    font-family: 'Roboto Condensed', tahoma, sans-serif;
    overflow: hidden;
    user-select: none;
    cursor: default;

    background: rgba(0,0,0,0.2);
    border-radius: 3px;

  }

  .pstats-container {
    display: flex;
    flex-direction: column;
    color: #888;
  }

  .pstats-item {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .pstats-label {
    display: flex;
    flex-direction: row;
    flex: 1;

    text-align: left;
    margin-right: 5px;

    transition: background 0.3s;
  }

  .pstats-label.alarm {
    color: #ccc;
    background: #800;

    transition: background 0s;
  }

  .pstats-counter-id {
    flex: 1;
  }

  .pstats-counter-value {
    width: 30px;
    text-align: right;
  }

  .pstats-fraction {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .pstats-legend {
    display: flex;
    flex-direction: column;
    flex: 1;

    text-align: right;
    margin-right: 5px;
  }
`;

// DISABLE:
// let cssFont = 'https://fonts.googleapis.com/css?family=Roboto+Condensed:400,700,300';
// let cssFontEL = document.createElement('link');
// cssFontEL.href = cssFont;
// cssFontEL.rel = 'stylesheet';
// cssFontEL.type = 'text/css';
// document.head.appendChild(cssFontEL);

// add global style
let styleEL = document.createElement('style');
styleEL.type = 'text/css';
styleEL.textContent = _css;
document.head.appendChild(styleEL);

//
class Stats {
  constructor (dom, opts) {
    opts = opts || {};
    this._colors = opts.colors || ['#850700', '#c74900', '#fcb300', '#284280', '#4c7c0c'];
    this._values = opts.values || {};
    this._fractions = opts.fractions || [];
    this._id2perf = {};
    this._id2item = {};

    if (opts.css) {
      let styleEL = document.createElement('style');
      styleEL.type = 'text/css';
      styleEL.textContent = opts.css;
      document.head.appendChild(styleEL);
    }

    // TODO
    // if (opts.plugins) {
    //   if (!opts.values) opts.values = {};
    //   if (!opts.groups) opts.groups = [];
    //   if (!opts.fractions) opts.fractions = [];
    //   for (let j = 0; j < opts.plugins.length; j++) {
    //     opts.plugins[j].attach(_perf);
    //     iterateKeys(opts.plugins[j].values, function (k) {
    //       opts.values[k] = opts.plugins[j].values[k];
    //     });
    //     opts.groups = opts.groups.concat(opts.plugins[j].groups);
    //     opts.fractions = opts.fractions.concat(opts.plugins[j].fractions);
    //   }
    // } else {
    //   opts.plugins = {};
    // }

    // TODO
    // if (opts.groups) {
    //   iterateKeys(opts.groups, function (j) {
    //     let g = opts.groups[parseInt(j, 10)];
    //     let div = document.createElement('div');
    //     div.className = 'rs-group';
    //     g.div = div;
    //     let h1 = document.createElement('h1');
    //     h1.textContent = g.caption;
    //     h1.addEventListener('click', function (e) {
    //       this.classList.toggle('hidden');
    //       e.preventDefault();
    //     }.bind(div));
    //     div.appendChild(h1);
    //     div.appendChild(div);
    //   });
    // }

    // ==================
    // DOM
    // ==================

    this._root = document.createElement('div');
    this._root.className = 'pstats';

    let containerEL = document.createElement('div');
    containerEL.className = 'pstats-container';

    this._root.appendChild(containerEL);

    // pstats-item
    for (let id in this._values) {
      let vopts = this._values[id];

      // .pstats-item
      let itemEL = document.createElement('div');
      itemEL.className = 'pstats-item';

      // .pstats-label
      let label = document.createElement('div');
      label.className = 'pstats-label';

      let spanId = document.createElement('span');
      spanId.className = 'pstats-counter-id';
      spanId.textContent = vopts.desc || id;

      let spanValue = document.createElement('div');
      spanValue.className = 'pstats-counter-value';

      let spanValueText = document.createTextNode('');
      spanValueText.nodeValue = '0';

      label.appendChild(spanId);
      label.appendChild(spanValue);
      spanValue.appendChild(spanValueText);
      itemEL.appendChild(label);

      // graph
      let graph = new Graph(itemEL, vopts.color);
      graph.init(_canvasWidth, _canvasHeight);

      //
      this._id2item[id] = {
        label: label,
        valueText: spanValueText,
        graph,
      };

      containerEL.appendChild(itemEL);
    }

    // pstats-fraction
    if (opts.fractions) {
      for ( let i = 0; i < opts.fractions.length; ++i ) {
        let fraction = opts.fractions[i];

        let fractionEL = document.createElement('div');
        fractionEL.className = 'pstats-fraction';

        let legend = document.createElement('div');
        legend.className = 'pstats-legend';

        let steps = fraction.steps;
        for (let h = 0; h < steps.length; ++h) {
          let p = document.createElement('span');
          p.textContent = steps[h];
          p.style.color = this._colors[h];
          legend.appendChild(p);
        }

        fractionEL.appendChild(legend);
        fractionEL.style.height = steps.length * _canvasHeight + 'px';
        fraction.dom = fractionEL;

        let graph = new StackGraph(fractionEL, this._colors);
        graph.init(_canvasWidth, _canvasHeight, steps.length);

        fraction.graph = graph;

        containerEL.appendChild(fractionEL);
      }
    }

    dom.appendChild(this._root);
  }

  item(id) {
    if (!id) {
      return null;
    }

    id = id.toLowerCase();
    let perf = this._id2perf[id];
    if (perf) {
      return perf;
    }

    // TODO:
    // let group = null;
    // if (this._opts && this._opts.groups) {
    //   iterateKeys(this._opts.groups, function (j) {
    //     let g = this._opts.groups[parseInt(j, 10)];
    //     if (!group && g.values.indexOf(id.toLowerCase()) !== -1) {
    //       group = g;
    //     }
    //   });
    // }

    let vopts = this._values[id];
    perf = new PerfCounter(id, vopts);
    this._id2perf[id] = perf;

    return perf;
  }

  tick() {
    for (let id in this._values) {
      let perf = this._id2perf[id];
      if (perf) {
        let av = perf.sampleAverage();
        let alarm = perf.sampleAlarm();
        let item = this._id2item[id];

        item.label.classList.toggle('alarm', alarm > 0);
        item.valueText.nodeValue = av;
        item.graph.draw(perf.value, alarm);
      }
    }

    // fractions
    for ( let i = 0; i < this._fractions.length; ++i ) {
      let fraction = this._fractions[i];
      let v = [];

      let perfBase = this._id2perf[fraction.base.toLowerCase()];
      if (perfBase) {
        let steps = fraction.steps;
        for (let j = 0; j < steps.length; ++j) {
          let id = steps[j].toLowerCase();
          let perf = this._id2perf[id];
          if (perf) {
            v.push(perf.value / perfBase.value);
          }
        }
        fraction.graph.draw(v);
      }
    }

    // TODO:
    // iterateKeys(this._opts.plugins, function (j) {
    //   this._opts.plugins[j].update();
    // });
  }
}

polyfill();

let pstats = {
  new (dom, settings) {
    let stats = new Stats(dom, settings);
    return function (id) {
      if (!id) {
        return stats;
      }

      return stats.item(id);
    };
  },
};

module.exports = pstats;
//# sourceMappingURL=pstats.js.map
