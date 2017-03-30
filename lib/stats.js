import Graph from './graph';
import StackGraph from './stack-graph';
import PerfCounter from './perf-counter';

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

  .pstats-caption {
    display: flex;
    flex-direction: row;
    flex: 1;

    text-align: left;
    margin-right: 5px;
  }

  .pstats-counter-id {
    flex: 1;
  }

  .pstats-counter-value {
    width: 30px;
    text-align: right;
  }
`;

export default class Stats {
  constructor (dom, opts) {
    opts = opts || {};
    this._colors = opts.colors || ['#850700', '#c74900', '#fcb300', '#284280', '#4c7c0c'];
    this._values = opts.values || {};
    this._fractions = opts.fractions || [];
    this._id2perf = {};
    this._id2item = {};

    // DISABLE:
    // let cssFont = 'https://fonts.googleapis.com/css?family=Roboto+Condensed:400,700,300';
    // let cssFontEL = document.createElement('link');
    // cssFontEL.href = cssFont;
    // cssFontEL.rel = 'stylesheet';
    // cssFontEL.type = 'text/css';
    // document.head.appendChild(cssFontEL);

    let css = opts.css || _css;
    let styleEL = document.createElement('style');
    styleEL.type = 'text/css';
    styleEL.textContent = css;
    document.head.appendChild(styleEL);

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

    // TODO
    // if (opts.fractions) {
    //   for ( let i = 0; i < opts.fractions.length; ++i ) {
    //     let f = opts.fractions[i];
    //     let div = document.createElement('div');
    //     div.className = 'rs-fraction';
    //     let legend = document.createElement('div');
    //     legend.className = 'rs-legend';

    //     let h = 0;
    //     for (let h = 0; h < f.steps.length; ++h) {
    //       let p = document.createElement('p');
    //       p.textContent = f.steps[h];
    //       p.style.color = opts.colors[h];
    //       legend.appendChild(p);
    //     }

    //     div.appendChild(legend);
    //     div.style.height = h * _elHeight + 'px';
    //     f.div = div;

    //     let graph = new StackGraph(div);
    //     graph.init(_elWidth, _elHeight, h);

    //     f.graph = graph;
    //     containerEL.appendChild(div);
    //   }
    // }

    // DOM

    this._root = document.createElement('div');
    this._root.className = 'pstats';

    let containerEL = document.createElement('div');
    containerEL.className = 'pstats-container';

    this._root.appendChild(containerEL);

    for (let id in this._values) {
      let vopts = this._values[id];

      // .pstats-item
      let itemEL = document.createElement('div');
      itemEL.className = 'pstats-item';

      // .pstats-caption
      let caption = document.createElement('div');
      caption.className = 'pstats-caption';

      let spanId = document.createElement('span');
      spanId.className = 'pstats-counter-id';
      spanId.textContent = vopts.caption || id;

      let spanValue = document.createElement('div');
      spanValue.className = 'pstats-counter-value';

      let spanValueText = document.createTextNode('');
      spanValueText.nodeValue = '0';

      caption.appendChild(spanId);
      caption.appendChild(spanValue);
      spanValue.appendChild(spanValueText);
      itemEL.appendChild(caption);

      // graph
      let graph = new Graph(itemEL, vopts.color);
      graph.init(_canvasWidth, _canvasHeight);

      //
      this._id2item[id] = {
        item: itemEL,
        valueText: spanValueText,
        graph,
      };

      containerEL.appendChild(itemEL);
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
    // TODO:
    // iterateKeys(this._opts.plugins, function (j) {
    //   this._opts.plugins[j].update();
    // });

    for (let id in this._values) {
      let perf = this._id2perf[id];
      if (perf) {
        let av = perf.sampleAverage();
        let alarm = perf.sampleAlarm();
        let item = this._id2item[id];

        item.valueText.nodeValue = av;
        item.graph.draw(perf.value, alarm);
      }
    }

    // TODO:
    // if (this._opts && this._opts.fractions) {
    //   iterateKeys(this._opts.fractions, function (j) {
    //     let f = this._opts.fractions[parseInt(j, 10)];
    //     let v = [];
    //     let base = _id2perf[f.base.toLowerCase()];
    //     if (base) {
    //       base = base.value();
    //       iterateKeys(this._opts.fractions[j].steps, function (k) {
    //         let s = this._opts.fractions[j].steps[parseInt(k, 10)].toLowerCase();
    //         let val = _id2perf[s];
    //         if (val) {
    //           v.push(val.value() / base);
    //         }
    //       });
    //     }
    //     f.graph.draw(v);
    //   });
    // }
  }
}