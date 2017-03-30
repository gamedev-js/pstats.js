import polyfill from './lib/polyfill';
import Stats from './lib/stats';

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

export default pstats;