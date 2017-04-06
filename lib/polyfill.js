export default function polyfill() {
  if (typeof window.performance === 'undefined') {
    window.performance = {};
  }

  if (!window.performance.now) {

    let nowOffset = Date.now();

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