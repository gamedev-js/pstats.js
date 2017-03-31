import Graph from './graph';
import StackGraph from './stack-graph';
import PerfCounter from './perf-counter';
import extensions from './extensions/index';

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

    background: #222;
    border-radius: 3px;

  }

  .pstats-container {
    display: flex;
    flex-direction: column;
    color: #888;
    white-space: nowrap;
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
    flex: 1;
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
export default class Stats {
  constructor (dom, opts) {
    opts = opts || {};
    this._colors = opts.colors || ['#850700', '#c74900', '#fcb300', '#284280', '#4c7c0c'];
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

        let graph = new StackGraph(fractionEL, this._colors);
        graph.init(_canvasWidth, _canvasHeight, steps.length);

        fraction.graph = graph;
        fraction.values = new Array(steps.length);

        containerEL.appendChild(fractionEL);
      }
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
        item.graph.draw(counter.value, alarm);
      }
    }

    // fractions
    for ( let i = 0; i < this._fractions.length; ++i ) {
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