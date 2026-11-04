const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
function setup() {
  let clock = 0;
  const calls = [], events = {}, overlay = { style: {}, setAttribute() {} };
  const context = {
    window: { addEventListener: (name, fn) => { events[name] = fn; }, bayouAds: { setSound() {}, levelComplete(hooks) { calls.push('request'); context.hooks = hooks; return true; } } },
    document: { createElement: () => overlay, body: { appendChild() {} }, querySelectorAll: () => [] },
    Date: { now: () => clock },
    state: 'talk', mission: { phase: 'start', info: { i: 1 } }, completed: new Set([0]), mpRole: '', player: { car: null },
    spotifyPlaying: false, spotifyFallback: false,
    soundMode: 1, actx: { state: 'running', suspend: () => { calls.push('suspend'); return Promise.resolve(); }, resume: () => { calls.push('resume'); return Promise.resolve(); } },
    rbStopVoice() { calls.push('stopVoice'); }, keys: { e: true }, mouse: { down: true }, stick: { x: 1, y: 1 },
    rbAct: action => calls.push(action), setSoundMode: mode => { context.soundMode = mode; },
  };
  vm.runInNewContext(fs.readFileSync('public/game/ad-transitions.js', 'utf8'), context);
  return { context, calls, events, advance: () => { clock += 180001; } };
}
test('mission one, multiplayer, Spotify, and initial cooldown never request an ad', () => {
  const s = setup(); s.context.rbAct('take'); assert.deepEqual(s.calls, ['take']);
  s.advance(); s.context.mpRole = 'host'; s.context.rbAct('take');
  s.context.mpRole = ''; s.context.spotifyFallback = true; s.context.rbAct('take');
  s.context.spotifyFallback = false; s.context.completed.clear(); s.context.mission.info.i = 0; s.context.rbAct('take');
  assert.deepEqual(s.calls, ['take', 'take', 'take', 'take']);
});
test('no fill continues exactly once without muting or pausing', () => {
  const s = setup(); s.advance(); s.context.rbAct('take'); s.context.rbAct('take');
  assert.deepEqual(s.calls, ['request']); s.context.hooks.done({ breakStatus: 'noAdPreloaded' });
  assert.deepEqual(s.calls, ['request', 'take']); assert.equal(s.context.window.bayouAdActive, undefined);
});
test('actual ad freezes input, saves mute mode, and restores before mission starts', () => {
  const s = setup(); s.advance(); s.context.rbAct('take'); s.context.hooks.pauseAndMute();
  assert.equal(s.context.window.bayouAdActive, true); assert.equal(s.context.soundMode, 2);
  let blocked = 0; s.events.click({ target: { closest: () => true }, preventDefault: () => blocked++, stopImmediatePropagation: () => blocked++ }); assert.equal(blocked, 2);
  assert.equal(s.context.keys.e, false); assert.equal(s.context.mouse.down, false);
  s.context.hooks.restore(); s.context.hooks.done({ breakStatus: 'viewed' });
  assert.equal(s.context.soundMode, 1); assert.equal(s.context.window.bayouAdActive, false);
  assert.deepEqual(s.calls, ['request', 'stopVoice', 'suspend', 'resume', 'take']);
});
test('disabled backend falls through; stale mission callbacks cannot start a new mission', () => {
  const s = setup(); s.advance(); s.context.window.bayouAds.levelComplete = () => false; s.context.rbAct('take'); assert.deepEqual(s.calls, ['take']);
  const other = setup(); other.advance(); other.context.rbAct('take'); other.context.mission = {};
  other.context.hooks.done({ breakStatus: 'viewed' }); assert.deepEqual(other.calls, ['request']);
});

test('web ad controls are not covered or blocked by the gameplay input guard', () => {
  const s = setup(); s.advance(); s.context.rbAct('take'); s.context.hooks.pauseAndMute();
  let blocked = false;
  s.events.click({ target: { closest: () => null }, preventDefault: () => { blocked = true; }, stopImmediatePropagation() {} });
  assert.equal(blocked, false);
});
