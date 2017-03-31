import Counter from '../counter';

const log1024 = Math.log(1024);
const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

function _bytesToSize (bytes) {
  let precision = 100;
  let i = Math.floor(Math.log(bytes) / log1024);
  if (bytes === 0) {
    return 'n/a';
  }
  return Math.round(bytes * precision / Math.pow(1024, i)) / precision + ' ' + sizes[i];
}

class MemoryCounter extends Counter {
  constructor(stats, id, opts) {
    super(id, opts);
    this._stats = stats;
    this._start = 0;

    if ( opts.extension.indexOf('memory.') === 0 ) {
      this._field = opts.extension.substring(7);
    }
  }

  snapshot () {
    this._value = this._stats[this._field];
  }

  start() {
    this._start = this._stats[this._field];
  }

  end() {
    this._value = this._stats[this._field] - this._start;
  }

  human () {
    return _bytesToSize(super.human());
  }

  // alarm () {
  //   return this._stats.alarm;
  // }
}

export default class MemoryStats {
  constructor () {
    let memory = window.performance.memory;
    if (memory.totalJSHeapSize === 0) {
      console.warn('totalJSHeapSize === 0, performance.memory is only available in Chrome.');
    }

    this._used = 0;
    this._total = 0;
    this._lastUsed = 0;
  }

  tick () {
    let cur = window.performance.memory.usedJSHeapSize;
    this._lastUsed = this._used;
    this._used = cur;
    this._total = window.performance.memory.totalJSHeapSize;
  }

  get alarm() {
    // GC happens
    return this._used - this._lastUsed < 0;
  }

  get used() {
    return this._used;
  }

  get total() {
    return this._total;
  }

  counter(id, opts) {
    return new MemoryCounter(this, id, opts);
  }
}