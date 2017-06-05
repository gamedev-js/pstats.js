
/*
 * pstats.js v1.3.0
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

var PR$1 = Math.round(window.devicePixelRatio || 1);

var Graph = function Graph(dom, color) {
  this._color = color || '#666';

  this._canvas = document.createElement('canvas');
  this._ctx = this._canvas.getContext('2d');

  this._canvas.className = 'pstats-canvas';
  dom.appendChild(this._canvas);
};

Graph.prototype.init = function init (width, height) {
  var WIDTH = width * PR$1;
  var HEIGHT = height * PR$1;

  this._canvas.width = WIDTH;
  this._canvas.height = HEIGHT;
  this._canvas.style.width = width + "px";
  this._canvas.style.height = height + "px";

  this._ctx.globalAlpha = 1;
  this._ctx.fillStyle = '#444';
  this._ctx.fillRect(0, 0, WIDTH, HEIGHT);
};

var PR = Math.round(window.devicePixelRatio || 1);

var AutoMaxGraph = (function (Graph$$1) {
  function AutoMaxGraph(dom, color) {
    Graph$$1.call(this, dom, color);

    this._current = 0;
    this._max = 0;
  }

  if ( Graph$$1 ) AutoMaxGraph.__proto__ = Graph$$1;
  AutoMaxGraph.prototype = Object.create( Graph$$1 && Graph$$1.prototype );
  AutoMaxGraph.prototype.constructor = AutoMaxGraph;

  AutoMaxGraph.prototype.draw = function draw (value, alarm) {
    var WIDTH = this._canvas.width;
    var HEIGHT = this._canvas.height;

    this._current += (value - this._current) * 0.1;
    this._max *= 0.99;

    if (this._current > this._max) {
      this._max = this._current;
    }

    var h = Math.round((1 - this._current / this._max) * HEIGHT);
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
  };

  return AutoMaxGraph;
}(Graph));

var PR$2 = Math.round(window.devicePixelRatio || 1);

var ThresholdGraph = (function (Graph$$1) {
  function ThresholdGraph(dom, color) {
    Graph$$1.call(this, dom, color);

    this._threshold = 0;

    this._canvas2 = document.createElement('canvas');
    this._ctx2 = this._canvas2.getContext('2d');
  }

  if ( Graph$$1 ) ThresholdGraph.__proto__ = Graph$$1;
  ThresholdGraph.prototype = Object.create( Graph$$1 && Graph$$1.prototype );
  ThresholdGraph.prototype.constructor = ThresholdGraph;

  ThresholdGraph.prototype.init = function init (width, height) {
    Graph$$1.prototype.init.call(this, width, height);

    var WIDTH = width * PR$2;
    var HEIGHT = height * PR$2;

    this._canvas2.width = WIDTH;
    this._canvas2.height = HEIGHT;
    this._canvas2.style.width = width + "px";
    this._canvas2.style.height = height + "px";

    this._ctx2.globalAlpha = 1;
    this._ctx2.fillStyle = '#444';
    this._ctx2.fillRect(0, 0, WIDTH, HEIGHT);
  };

  ThresholdGraph.prototype.draw = function draw (value, alarm) {
    var WIDTH = this._canvas.width;
    var HEIGHT = this._canvas.height;
    this._ctx.globalAlpha = 1;
    this._ctx2.globalAlpha = 1;

    if (value > this._threshold) {
      var factor = (value - (value % HEIGHT)) / HEIGHT;
      var newThreshold = HEIGHT * (factor + 1);

      var lastThreshold = this._threshold;
      this._threshold = newThreshold;

      var ratio = lastThreshold / newThreshold;

      this._ctx2.drawImage(this._canvas, 0, 0);

      this._ctx.fillStyle = '#444';
      this._ctx.fillRect(0, 0, WIDTH, HEIGHT);
      this._ctx.drawImage(this._canvas2,
        PR$2, 0, WIDTH - PR$2, HEIGHT,
        0, Math.round((1.0 - ratio) * HEIGHT), WIDTH - PR$2, HEIGHT
      );
    } else {
      this._ctx.drawImage(this._canvas,
        PR$2, 0, WIDTH - PR$2, HEIGHT,
        0, 0, WIDTH - PR$2, HEIGHT
      );
    }

    var h = Math.round(HEIGHT * (1.0 - value / this._threshold));

    if (alarm) {
      // background
      this._ctx.fillStyle = '#444';
      this._ctx.fillRect(WIDTH-PR$2, 0, PR$2, HEIGHT);

      // value
      this._ctx.fillStyle = '#b70000';
      this._ctx.fillRect(WIDTH-PR$2, h, PR$2, HEIGHT-h);

      // line
      this._ctx.globalAlpha = 0.5;
      this._ctx.fillStyle = '#fff';
      this._ctx.fillRect(WIDTH-PR$2, h, PR$2, PR$2);
    } else {
      // background
      this._ctx.fillStyle = '#444';
      this._ctx.fillRect(WIDTH-PR$2, 0, PR$2, HEIGHT);

      // value
      this._ctx.fillStyle = this._color;
      this._ctx.fillRect(WIDTH-PR$2, h, PR$2, HEIGHT-h);

      // line
      this._ctx.globalAlpha = 0.5;
      this._ctx.fillStyle = '#fff';
      this._ctx.fillRect(WIDTH-PR$2, h, PR$2, PR$2);
    }
  };

  return ThresholdGraph;
}(Graph));

var PR$3 = Math.round(window.devicePixelRatio || 1);

var RangedGraph = (function (Graph$$1) {
  function RangedGraph(dom, color, min, max) {
    Graph$$1.call(this, dom, color);

    this._min = min;
    this._max = max;
  }

  if ( Graph$$1 ) RangedGraph.__proto__ = Graph$$1;
  RangedGraph.prototype = Object.create( Graph$$1 && Graph$$1.prototype );
  RangedGraph.prototype.constructor = RangedGraph;

  RangedGraph.prototype.draw = function draw (value, alarm) {
    var WIDTH = this._canvas.width;
    var HEIGHT = this._canvas.height;

    var ratio = (value - this._min) / (this._max - this._min);
    var h = Math.round((1-ratio) * HEIGHT);

    this._ctx.globalAlpha = 1;
    this._ctx.drawImage(this._canvas,
      PR$3, 0, WIDTH - PR$3, HEIGHT,
      0, 0, WIDTH - PR$3, HEIGHT
    );

    if (alarm) {
      // background
      this._ctx.fillStyle = '#444';
      this._ctx.fillRect(WIDTH-PR$3, 0, PR$3, HEIGHT);

      // value
      this._ctx.fillStyle = '#b70000';
      this._ctx.fillRect(WIDTH-PR$3, h, PR$3, HEIGHT-h);

      // line
      this._ctx.globalAlpha = 0.5;
      this._ctx.fillStyle = '#fff';
      this._ctx.fillRect(WIDTH-PR$3, h, PR$3, PR$3);
    } else {
      // background
      this._ctx.fillStyle = '#444';
      this._ctx.fillRect(WIDTH-PR$3, 0, PR$3, HEIGHT);

      // value
      this._ctx.fillStyle = this._color;
      this._ctx.fillRect(WIDTH-PR$3, h, PR$3, HEIGHT-h);

      // line
      this._ctx.globalAlpha = 0.5;
      this._ctx.fillStyle = '#fff';
      this._ctx.fillRect(WIDTH-PR$3, h, PR$3, PR$3);
    }
  };

  return RangedGraph;
}(Graph));

var PR$4 = Math.round(window.devicePixelRatio || 1);

var StackGraph = function StackGraph(dom, colors) {
  this._colors = colors;

  this._canvas = document.createElement('canvas');
  this._ctx = this._canvas.getContext('2d');

  this._canvas.className = 'pstats-canvas';
  dom.appendChild(this._canvas);
};

StackGraph.prototype.init = function init (width, height, n) {
  var WIDTH = width * PR$4;
  var HEIGHT = height * PR$4;

  this._canvas.width = WIDTH;
  this._canvas.height = HEIGHT * n;
  this._canvas.style.width = width + "px";
  this._canvas.style.height = (height * n) + "px";

  this._ctx.globalAlpha = 1;
  this._ctx.fillStyle = '#444';
  this._ctx.fillRect(0, 0, WIDTH, HEIGHT * n);
};

StackGraph.prototype.draw = function draw (values) {
    var this$1 = this;

  var WIDTH = this._canvas.width;
  var HEIGHT = this._canvas.height;

  this._ctx.globalAlpha = 1;
  this._ctx.drawImage(this._canvas,
    PR$4, 0, WIDTH - PR$4, HEIGHT,
    0, 0, WIDTH - PR$4, HEIGHT
  );

  var th = 0;
  for (var i = 0; i < values.length; ++i) {
    var h = values[i] * HEIGHT;
    this$1._ctx.fillStyle = this$1._colors[i];
    this$1._ctx.fillRect(WIDTH - PR$4, th, PR$4, h);
    th += h;
  }
};

var Counter = function Counter(id, opts) {
  this._id = id;
  this._opts = opts || {};

  this._value = 0;
  this._total = 0;
  this._averageValue = 0;
  this._accumValue = 0;
  this._accumSamples = 0;
  this._accumStart = window.performance.now();
};

var prototypeAccessors = { value: {} };

Counter.prototype._average = function _average (v) {
  if (this._opts.average) {
    this._accumValue += v;
    ++this._accumSamples;

    var t = performance.now();
    if (t - this._accumStart >= this._opts.average) {
      this._averageValue = this._accumValue / this._accumSamples;
      this._accumValue = 0;
      this._accumStart = t;
      this._accumSamples = 0;
    }
  }
};

prototypeAccessors.value.get = function () { return this._value; };
prototypeAccessors.value.set = function (v) {
  this._value = v;
};

Counter.prototype.sample = function sample () {
  this._average(this._value);
};

Counter.prototype.human = function human () {
  var v = this._opts.average ? this._averageValue : this._value;
  return Math.round(v * 100) / 100;
};

Counter.prototype.alarm = function alarm () {
  return (
    (this._opts.below && this._value < this._opts.below) ||
    (this._opts.over && this._value > this._opts.over)
  );
};

Object.defineProperties( Counter.prototype, prototypeAccessors );

var PerfCounter = (function (Counter$$1) {
  function PerfCounter(id, opts) {
    Counter$$1.call(this, id, opts);

    // DISABLE
    // this._idstart = `${id}_start`;
    // this._idend = `${id}_end`;

    this._time = window.performance.now();
  }

  if ( Counter$$1 ) PerfCounter.__proto__ = Counter$$1;
  PerfCounter.prototype = Object.create( Counter$$1 && Counter$$1.prototype );
  PerfCounter.prototype.constructor = PerfCounter;

  PerfCounter.prototype.start = function start () {
    this._time = window.performance.now();

    // DISABLE: long time running will cause performance drop down
    // window.performance.mark(this._idstart);
  };

  PerfCounter.prototype.end = function end () {
    this._value = window.performance.now() - this._time;

    // DISABLE: long time running will cause performance drop down
    // window.performance.mark(this._idend);
    // window.performance.measure(this._id, this._idstart, this._idend);

    this._average(this._value);
  };

  PerfCounter.prototype.tick = function tick () {
    this.end();
    this.start();
  };

  PerfCounter.prototype.frame = function frame () {
    var t = window.performance.now();
    var e = t - this._time;
    this._total++;
    var avg = this._opts.average || 1000;

    if (e > avg) {
      this._value = this._total * 1000 / e;
      this._total = 0;
      this._time = t;
      this._average(this._value);
    }
  };

  return PerfCounter;
}(Counter));

var log1024 = Math.log(1024);
var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

function _bytesToSize (bytes) {
  var precision = 100;
  var i = Math.floor(Math.log(bytes) / log1024);
  if (bytes === 0) {
    return 'n/a';
  }
  return Math.round(bytes * precision / Math.pow(1024, i)) / precision + ' ' + sizes[i];
}

var MemoryCounter = (function (Counter$$1) {
  function MemoryCounter(stats, id, opts) {
    Counter$$1.call(this, id, opts);
    this._stats = stats;
    this._start = 0;

    if ( opts.extension.indexOf('memory.') === 0 ) {
      this._field = opts.extension.substring(7);
    }
  }

  if ( Counter$$1 ) MemoryCounter.__proto__ = Counter$$1;
  MemoryCounter.prototype = Object.create( Counter$$1 && Counter$$1.prototype );
  MemoryCounter.prototype.constructor = MemoryCounter;

  MemoryCounter.prototype.snapshot = function snapshot () {
    this._value = this._stats[this._field];
  };

  MemoryCounter.prototype.start = function start () {
    this._start = this._stats[this._field];
  };

  MemoryCounter.prototype.end = function end () {
    this._value = this._stats[this._field] - this._start;
  };

  MemoryCounter.prototype.human = function human () {
    return _bytesToSize(Counter$$1.prototype.human.call(this));
  };

  return MemoryCounter;
}(Counter));

var MemoryStats = function MemoryStats () {
  var memory = window.performance.memory;
  if (memory.totalJSHeapSize === 0) {
    console.warn('totalJSHeapSize === 0, performance.memory is only available in Chrome.');
  }

  this._used = 0;
  this._total = 0;
  this._lastUsed = 0;
};

var prototypeAccessors$1 = { alarm: {},used: {},total: {} };

MemoryStats.prototype.tick = function tick () {
  this._lastUsed = this._used;
  this._used = window.performance.memory.usedJSHeapSize;
  this._total = window.performance.memory.totalJSHeapSize;
};

prototypeAccessors$1.alarm.get = function () {
  // GC happens
  return this._used - this._lastUsed < 0;
};

prototypeAccessors$1.used.get = function () {
  return window.performance.memory.usedJSHeapSize;
};

prototypeAccessors$1.total.get = function () {
  return this._total;
};

MemoryStats.prototype.counter = function counter (id, opts) {
  return new MemoryCounter(this, id, opts);
};

Object.defineProperties( MemoryStats.prototype, prototypeAccessors$1 );

var extensions = {
  memory: MemoryStats,
};

var _canvasWidth = 100;
var _canvasHeight = 10;
var _css = "\n  .pstats {\n    position: fixed;\n    z-index: 9999;\n\n    padding: 5px;\n    width: " + (_canvasWidth+150) + "px;\n    right: 5px;\n    bottom: 5px;\n\n    font-size: 10px;\n    font-family: 'Roboto Condensed', tahoma, sans-serif;\n    overflow: hidden;\n    user-select: none;\n    cursor: default;\n\n    background: #222;\n    border-radius: 3px;\n  }\n\n  .pstats-container {\n    display: block;\n    position: relative;\n    color: #888;\n    white-space: nowrap;\n  }\n\n  .pstats-item {\n    position: absolute;\n    width: 250px;\n    height: 12px;\n    left: 0px;\n  }\n\n  .pstats-label {\n    position: absolute;\n    width: 150px;\n    height: 12px;\n    text-align: left;\n    transition: background 0.3s;\n  }\n\n  .pstats-label.alarm {\n    color: #ccc;\n    background: #800;\n\n    transition: background 0s;\n  }\n\n  .pstats-counter-id {\n    position: absolute;\n    width: 90px;\n    left: 0px;\n  }\n\n  .pstats-counter-value {\n    position: absolute;\n    width: 60px;\n    left: 90px;\n    text-align: right;\n  }\n\n  .pstats-canvas {\n    display: block;\n    position: absolute;\n    right: 0px;\n    top: 1px;\n  }\n\n  .pstats-fraction {\n    position: absolute;\n    width: 250px;\n    left: 0px;\n  }\n\n  .pstats-legend {\n    position: absolute;\n    width: 150px;\n\n    text-align: right;\n  }\n\n  .pstats-legend > span {\n    position: absolute;\n    right: 0px;\n  }\n";

// DISABLE:
// let cssFont = 'https://fonts.googleapis.com/css?family=Roboto+Condensed:400,700,300';
// let cssFontEL = document.createElement('link');
// cssFontEL.href = cssFont;
// cssFontEL.rel = 'stylesheet';
// cssFontEL.type = 'text/css';
// document.head.appendChild(cssFontEL);

// add global style
var styleEL = document.createElement('style');
styleEL.type = 'text/css';
styleEL.textContent = _css;
document.head.appendChild(styleEL);

var Stats = function Stats (dom, opts) {
  var this$1 = this;

  opts = opts || {};
  this._showGraph = opts.showGraph !== undefined ? opts._showGraph : true;
  this._values = opts.values || {};
  this._fractions = opts.fractions || [];
  this._id2counter = {};
  this._id2item = {};
  this._name2extStats = {};

  if (opts.css) {
    var styleEL = document.createElement('style');
    styleEL.type = 'text/css';
    styleEL.textContent = opts.css;
    document.head.appendChild(styleEL);
  }

  if (opts.extensions) {
    for (var i = 0; i < opts.extensions.length; ++i) {
      var name = opts.extensions[i];
      var ExtStats = extensions[name];
      if ( !ExtStats ) {
        console.warn(("Can not find extensions " + name + ", please register your extension via pstats.register()."));
        continue;
      }

      this$1._name2extStats[name] = new ExtStats();
    }
  }

  // ==================
  // DOM
  // ==================

  this._root = document.createElement('div');
  this._root.className = 'pstats';

  var containerEL = document.createElement('div');
  containerEL.className = 'pstats-container';

  this._root.appendChild(containerEL);

  var containerHeight = 0;

  // pstats-item
  for (var id in this$1._values) {
    var vopts = this$1._values[id];

    // .pstats-item
    var itemEL = document.createElement('div');
    itemEL.className = 'pstats-item';

    // .pstats-label
    var label = document.createElement('div');
    label.className = 'pstats-label';

    var spanId = document.createElement('span');
    spanId.className = 'pstats-counter-id';
    spanId.textContent = vopts.desc || id;

    var spanValue = document.createElement('div');
    spanValue.className = 'pstats-counter-value';

    var spanValueText = document.createTextNode('');
    spanValueText.nodeValue = '0';

    label.appendChild(spanId);
    label.appendChild(spanValue);
    spanValue.appendChild(spanValueText);
    itemEL.appendChild(label);

    // graph
    var graph = (void 0);
    if (this$1._showGraph) {
      if (vopts.min !== undefined || vopts.max !== undefined) {
        graph = new RangedGraph(itemEL, vopts.color, vopts.min || 0, vopts.max || 9999);
      } else if (vopts.threshold) {
        graph = new ThresholdGraph(itemEL, vopts.color);
      } else {
        graph = new AutoMaxGraph(itemEL, vopts.color);
      }
      graph.init(_canvasWidth - 5, _canvasHeight);
    }

    //
    this$1._id2item[id] = {
      label: label,
      valueText: spanValueText,
      graph: graph,
    };

    itemEL.style.top = containerHeight + "px";
    containerEL.appendChild(itemEL);

    containerHeight += 12;
  }

  // pstats-fraction
  if (this._showGraph && opts.fractions) {
    for ( var i$1 = 0; i$1 < opts.fractions.length; ++i$1 ) {
      var fraction = opts.fractions[i$1];
      var steps = fraction.steps;

      var height = steps.length * _canvasHeight + 2;

      fraction.colors = fraction.colors || ['#850700', '#c74900', '#fcb300', '#284280', '#4c7c0c'];

      var fractionEL = document.createElement('div');
      fractionEL.className = 'pstats-fraction';

      var legend = document.createElement('div');
      legend.className = 'pstats-legend';
      legend.style.height = height + "px";

      for (var h = 0; h < steps.length; ++h) {
        var p = document.createElement('span');
        p.textContent = steps[h];
        p.style.color = fraction.colors[h];
        p.style.top = (h * _canvasHeight) + "px";
        legend.appendChild(p);
      }

      fractionEL.appendChild(legend);
      fractionEL.style.height = height + "px";
      fractionEL.style.top = containerHeight + "px";

      var graph$1 = new StackGraph(fractionEL, fraction.colors);
      graph$1.init(_canvasWidth-5, _canvasHeight, steps.length);

      fraction.graph = graph$1;
      fraction.values = new Array(steps.length);

      containerEL.appendChild(fractionEL);

      containerHeight += steps.length * _canvasHeight + 2;
    }
  }

  containerEL.style.height = containerHeight + "px";
  this._root.style.height = containerHeight + "px";
  if (!this._showGraph) {
    this._root.style.width = '150px';
  }

  dom.appendChild(this._root);
};

Stats.prototype.item = function item (id) {
  if (!id) {
    return null;
  }

  var counter = this._id2counter[id];
  if (counter) {
    return counter;
  }

  var vopts = this._values[id];
  if (!vopts) {
    return null;
  }

  // if we have extension, use extension-counter
  if ( vopts.extension ) {
    var idx = vopts.extension.indexOf('.');
    var name = vopts.extension.substring(0,idx);
    var extStats = this._name2extStats[name];
    if (!extStats) {
      console.error(("extension " + name + " not found, make sure you have register and enable it."));
      return null;
    }

    counter = extStats.counter(id, vopts);
  } else {
    // default, use perf-counter
    counter = new PerfCounter(id, vopts);
  }

  this._id2counter[id] = counter;
  return counter;
};

Stats.prototype.tick = function tick () {
    var this$1 = this;

  // tick extensions
  for ( var name in this$1._name2extStats ) {
    var extStats = this$1._name2extStats[name];
    extStats.tick();
  }

  // values
  for (var id in this$1._values) {
    var counter = this$1._id2counter[id];
    if (counter) {
      counter.sample();
      var alarm = counter.alarm();
      var human = counter.human();

      var item = this$1._id2item[id];
      item.label.classList.toggle('alarm', alarm > 0);
      item.valueText.nodeValue = human;
      if (this$1._showGraph) {
        item.graph.draw(counter.value, alarm);
      }
    }
  }

  // fractions
  if (this._showGraph) {
    for (var i = 0; i < this._fractions.length; ++i) {
      var fraction = this$1._fractions[i];
      var baseCounter = this$1._id2counter[fraction.base];
      if (baseCounter) {
        var steps = fraction.steps;

        for (var j = 0; j < steps.length; ++j) {
          var id$1 = steps[j];
          var counter$1 = this$1._id2counter[id$1];
          if (counter$1) {
            fraction.values[j] = counter$1.value / baseCounter.value;
          }
        }
        fraction.graph.draw(fraction.values);
      }
    }
  }
};

polyfill();

var pstats = {
  new: function new$1 (dom, settings) {
    var stats = new Stats(dom, settings);
    return function (id) {
      if (!id) {
        return stats;
      }

      return stats.item(id);
    };
  },

  register: function register(name, ext) {
    extensions[name] = ext;
  },
};

module.exports = pstats;
//# sourceMappingURL=pstats.js.map
