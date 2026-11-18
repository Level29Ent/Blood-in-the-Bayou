'use strict';
(function(){
let settings={sensitivity:1,shake:.5};try{Object.assign(settings,JSON.parse(localStorage.getItem('level29.pause-controls.v1')||'{}'));}catch(_){}settings.sensitivity=Math.max(.4,Math.min(2,Number(settings.sensitivity)||1));settings.shake=Math.max(0,Math.min(1,Number(settings.shake)||0));
const pause=document.createElement('button');pause.textContent='PAUSE';pause.id='pauseGame';pause.style.minHeight='44px';pause.onclick=()=>{if(state==='play'&&!mpRole){mouse.down=false;state='pause';}else if(mpRole)toast('SHARED WORLD CANNOT PAUSE');};document.getElementById('hudMapActions')?.appendChild(pause);
const panel=document.createElement('section');panel.id='pauseControls';panel.style.cssText='display:none;position:fixed;left:50%;top:55%;transform:translate(-50%,-50%);z-index:94;width:min(460px,92vw);max-height:85dvh;overflow:auto;padding:18px;box-sizing:border-box;background:#10202af5;color:#eddfbc;font:13px/1.5 monospace;border:1px solid #b7a477';panel.innerHTML='<h2>Paused · Controls & Campaign</h2><label>Aim sensitivity <input id="pauseSensitivity" type="range" min=".4" max="2" step=".1"></label><br><label>Camera shake <input id="pauseShake" type="range" min="0" max="1" step=".05"></label><p><b>Move:</b> WASD / joystick<br><b>Aim:</b> mouse / drag / right stick<br><b>Fire:</b> click / FIRE / RT<br><b>Contextual:</b> [E] Enter/Exit vehicle &bull; [U] Haul Net / Interact<br><b>Level 29 Construction:</b> [B] Toggle &bull; [1-5] Build<br><b>Graphics Toggle:</b> [G] Cycle Low / Med / High / Unreal E5</p><div style="margin:10px 0;padding:8px 10px;background:#091218;border:1px solid #7c6d48;font-size:11px"><div style="color:#f4c355;font-weight:700;margin-bottom:6px;letter-spacing:0.06em">GRAPHICS FIDELITY & LIGHTING</div><div style="display:flex;gap:6px;margin-bottom:6px"><button id="gfxLow" type="button" style="flex:1;padding:6px 2px;font:700 11px monospace;background:#18222a;color:#d0d8dc;border:1px solid #4a5c68;cursor:pointer">LOW</button><button id="gfxMed" type="button" style="flex:1;padding:6px 2px;font:700 11px monospace;background:#18222a;color:#d0d8dc;border:1px solid #4a5c68;cursor:pointer">MED</button><button id="gfxHigh" type="button" style="flex:1;padding:6px 2px;font:700 11px monospace;background:#18222a;color:#d0d8dc;border:1px solid #4a5c68;cursor:pointer">HIGH</button><button id="gfxUltra" type="button" style="flex:1.4;padding:6px 2px;font:800 11px monospace;background:#2a2512;color:#ffde59;border:1.5px solid #ffde59;box-shadow:0 0 10px rgba(255,222,89,.35);cursor:pointer">⚡ UNREAL E5</button></div><div id="gfxDesc" style="color:#a8b4be;font-size:10px">Active: High-dynamic range lighting, soft PCF shadows & SSAO</div></div><div style="margin:10px 0;padding:8px 10px;background:#091218;border:1px solid #7c6d48;font-size:11px"><div style="color:#f4c355;font-weight:700;margin-bottom:6px;letter-spacing:0.06em">CAMPAIGN ZONE PROGRESSION (210 MISSIONS)</div><div id="pauseZoneProgression"></div></div><button id="pauseResume" style="min-height:44px;width:100%">SAVE & RESUME</button>';document.body.appendChild(panel);
const sensitivity=panel.querySelector('#pauseSensitivity'),shakeSlider=panel.querySelector('#pauseShake'),zoneBox=panel.querySelector('#pauseZoneProgression');sensitivity.value=settings.sensitivity;shakeSlider.value=settings.shake;
function updateGfxButtons(){
  const q=window.level29Graphics?.quality||'low';
  const desc=panel.querySelector('#gfxDesc');
  const bLow=panel.querySelector('#gfxLow'),bMed=panel.querySelector('#gfxMed'),bHigh=panel.querySelector('#gfxHigh'),bUltra=panel.querySelector('#gfxUltra');
  if(!bLow)return;
  for(const [btn,tier] of [[bLow,'low'],[bMed,'medium'],[bHigh,'high'],[bUltra,'ultra']]){
    const active=q===tier;
    btn.style.borderColor=active?(tier==='ultra'?'#ffde59':'#ffffff'):(tier==='ultra'?'rgba(255,222,89,.5)':'#4a5c68');
    btn.style.background=active?(tier==='ultra'?'rgba(240,196,90,.32)':'rgba(255,255,255,.25)'):'#18222a';
    btn.style.color=active?'#ffffff':(tier==='ultra'?'#ffde59':'#d0d8dc');
  }
  if(desc){
    if(q==='ultra')desc.textContent='Active: ⚡ Unreal E5 fidelity (4K PCF soft shadows, SSAO, clearcoat paint, filmic bloom)';
    else if(q==='high')desc.textContent='Active: High quality PCF shadows, SSAO contact shading, bayou mist';
    else if(q==='medium')desc.textContent='Active: Medium shadows, SSAO contact occlusion';
    else desc.textContent='Active: Lightweight direct rendering (recommended for low-end mobile)';
  }
}
panel.querySelector('#gfxLow').onclick=()=>{window.level29Graphics?.setQuality('low');updateGfxButtons();if(typeof toast==='function')toast('GRAPHICS: LOW');};
panel.querySelector('#gfxMed').onclick=()=>{window.level29Graphics?.setQuality('medium');updateGfxButtons();if(typeof toast==='function')toast('GRAPHICS: MEDIUM');};
panel.querySelector('#gfxHigh').onclick=()=>{window.level29Graphics?.setQuality('high');updateGfxButtons();if(typeof toast==='function')toast('GRAPHICS: HIGH');};
panel.querySelector('#gfxUltra').onclick=()=>{window.level29Graphics?.setQuality('ultra');updateGfxButtons();if(typeof toast==='function')toast('⚡ UNREAL E5 GRAPHICS ACTIVE');};

// Desktop keyboard shortcut [G]
if(typeof addEventListener!=='undefined'){
  addEventListener('keydown',e=>{
    if((e.key||'').toLowerCase()!=='g'||e.repeat||(e.target&&e.target.closest&&e.target.closest('input,textarea')))return;
    const q=window.level29Graphics?.quality||'low';
    const modes=['low','medium','high','ultra'];
    const next=modes[(modes.indexOf(q)+1)%modes.length];
    window.level29Graphics?.setQuality(next);
    updateGfxButtons();
    if(typeof toast==='function')toast(next==='ultra'?'⚡ UNREAL E5 GRAPHICS ACTIVE':('GRAPHICS: '+next.toUpperCase()));
  });
}
function updateZoneList(){
  if(!zoneBox||typeof DISTRICTS==='undefined')return;
  const ch = (typeof missionIdx==='number') ? Math.min(DISTRICTS.length-1,Math.floor(missionIdx/30)) : (typeof distIdx==='number'?distIdx:0);
  const rows = [];
  for(let i=0;i<DISTRICTS.length;i++){
    const active = i===ch, done = i<ch;
    const col = active?'#ffd86b':(done?'#52c474':'#8d969c');
    const badge = active?'▶ CURRENT':(done?'✓ COMPLETED':'');
    rows.push(`<div style="color:${col};padding:2px 0;display:flex;justify-content:space-between"><span>Tier ${i+1}: <b>${DISTRICTS[i].name}</b> (Missions ${i*30+1}–${i*30+30})</span><span style="font-size:10px">${badge}</span></div>`);
  }
  zoneBox.innerHTML = rows.join('');
}
panel.querySelector('#pauseResume').onclick=()=>{settings.sensitivity=+sensitivity.value;settings.shake=+shakeSlider.value;try{localStorage.setItem('level29.pause-controls.v1',JSON.stringify(settings));}catch(_){}state='play';};
const turn=turnView;turnView=function(dx,dy){return turn.call(this,dx*settings.sensitivity,dy*settings.sensitivity);};const place=placeCamera;placeCamera=function(){const saved=shake;shake=saved*settings.shake;try{return place.apply(this,arguments);}finally{shake=saved;}};
const renderBase=render;render=function(){renderBase.apply(this,arguments);const isPaused = state==='pause'&&!mpRole;panel.style.display=isPaused?'block':'none';if(isPaused){updateZoneList();updateGfxButtons();}document.getElementById('feelOptionsButton')?.remove();};
})();
