const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const {select}=require('../public/game/hud-prompts');
test('only one nearby action occupies a row; story contact takes priority over boat advertising',()=>{
 const rows=new Map(['boat','construction','downtown'].map(id=>[id,{id,text:id}]));
 assert.deepEqual(select(rows,false).map(r=>r.id),['downtown','construction']);
 assert.deepEqual(select(rows,true).map(r=>r.id),['construction']);
 rows.delete('downtown');assert.deepEqual(select(rows,false).map(r=>r.id),['boat','construction']);
});
function setup(){
 const nodes={};function node(){return {children:[],hidden:false,style:{},setAttribute(){},addEventListener(){},appendChild(n){this.children.push(n);},textContent:''};}
 const action=nodes.prologueAction=node(),casino=nodes.riverboatControls=node();
 action.hidden=true;
 const c={window:null,document:{createElement:node,getElementById:id=>nodes[id],body:{appendChild(n){nodes[n.id]=n;}}},getComputedStyle:el=>({display:el.hidden?'none':'block'}),state:'play',showMap:false,player:{dead:false},render(){for(const [k,v] of c.submissions)c.level29HudPrompts.set(k,v);},submissions:[]};
 c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync('public/game/hud-prompts.js','utf8'),c);
 return {c,dock:nodes.hudPromptStack,action,casino};
}
test('actual render wrapper retains live buttons, clears stale hints and hides during maps, death and menus',()=>{
 const {c,dock,action,casino}=setup();assert.equal(dock.children[0],action);assert.equal(dock.children[1],casino);
 c.submissions=[['boat','Casino'],['construction','Grid ON']];c.render();
 assert.equal(dock.children[2].textContent,'Casino');assert.equal(dock.children[3].textContent,'Grid ON');
 action.hidden=false;c.render();assert.equal(dock.children[2].hidden,true);assert.equal(dock.children[3].hidden,false);
 c.submissions=[];c.render();assert.equal(dock.children[3].hidden,true);
 for(const mode of ['map','dead','pause','modal']){
  c.showMap=mode==='map';c.player.dead=mode==='dead';c.state=mode==='pause'?'pause':'play';c.level29UX={modalOpen:mode==='modal'};
  c.render();assert.equal(dock.hidden,true,mode);
 }
 c.level29UX={};c.state='play';c.render();assert.equal(dock.hidden,false);
});
test('all three former competing canvas hints submit to the same layout owner',()=>{
 for(const [file,id]of [['building-management','construction'],['downtown','downtown'],['boomcity','boat']]){
  const s=fs.readFileSync('public/game/'+file+'.js','utf8');assert.ok(s.includes("level29HudPrompts?.set('"+id+"'"));
 }
 const page=fs.readFileSync('public/game/index.html','utf8');assert.ok(page.indexOf('hud-prompts.js')>page.indexOf('landing-polish.js'));
});
