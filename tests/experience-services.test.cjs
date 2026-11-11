const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm"),
  T = require("three");
function node(tag = "div") {
  return {
    tagName: tag.toUpperCase(),
    style: {},
    children: [],
    open: false,
    appendChild(n) {
      this.children.push(n);
      return n;
    },
    replaceChildren() {
      this.children = [];
    },
    setAttribute() {},
    addEventListener() {},
    showModal() {
      this.open = true;
    },
    close() {
      this.open = false;
    },
  };
}
function harness() {
  const nodes = [],
    data = new Map(),
    scene = new T.Scene(),
    cityGroup = new T.Group();
  scene.add(cityGroup);
  let now = 1000;
  const c = {
    window: null,
    THREE: T,
    localStorage: {
      getItem: (k) => data.get(k),
      setItem: (k, v) => data.set(k, v),
    },
    document: {
      body: {
        appendChild: (n) => nodes.push(n),
        classList: { add() {}, remove() {} },
      },
      createElement: node,
      exitPointerLock() {},
    },
    performance: { now: () => now },
    state: "play",
    mpRole: null,
    player: { x: 120, y: 180, hp: 40, maxHp: 100, car: null, dead: false },
    mouse: { down: false },
    keys: {},
    city: {
      world: true,
      venues: [
        { id: "business", doorX: 120, doorY: 180 },
        { id: "business", southern: "manor", doorX: 120, doorY: 180 },
        { id: "business", southern: "sawmill", doorX: 120, doorY: 180 },
        { id: "business", southern: "federal", doorX: 120, doorY: 180 },
      ],
      nolaLandmarks: { sites: { park: { x: 0, y: 0 } } },
    },
    scene,
    cityGroup,
    camera: new T.PerspectiveCamera(),
    vmScene: new T.Scene(),
    moverCtx: null,
    view: {},
    zombies: [],
    parts: [],
    cash: 5000,
    frame: 0,
    mission: null,
    gun: null,
    curW: "m240",
    level29Progression: { viewModel: () => null },
    level29RuntimePolicy: require("../public/game/runtime-policy.js"),
    addEventListener() {},
    terrainHeight: () => 0,
    solidAt: () => false,
    blockedCircle: () => false,
    serviceVenue() {},
    spawnZombieAt() {
      return {};
    },
    hurtPlayer(n) {
      c.player.hp -= n;
    },
    passMission() {
      c.mission.phase = "done";
    },
    beginMission() {},
    syncViewModel() {},
    update() {
      c.frame++;
    },
    buildCity() {},
    killPlayer() {
      c.player.dead = true;
    },
    ambientSpawn() {},
    extraBlips: () => [],
    zombieGoal: (z, x, y) => ({ x, y }),
    tileAt: () => 0,
    T_WATER: 4,
    T_BLD: 2,
    T_LOT: 3,
    hitRect: (x, y, r, b) =>
      x + r > b.x && x - r < b.x + b.w && y + r > b.y && y - r < b.y + b.h,
    toast() {},
    makeZombie: (x, y) => ({ x, y, hp: 3, alive: true }),
    makeFigure: () => new T.Group(),
    setFigureColors() {},
    snapCamera() {},
    giveW(id, n) {
      c.granted = { id, n };
    },
  };
  c.window = c;
  vm.createContext(c);
  vm.runInContext(
    fs.readFileSync("public/game/survival-expansion.js", "utf8"),
    c,
  );
  const modal = nodes[0];
  return {
    c,
    modal,
    data,
    tick(seconds = 0.05) {
      now += seconds * 1000;
      c.update();
    },
    click(prefix) {
      const b = modal.children.find(
        (n) => n.tagName === "BUTTON" && n.textContent.startsWith(prefix),
      );
      assert.ok(b, "Missing " + prefix);
      b.onclick();
    },
  };
}
test("apothecary purchases debit actual cash, apply heal/buffs and reject unaffordable crafting", () => {
  const h = harness();
  h.c.serviceVenue();
  h.click("Herbal poultice");
  assert.equal(h.c.player.hp, 75);
  assert.equal(h.c.cash, 4925);
  h.click("Cypress tonic");
  assert.equal(h.c.level29SurvivalExpansion.buffs.tonic, 60);
  h.c.cash = 0;
  h.click("Swamp charm");
  assert.equal(h.c.level29SurvivalExpansion.buffs.charm, 0);
  h.click("BACK");
  h.click("BACK TO GAME");
  assert.equal(h.c.state, "play");
});
test("manor requires cleared encounter and gallery proximity, pays once, enters basement and restores street", () => {
  const h = harness(),
    outdoor = { x: 1, y: 1, alive: true };
  h.c.zombies.push(outdoor);
  h.c.level29SurvivalExpansion.show();
  h.click("PLANTATION RUINS");
  assert.equal(h.c.cityGroup.visible, false);
  assert.equal(h.c.zombies.length, 3);
  h.c.level29SurvivalExpansion.show();
  assert(
    !h.modal.children.some((n) => n.textContent?.startsWith("ENTER HIDDEN")),
  );
  h.click("BACK TO GAME");
  for (const z of h.c.zombies) z.alive = false;
  h.c.player.x = 14620;
  h.c.player.y = 14522;
  h.c.level29SurvivalExpansion.show();
  h.click("ENTER HIDDEN");
  assert.equal(h.c.granted.id, "sniper29");
  assert.equal(h.c.cash, 6800);
  assert.equal(h.c.terrainHeight(h.c.player.x, h.c.player.y), -48);
  h.click("BACK TO GAME");
  h.c.serviceVenue();
  h.click("RETURN TO STREET");
  assert.equal(h.c.cityGroup.visible, true);
  assert.equal(h.c.player.x, 120);
  assert.equal(h.c.player.y, 180);
  assert.equal(h.c.zombies.length, 1);
  assert.equal(h.c.zombies[0], outdoor);
  assert.equal(h.c.scene.children.length, 1);
});
test("jail door breach completes during play, rescue pays once, and death releases the instance", () => {
  const h = harness();
  h.c.level29SurvivalExpansion.show();
  h.click("PARISH LOCKDOWN");
  h.c.level29SurvivalExpansion.show();
  h.click("BREACH REINFORCED");
  for (let i = 0; i < 61; i++) h.tick();
  for (const z of h.c.zombies) z.alive = false;
  h.c.player.x = 14585;
  h.c.player.y = 14580;
  h.c.level29SurvivalExpansion.show();
  h.click("RELEASE TRAPPED");
  assert.equal(h.c.cash, 7200);
  h.click("RELEASE TRAPPED");
  assert.equal(h.c.cash, 7200);
  h.click("BACK TO GAME");
  h.c.killPlayer();
  assert.equal(h.c.level29SurvivalExpansion.active, null);
  assert.equal(h.c.scene.children.length, 1);
  assert.equal(h.c.cityGroup.visible, true);
});
