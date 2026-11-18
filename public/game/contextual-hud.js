'use strict';
// LEVEL 29 Contextual HUD & Control Prompts
// Dynamically shows relevant on-screen control prompts only when applicable:
// [E] Enter/Exit Vehicle near cars, [U] Haul Net / Fish at water & fishing spots,
// and number-key build prompts only while in LEVEL 29 CONSTRUCTION mode.
(function(root){
  const BUILD_ITEMS = [
    { id:'barrier', name:'Sandbag Barrier', key:'1', cost:50, w:28, h:10, d:8, col:'#8d7857' },
    { id:'light', name:'Work Floodlight', key:'2', cost:75, w:6, h:28, d:6, col:'#ffde59', light:true },
    { id:'crate', name:'Supply Crate', key:'3', cost:100, w:14, h:14, d:14, col:'#5c6f55' },
    { id:'barricade', name:'Concrete Barricade', key:'4', cost:120, w:32, h:14, d:10, col:'#cfc9b8' },
    { id:'turret', name:'Defense Turret', key:'5', cost:250, w:16, h:22, d:16, col:'#384852' }
  ];

  const constructed = [];
  let isConstructionActive = false;

  function toggleConstruction(){
    if(typeof state!=='undefined'&&state!=='play')return false;
    isConstructionActive = !isConstructionActive;
    if(typeof sfx==='function') sfx('door');
    if(typeof toast==='function'){
      toast(isConstructionActive ? 'LEVEL 29 CONSTRUCTION MODE · ACTIVE' : 'CONSTRUCTION MODE CLOSED');
    }
    updatePromptUI();
    return isConstructionActive;
  }

  function placeStructure(idx){
    const item = BUILD_ITEMS[idx];
    if(!item) return false;
    if(typeof player==='undefined'||!player||player.dead) return false;
    if(player.car){
      if(typeof toast==='function') toast('EXIT VEHICLE TO BUILD STRUCTURES');
      return false;
    }
    if(typeof cash==='number'&&cash<item.cost){
      if(typeof toast==='function') toast('NEED $'+item.cost+' GAME CASH TO BUILD '+item.name.toUpperCase());
      return false;
    }

    if(typeof cash==='number'&&cash>=item.cost){
      cash -= item.cost;
    }

    const yaw = (typeof view!=='undefined'&&view&&typeof view.yaw==='number') ? view.yaw : (player.a||0);
    const px = player.x + Math.cos(yaw) * 38;
    const py = player.y + Math.sin(yaw) * 38;

    const record = {
      id: item.id,
      name: item.name,
      x: px,
      y: py,
      w: item.w,
      h: item.h,
      d: item.d,
      yaw: yaw
    };
    constructed.push(record);

    // Register collision solid if city solids array exists
    if(typeof city!=='undefined'&&city&&Array.isArray(city.solids)){
      city.solids.push({ x: px - item.w/2, y: py - item.d/2, w: item.w, h: item.d });
    }

    // Build 3D mesh if THREE & scene are available
    if(typeof THREE!=='undefined'&&typeof scene!=='undefined'&&scene){
      try{
        const group = (typeof cityGroup!=='undefined'&&cityGroup) ? cityGroup : scene;
        const g = new THREE.Group();
        g.name = 'construction-' + item.id + '-' + constructed.length;
        const mat = new THREE.MeshStandardMaterial({ color: item.col, roughness: 0.75, metalness: 0.2 });
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(item.w, item.h, item.d), mat);
        mesh.position.set(px, item.h/2, py);
        mesh.rotation.y = -yaw;
        g.add(mesh);
        if(item.light){
          const bulb = new THREE.PointLight('#ffefb8', 1.2, 140, 1.2);
          bulb.position.set(px, item.h + 2, py);
          g.add(bulb);
        }
        group.add(g);
        record.mesh = g;
      }catch(_){}
    }

    if(typeof sfx==='function') sfx('cash');
    if(typeof toast==='function') toast('BUILT: ' + item.name.toUpperCase() + ' · -$' + item.cost);
    return true;
  }

  const constructionAPI = {
    get active(){ return isConstructionActive; },
    set active(val){ isConstructionActive = !!val; updatePromptUI(); },
    items: BUILD_ITEMS,
    toggle: toggleConstruction,
    place: placeStructure,
    placed: constructed
  };
  root.level29Construction = constructionAPI;

  if(typeof document==='undefined') return;

  // CSS Styles for Contextual HUD Prompts
  const style = document.createElement('style');
  style.id = 'contextualPromptsStyle';
  style.textContent = `
    #contextualPrompts {
      position: fixed;
      left: 50%;
      bottom: 84px;
      transform: translateX(-50%);
      z-index: 38;
      display: none;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 4px;
      background: rgba(10, 17, 23, 0.94);
      border: 1px solid #d4af37;
      box-shadow: 0 4px 18px rgba(0,0,0,0.65);
      font: 700 12px 'Barlow Condensed', 'IBM Plex Mono', monospace;
      letter-spacing: 0.04em;
      color: #f7edd4;
      pointer-events: auto;
      transition: opacity 0.15s ease, transform 0.15s ease;
      text-align: center;
      max-width: 92vw;
      flex-wrap: wrap;
      justify-content: center;
    }
    #contextualPrompts .prompt-title {
      font-weight: 900;
      color: #ffd86b;
      letter-spacing: 0.08em;
      margin-right: 4px;
      font-size: 11px;
      text-transform: uppercase;
    }
    #contextualPrompts .prompt-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      background: rgba(244, 195, 85, 0.12);
      padding: 3px 8px;
      border-radius: 3px;
      border: 1px solid rgba(244, 195, 85, 0.45);
      user-select: none;
      transition: background 0.1s ease;
    }
    #contextualPrompts .prompt-pill:hover,
    #contextualPrompts .prompt-pill:active {
      background: rgba(244, 195, 85, 0.28);
      border-color: #ffd86b;
    }
    #contextualPrompts .prompt-key {
      display: inline-block;
      min-width: 16px;
      padding: 1px 5px;
      background: #f4c355;
      color: #0b0e10;
      border-radius: 2px;
      font-weight: 900;
      font-family: 'IBM Plex Mono', monospace;
      font-size: 11px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.5);
      line-height: 1.2;
    }
    #contextualPrompts .prompt-label {
      text-transform: uppercase;
      font-size: 12px;
      color: #f6f3e6;
    }
    @media (max-width: 700px) {
      #contextualPrompts {
        bottom: 92px;
        gap: 6px;
        padding: 5px 10px;
        font-size: 11px;
      }
      #contextualPrompts .prompt-pill {
        padding: 2px 6px;
      }
    }
  `;
  document.head.appendChild(style);

  // Prompts Container
  const promptsNode = document.createElement('div');
  promptsNode.id = 'contextualPrompts';
  promptsNode.setAttribute('role', 'region');
  promptsNode.setAttribute('aria-label', 'Contextual Action Prompts');
  document.body.appendChild(promptsNode);

  // Construction HUD action button
  const buildBtn = document.createElement('button');
  buildBtn.id = 'constructionBtn';
  buildBtn.type = 'button';
  buildBtn.textContent = 'BUILD · B';
  buildBtn.title = 'Toggle Level 29 Construction Mode';
  buildBtn.style.cssText = 'min-height:36px;padding:6px 10px;background:#2a251a;color:#f0d99f;border:1px solid #c4ab6b;font:700 11px monospace;cursor:pointer;';
  buildBtn.onclick = (e) => {
    e.stopPropagation();
    toggleConstruction();
  };
  const slot = document.getElementById('hudMapActions');
  if(slot) slot.appendChild(buildBtn);
  else document.body.appendChild(buildBtn);

  // Check if player is near any vehicle
  function getNearbyCar(){
    if(typeof cars==='undefined'||!Array.isArray(cars)) return null;
    if(typeof player==='undefined'||!player||player.car) return null;
    let closest = null, minDist = 72;
    for(const c of cars){
      if(c.dead || c.burnT) continue;
      const d = Math.hypot(player.x - c.x, player.y - c.y);
      if(d < minDist){
        minDist = d;
        closest = c;
      }
    }
    return closest;
  }

  // Check if player is at a fishing or haul-net spot
  function getFishingContext(){
    // 1. Shrimp trawl shift from boomcity.js
    if(typeof shift!=='undefined'&&shift&&shift.phase==='ground'&&shift.at){
      return { type: 'haul_net', label: 'Haul Net' };
    }
    // 2. Open world water spot from gulf.js
    if(typeof nearWaterSpot==='function'&&nearWaterSpot()){
      const f = (typeof fish!=='undefined'&&fish);
      if(f){
        return { type: 'fish_action', label: f.phase==='bite'?'Hook Fish':f.phase==='fight'?'Reel In':'Cast Line', key: 'I' };
      }
      return { type: 'haul_net', label: 'Haul Net / Fish' };
    }
    // 3. Natchez steamboat deck zone
    if(typeof Level29ExpansionUI!=='undefined'&&Level29ExpansionUI.checkFishingZone){
      if(typeof player!=='undefined'&&player&&Level29ExpansionUI.checkFishingZone(player.x, player.y)){
        return { type: 'haul_net', label: 'Haul Net / Fish' };
      }
    }
    return null;
  }

  // Check if player is near a lift or service counter
  function getInteractionContext(){
    if(typeof player==='undefined'||!player||player.car||player.dead) return null;

    // Check elevator / lift in mansion penthouse or greenmart
    if(typeof city!=='undefined'&&city?.penthouse?.lift){
      const l = city.penthouse.lift;
      if(Math.hypot(player.x - l.x, player.y - l.y) < 46){
        return { label: 'Use Penthouse Lift', key: 'U', fn: () => { if(typeof city?.penthouse?.useLift==='function') city.penthouse.useLift(); } };
      }
    }
    if(typeof root.level29Greenmart?.nearLift==='function'&&root.level29Greenmart.nearLift()){
      return { label: 'Use Greenmart Lift', key: 'U' };
    }

    // Check carrying deliverable
    if(player.carrying){
      return { label: 'Drop Item', key: 'U' };
    }

    // Check venue station / counter
    if(typeof nearStation==='function'&&nearStation()){
      return { label: 'Interact / Service', key: 'U', fn: () => { if(typeof serviceVenue==='function') serviceVenue(); } };
    }

    return null;
  }

  // Main UI refresh
  function updatePromptUI(){
    if(!promptsNode) return;
    if(typeof state==='undefined'||state!=='play'||typeof player==='undefined'||!player||player.dead){
      promptsNode.style.display = 'none';
      return;
    }

    const pills = [];

    // Condition 1: LEVEL 29 CONSTRUCTION MODE
    if(isConstructionActive){
      pills.push('<span class="prompt-title">LEVEL 29 CONSTRUCTION</span>');
      for(const item of BUILD_ITEMS){
        pills.push(
          `<div class="prompt-pill" role="button" tabindex="0" data-action="build-${item.key}" title="Build ${item.name} ($${item.cost})">` +
          `<span class="prompt-key">${item.key}</span>` +
          `<span class="prompt-label">${item.name} ($${item.cost})</span>` +
          `</div>`
        );
      }
      pills.push(
        `<div class="prompt-pill" role="button" tabindex="0" data-action="build-exit" title="Exit Construction Mode">` +
        `<span class="prompt-key">B</span>` +
        `<span class="prompt-label">Exit</span>` +
        `</div>`
      );
      promptsNode.innerHTML = pills.join('');
      promptsNode.style.display = 'flex';
      return;
    }

    // Condition 2: Vehicle entry / exit
    if(player.car){
      pills.push(
        `<div class="prompt-pill" role="button" tabindex="0" data-action="exit-car" title="Exit Vehicle">` +
        `<span class="prompt-key">E</span>` +
        `<span class="prompt-label">Exit Vehicle</span>` +
        `</div>`
      );
      if(player.car.spec?.police){
        pills.push(
          `<div class="prompt-pill" role="button" tabindex="0" data-action="police-siren" title="Toggle Siren">` +
          `<span class="prompt-key">H</span>` +
          `<span class="prompt-label">Siren</span>` +
          `</div>`
        );
      }
    } else {
      const nearCar = getNearbyCar();
      if(nearCar){
        const name = nearCar.spec?.name || 'Vehicle';
        pills.push(
          `<div class="prompt-pill" role="button" tabindex="0" data-action="enter-car" title="Enter ${name}">` +
          `<span class="prompt-key">E</span>` +
          `<span class="prompt-label">Enter ${name}</span>` +
          `</div>`
        );
      }
    }

    // Condition 3: Fishing spot / net haul
    const fishCtx = getFishingContext();
    if(fishCtx){
      const k = fishCtx.key || 'U';
      pills.push(
        `<div class="prompt-pill" role="button" tabindex="0" data-action="haul-net" title="${fishCtx.label}">` +
        `<span class="prompt-key">${k}</span>` +
        `<span class="prompt-label">${fishCtx.label}</span>` +
        `</div>`
      );
    }

    // Condition 4: Station / Lift / Delivery
    const interactCtx = getInteractionContext();
    if(interactCtx){
      pills.push(
        `<div class="prompt-pill" role="button" tabindex="0" data-action="interact" title="${interactCtx.label}">` +
        `<span class="prompt-key">${interactCtx.key}</span>` +
        `<span class="prompt-label">${interactCtx.label}</span>` +
        `</div>`
      );
    }

    // Render pills or hide if no context active
    if(pills.length > 0){
      promptsNode.innerHTML = pills.join('');
      promptsNode.style.display = 'flex';
    } else {
      promptsNode.style.display = 'none';
    }
  }

  // Handle pill click / tap actions
  promptsNode.addEventListener('click', (e) => {
    const pill = e.target.closest('.prompt-pill');
    if(!pill) return;
    e.stopPropagation();
    const action = pill.dataset.action;

    if(action === 'build-exit'){
      toggleConstruction();
    } else if(action?.startsWith('build-')){
      const key = action.replace('build-', '');
      const idx = parseInt(key, 10) - 1;
      if(idx >= 0 && idx < BUILD_ITEMS.length) placeStructure(idx);
    } else if(action === 'enter-car' || action === 'exit-car'){
      if(typeof enterExit==='function') enterExit();
    } else if(action === 'police-siren'){
      if(player?.car) player.car.siren = !player.car.siren;
    } else if(action === 'haul-net'){
      if(typeof startFishing==='function') startFishing();
      else if(typeof shift!=='undefined'&&shift) {
        if(typeof toast==='function') toast('HOLD U TO HAUL NET');
      }
    } else if(action === 'interact'){
      if(typeof serviceVenue==='function') serviceVenue();
    }
    updatePromptUI();
  });

  // Keyboard navigation & construction key captures
  addEventListener('keydown', (e) => {
    if(typeof state==='undefined'||state!=='play') return;
    if(e.target.closest?.('input,textarea,select')) return;

    const key = e.key.toLowerCase();

    // Toggle construction mode with 'b'
    if(key === 'b' && !e.repeat){
      // Don't intercept if inside vehicle customization garage or safehouse menu
      const v = typeof city!=='undefined'&&city?.venues?.find(v=>['safe','garage','armory'].includes(v.id)&&(typeof insideVenue==='function')&&insideVenue(v,player.car||player));
      if(!v){
        e.preventDefault();
        toggleConstruction();
        return;
      }
    }

    // In construction mode, handle numbers 1-5 and Escape
    if(isConstructionActive){
      if(key === 'escape'){
        e.preventDefault();
        toggleConstruction();
        return;
      }
      if(key >= '1' && key <= '5'){
        e.preventDefault();
        e.stopImmediatePropagation();
        const idx = parseInt(key, 10) - 1;
        placeStructure(idx);
        updatePromptUI();
        return;
      }
    }
  }, true);

  // Defensively remove any floating HUD buttons for Fireworks or Flare Gun
  // so they exist strictly within the Weapon Wheel
  function purgeFloatingWeapons(){
    if(typeof document==='undefined' || typeof document.querySelectorAll !== 'function') return;
    const allBtns = document.querySelectorAll('button, .hud-btn, [role="button"]');
    for (const b of allBtns) {
      if (b.id === 'wbtn') continue;
      const txt = (b.textContent || '').trim().toUpperCase();
      if (/FIREWORK|FLARE\s*GUN|F10|F11/.test(txt)) {
        b.style.display = 'none';
        if (typeof b.remove === 'function') b.remove();
      }
    }
  }

  // Hook into game render loop
  if(typeof render==='function'){
    const prevRender = render;
    render = function(){
      prevRender.apply(this, arguments);
      updatePromptUI();
      purgeFloatingWeapons();
    };
  } else {
    setInterval(() => {
      updatePromptUI();
      purgeFloatingWeapons();
    }, 120);
  }
})(typeof window!=='undefined' ? window : globalThis);
