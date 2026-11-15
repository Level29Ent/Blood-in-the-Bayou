const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// Exercise the shipped loop, with realistic update CPU cost rather than a frozen clock.
function runtime(updateCost = 10, fps = 30) {
  let cpu = 0, updates = 0, renders = 0, scheduled = 0;
  const context = {
    performance: { now: () => cpu },
    document: { hidden: false },
    requestAnimationFrame() { scheduled++; },
    window: { level29RuntimePolicy: { budget: { fps } } },
    mpRole: null, state: 'play',
    update() { updates++; cpu += updateCost; },
    render() { renders++; },
    updateMusic() {}, updateEngine() {}, console,
  };
  vm.createContext(context);
  const code = fs.readFileSync('public/game/game.js', 'utf8');
  vm.runInContext(code.slice(code.indexOf('let last = performance.now(), accT = 0;')), context);
  return {
    context,
    tick(now) { cpu = now; context.loop(now); },
    get updates() { return updates; },
    get renders() { return renders; },
    get scheduled() { return scheduled; },
  };
}

for (const hz of [20, 30, 60, 120]) {
  test(`10ms updates preserve gameplay speed at ${hz}Hz without extra rendering`, () => {
    const r = runtime();
    for (let i = 1; i <= hz * 10; i++) r.tick(i * 1000 / hz);
    assert.ok(r.updates >= 599 && r.updates <= 600, `expected ~600 updates, got ${r.updates}`);
    const expectedRenders = Math.min(hz, 30) * 10;
    assert.ok(Math.abs(r.renders - expectedRenders) <= 1);
    assert.equal(r.scheduled, hz * 10);
  });
}

test('long stalls remain bounded to three fixed steps with no growing catch-up debt', () => {
  const r = runtime(25);
  for (let i = 1; i <= 10; i++) {
    const before = r.updates;
    r.tick(i * 5000);
    assert.ok(r.updates - before >= 2 && r.updates - before <= 3);
    assert.ok(vm.runInContext('accT', r.context) < 1000 / 60);
  }
});

test('hidden tabs, ads, lost contexts and halted guards discard elapsed time before resuming', () => {
  for (const blocked of ['hidden', 'bayouAdActive', 'level29RuntimeResources', 'level29CrashGuard']) {
    const r = runtime();
    r.tick(1000 / 30);
    const before = [r.updates, r.renders];
    if (blocked === 'hidden') r.context.document.hidden = true;
    else r.context.window[blocked] = blocked === 'level29RuntimeResources' ? { lost: true }
      : blocked === 'level29CrashGuard' ? { halted: true } : true;
    r.tick(5000);
    assert.deepEqual([r.updates, r.renders], before);
    if (blocked === 'hidden') r.context.document.hidden = false;
    else delete r.context.window[blocked];
    r.tick(5000 + 1000 / 60);
    assert.equal(r.updates - before[0], 1);
  }
});

test('intentional single-player time scale remains intact; multiplayer ignores it', () => {
  for (const mpRole of [null, 'host']) {
    const r = runtime();
    r.context.mpRole = mpRole;
    r.context.window.level29TimeScale = .5;
    for (let i = 1; i <= 300; i++) r.tick(i * 1000 / 30);
    const expected = mpRole ? 600 : 300;
    assert.ok(Math.abs(r.updates - expected) <= 1);
  }
});
