import AutoMaxGraph from './auto-max-graph';
import ThresholdGraph from './threshold-graph';
import RangedGraph from './ranged-graph';
import StackGraph from './stack-graph';
import PerfCounter from './perf-counter';
import extensions from './extensions/index';

let _canvasWidth = 100;
let _canvasHeight = 10;
let _css = `
  .pstats {
    position: fixed;
    z-index: 9999;

    padding: 5px;
    width: ${_canvasWidth+150}px;
    right: 5px;
    bottom: 5px;

    font-size: 10px;
    font-family: 'Roboto Condensed', tahoma, sans-serif;
    overflow: hidden;
    user-select: none;
    cursor: default;

    background: #222;
    border-radius: 3px;
  }

  .pstats-container {
    display: block;
    position: relative;
    color: #888;
    white-space: nowrap;
  }

  .pstats-item {
    position: absolute;
    width: 250px;
    height: 12px;
    left: 0px;
  }

  .pstats-label {
    position: absolute;
    width: 150px;
    height: 12px;
    text-align: left;
    transition: background 0.3s;
  }

  .pstats-label.alarm {
    color: #ccc;
    background: #800;

    transition: background 0s;
  }

  .pstats-counter-id {
    position: absolute;
    width: 90px;
    left: 0px;
  }

  .pstats-counter-value {
    position: absolute;
    width: 60px;
    left: 90px;
    text-align: right;
  }

  .pstats-canvas {
    display: block;
    position: absolute;
    right: 0px;
    top: 1px;
  }

  .pstats-fraction {
    position: absolute;
    width: 250px;
    left: 0px;
  }

  .pstats-legend {
    position: absolute;
    width: 150px;

    text-align: right;
  }

  .pstats-legend > span {
    position: absolute;
    right: 0px;
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

export default class Stats {
  /**
   * @param {HTMLElement} dom
   * @param {object} opts
   * @param {boolean} opts.showGraph
   * @param {object} opts.values
   * @param {array} opts.fractions
   * @param {array} opts.extensions
   *
   * value
   * @param {string} value.desc - description
   * @param {string} value.color - color
   * @param {number} value.over - alarm when monitor value over the given value
   * @param {number} value.below - alarm when monitor value below the given value
   * @param {number} value.average - time in milliseconds
   * @param {number} value.min - min value
   * @param {number} value.max - max value
   * @param {boolean} value.threshold - use auto threshold graph
   * @param {string} value.extension - extension field to monitor
   *
   * fraction
   * @param {array} value.colors - color map
   * @param {string} fraction.base - value id use as base value for compare
   * @param {array} fraction.steps - value ids used for compare
   */
  constructor (dom, opts) {
    opts = opts || {};
    this._showGraph = opts.showGraph !== undefined ? opts._showGraph : true;
    this._values = opts.values || {};
    this._fractions = opts.fractions || [];
    this._id2counter = {};
    this._id2item = {};
    this._name2extStats = {};

    if (opts.css) {
      let styleEL = document.createElement('style');
      styleEL.type = 'text/css';
      styleEL.textContent = opts.css;
      document.head.appendChild(styleEL);
    }

    if (opts.extensions) {
      for (let i = 0; i < opts.extensions.length; ++i) {
        let name = opts.extensions[i];
        let ExtStats = extensions[name];
        if ( !ExtStats ) {
          console.warn(`Can not find extensions ${name}, please register your extension via pstats.register().`);
          continue;
        }

        this._name2extStats[name] = new ExtStats();
      }
    }

    // ==================
    // DOM
    // ==================

    this._root = document.createElement('div');
    this._root.className = 'pstats';

    let containerEL = document.createElement('div');
    containerEL.className = 'pstats-container';

    this._root.appendChild(containerEL);

    let containerHeight = 0;

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
      let graph;
      if (this._showGraph) {
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
      this._id2item[id] = {
        label: label,
        valueText: spanValueText,
        graph,
      };

      itemEL.style.top = `${containerHeight}px`;
      containerEL.appendChild(itemEL);

      containerHeight += 12;
    }

    // pstats-fraction
    if (this._showGraph && opts.fractions) {
      for ( let i = 0; i < opts.fractions.length; ++i ) {
        let fraction = opts.fractions[i];
        let steps = fraction.steps;

        let height = steps.length * _canvasHeight + 2;

        fraction.colors = fraction.colors || ['#850700', '#c74900', '#fcb300', '#284280', '#4c7c0c'];

        let fractionEL = document.createElement('div');
        fractionEL.className = 'pstats-fraction';

        let legend = document.createElement('div');
        legend.className = 'pstats-legend';
        legend.style.height = `${height}px`;

        for (let h = 0; h < steps.length; ++h) {
          let p = document.createElement('span');
          p.textContent = steps[h];
          p.style.color = fraction.colors[h];
          p.style.top = `${h * _canvasHeight}px`;
          legend.appendChild(p);
        }

        fractionEL.appendChild(legend);
        fractionEL.style.height = `${height}px`;
        fractionEL.style.top = `${containerHeight}px`;

        let graph = new StackGraph(fractionEL, fraction.colors);
        graph.init(_canvasWidth-5, _canvasHeight, steps.length);

        fraction.graph = graph;
        fraction.values = new Array(steps.length);

        containerEL.appendChild(fractionEL);

        containerHeight += steps.length * _canvasHeight + 2;
      }
    }

    containerEL.style.height = `${containerHeight}px`;
    this._root.style.height = `${containerHeight}px`;
    if (!this._showGraph) {
      this._root.style.width = '150px';
    }

    dom.appendChild(this._root);
  }

  item(id) {
    if (!id) {
      return null;
    }

    let counter = this._id2counter[id];
    if (counter) {
      return counter;
    }

    let vopts = this._values[id];
    if (!vopts) {
      return null;
    }

    // if we have extension, use extension-counter
    if ( vopts.extension ) {
      let idx = vopts.extension.indexOf('.');
      let name = vopts.extension.substring(0,idx);
      let extStats = this._name2extStats[name];
      if (!extStats) {
        console.error(`extension ${name} not found, make sure you have register and enable it.`);
        return null;
      }

      counter = extStats.counter(id, vopts);
    } else {
      // default, use perf-counter
      counter = new PerfCounter(id, vopts);
    }

    this._id2counter[id] = counter;
    return counter;
  }

  tick() {
    // tick extensions
    for ( let name in this._name2extStats ) {
      let extStats = this._name2extStats[name];
      extStats.tick();
    }

    // values
    for (let id in this._values) {
      let counter = this._id2counter[id];
      if (counter) {
        counter.sample();
        let alarm = counter.alarm();
        let human = counter.human();

        let item = this._id2item[id];
        item.label.classList.toggle('alarm', alarm > 0);
        item.valueText.nodeValue = human;
        if (this._showGraph) {
          item.graph.draw(counter.value, alarm);
        }
      }
    }

    // fractions
    if (this._showGraph) {
      for (let i = 0; i < this._fractions.length; ++i) {
        let fraction = this._fractions[i];
        let baseCounter = this._id2counter[fraction.base];
        if (baseCounter) {
          let steps = fraction.steps;

          for (let j = 0; j < steps.length; ++j) {
            let id = steps[j];
            let counter = this._id2counter[id];
            if (counter) {
              fraction.values[j] = counter.value / baseCounter.value;
            }
          }
          fraction.graph.draw(fraction.values);
        }
      }
    }
  }
}