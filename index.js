import polyfill from './lib/polyfill';
import Stats from './lib/stats';
import extensions from './lib/extensions/index';

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

  register(name, ext) {
    extensions[name] = ext;
  },
};

export default pstats;