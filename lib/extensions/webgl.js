import Counter from '../counter';

let _hacked = false;
let _totalDrawArraysCalls = 0;
let _totalDrawElementsCalls = 0;
let _totalUseProgramCalls = 0;
let _totalFaces = 0;
let _totalVertices = 0;
let _totalPoints = 0;
let _totalBindTexures = 0;

function _hackWebGL() {
  if (_hacked) {
    return;
  }

  _hacked = true;

  function _h(f, c) {
    return function () {
      c.apply(this, arguments);
      f.apply(this, arguments);
    };
  }

  WebGLRenderingContext.prototype.drawArrays = _h(WebGLRenderingContext.prototype.drawArrays, function () {
    _totalDrawArraysCalls++;
    if (arguments[0] == this.POINTS) _totalPoints += arguments[2];
    else _totalVertices += arguments[2];
  });

  WebGLRenderingContext.prototype.drawElements = _h(WebGLRenderingContext.prototype.drawElements, function () {
    _totalDrawElementsCalls++;
    _totalFaces += arguments[1] / 3;
    _totalVertices += arguments[1];
  });

  WebGLRenderingContext.prototype.useProgram = _h(WebGLRenderingContext.prototype.useProgram, function () {
    _totalUseProgramCalls++;
  });

  WebGLRenderingContext.prototype.bindTexture = _h(WebGLRenderingContext.prototype.bindTexture, function () {
    _totalBindTexures++;
  });
}

class WebglCounter extends Counter {
  constructor(stats, id, opts) {
    super(id, opts);
    this._stats = stats;
    this._start = 0;

    if ( opts.extension.indexOf('webgl.') === 0 ) {
      this._field = opts.extension.substring(6);
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
}

export default class WebGLStats {
  constructor () {
    _hackWebGL();
  }

  tick () {
    _totalDrawArraysCalls = 0;
    _totalDrawElementsCalls = 0;
    _totalUseProgramCalls = 0;
    _totalFaces = 0;
    _totalVertices = 0;
    _totalPoints = 0;
    _totalBindTexures = 0;
  }

  counter(id, opts) {
    return new WebglCounter(this, id, opts);
  }

  get drawcalls () {
    return _totalDrawArraysCalls + _totalDrawElementsCalls;
  }

  get drawArrays () {
    return _totalDrawArraysCalls;
  }

  get drawElements () {
    return _totalDrawElementsCalls;
  }

  get faces () {
    return _totalFaces;
  }

  get vertices () {
    return _totalVertices;
  }

  get points () {
    return _totalPoints;
  }

  get programs () {
    return _totalUseProgramCalls;
  }

  get textures () {
    return _totalBindTexures;
  }
}