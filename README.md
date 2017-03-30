## pstats

Visualizing and monitor your performance.

Inspired by [rStats.js](https://github.com/spite/rstats).

![pstats](https://cloud.githubusercontent.com/assets/174891/24514019/6f1543b2-15a5-11e7-9656-5b2c8f1758d2.png)

## Install

```bash
npm install pstats
```

## Usage

```javascript
let stats = pstats.new(document.body, {
  values: {
    frame: { desc: 'Total frame time (ms)', over: 18 },
    raf: { desc: 'Time since last rAF (ms)' },
    fps: { desc: 'Framerate (FPS)', below: 30 },
    render1: { desc: 'WebGL Render 01 (ms)' },
    render2: { desc: 'WebGL Render 02 (ms)' },
  },
  fractions: [
    { base: 'frame', steps: ['render1', 'render2'] }
  ],
});

function render() {
  stats('frame').start();
    stats('raf').tick();
    stats('fps').frame();

    stats('render1').start();
    stats('render1').end();

    stats('render2').start();
    stats('render2').end();
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