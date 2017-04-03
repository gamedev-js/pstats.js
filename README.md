## pstats.js

Visualizing and monitor your performance.

Inspired by [rStats.js](https://github.com/spite/rstats).

![pstats.js](https://cloud.githubusercontent.com/assets/174891/24576848/ba461464-16f5-11e7-8599-3ec33f23d694.png)

## Install

```bash
npm install pstats.js
```

## Usage

```javascript
let stats = pstats.new(document.body, {
  values: {
    frame: { desc: 'Total frame time (ms)', over: 18, average: 100 },
    raf: { desc: 'Time since last rAF (ms)', average: 100 },
    fps: { desc: 'Framerate (FPS)', below: 30, average: 500 },
    render1: { desc: 'WebGL Render 01 (ms)' },
    render2: { desc: 'WebGL Render 02 (ms)' },
    user01: { desc: 'User Value 01 (ranged)', min: -1, max: 1, color: '#080' },
    user02: { desc: 'User Value 02 (threshold)', color: '#09f', threshold: true },
    memory: { desc: 'Memory', extension : 'memory.used', average: 1000, threshold: true },
  },
  fractions: [
    { base: 'frame', steps: ['render1', 'render2'] },
    { base: 'frame', steps: ['render1', 'render2'], colors: ['#09f', '#f90'] },
  ],
  extensions: [
    'memory'
  ],
});

function delay() {
  let d = Math.random() * 10;
  let now = Date.now();
  let s = now + d;
  while (now < s) {
    now = Date.now();
  }
}

let t = 0;

function render() {
  stats('frame').start();
    stats('memory').snapshot();
    stats('raf').tick();
    stats('fps').frame();

    stats('render1').start();
      delay();
    stats('render1').end();

    stats('render2').start();
      delay();
    stats('render2').end();

    stats('user01').value = Math.sin(t);
    stats('user02').value = Math.pow(t % 10, 3);
    t += 0.1;
  stats('frame').end();

  stats().tick();
  requestAnimationFrame(render);
}

render();
```

## Documentation

TODO

## License

MIT © 2017 Johnny Wu