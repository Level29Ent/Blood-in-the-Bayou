'use strict';
(function(){
if(typeof window==='undefined')return;
const F=level29InteriorRealism;let owner=null,sites=[],scan=0;let registered=new WeakMap();
function register(source,b,base=0,v={},visible=()=>true){if(!source||!b?.w||!b?.h||v.referencePawn||v.referenceTires||v.referenceFish||v.referenceBotanica||v.referenceTheater||v.referenceJojo||v.referenceBank||v.referenceCorner||v.referenceHardware||v.referenceRepair||v.referencePolice||v.karma||v.referenceLiquor||v.referenceDonut)return;const key=[b.x,b.y,b.w,b.h,base].join(':');let known=registered.get(source);if(!known){known=new Set();registered.set(source,known);}if(known.has(key))return;known.add(key);sites.push({source,b:{...b},base,v,visible,root:null});}
function refresh(){owner=city;sites=[];registered=new WeakMap();if(!city?.world)return;
 for(const v of city.venues||[]){if(v.referenceVet||v.referencePolice||v.referencePawn||v.referenceFreight||v.referenceFastFood||v.referenceTires||v.referenceFish||v.referenceLaundry||v.referenceBotanica||v.referenceTheater||v.referenceJojo||v.referenceBank||v.referenceDonut||v.referenceLiquor||v.referenceBank||v.referenceCorner||v.referenceHardware||v.referenceRepair||v.referencePolice||v.karma||v.referenceHospital||!v.mesh)continue;if(v===city.casinoVenue&&city.riverboatHub){for(let f=0;f<3;f++)register(v.mesh,v.b,f*48,v,()=>!!window.level29Riverboat?.active&&window.level29Riverboat.floor===f);}
  else if(v.id==='mall'){for(const s of v.mallLayout.shops.filter(s=>!s.referenceGameStore).filter(s=>!s.referenceFastFood&&!s.referenceBarber))register(v.mesh,s.room,(v.baseY||0)+s.floor*56,{...v,name:s.name},()=>v.floor===s.floor);}
  else{const floors=v.floorFurniture?.length||1;for(let f=0;f<floors;f++)register(v.mesh,v.b,(v.baseY||0)+f*56,v,()=>floors===1||v.floor===f);}}
 const gm=city.greenmart;if(gm)for(let f=0;f<2;f++)register(gm.mesh||cityGroup,gm.b,f*56,{id:'grocery',name:'GREENMART'},()=>gm.floor===f);
 for(const room of level29InteriorRuntime?.rooms||[])if(room.custom)register(room.source,room.b,room.base,room.v,()=>room.source.visible);
 const civic=city.civicLocations;if(civic){register(cityGroup,civic.library,0,{name:'PUBLIC LIBRARY'});register(cityGroup,civic.metro,-96,{name:'METRO'},()=>!!window.level29InterstateCivic?.underground);}
}
// Newly streamed apartments / hospital / condo floors get the same finish pass when instantiated.
const record=level29InteriorRuntime.record;level29InteriorRuntime.record=function(v,root,base,custom){const result=record.apply(this,arguments);if(custom){F.upgrade(THREE,root);register(root,v.b,base,v,()=>root.visible);}return result;};
// Run before city-wide static batching moves venue geometry into shared draw batches.
const venue=buildVenue;buildVenue=function(v){const result=venue.apply(this,arguments);if(!v.referenceVet&&!v.referencePolice&&!v.referencePawn&&!v.referenceTheater&&!v.referenceFreight&&!v.referenceTires&&!v.referenceFastFood&&!v.referenceFish&&!v.referenceLaundry&&!v.referenceJojo&&!v.referenceBank&&!v.referenceDonut&&!v.referenceLiquor&&!v.referenceCorner&&!v.referenceHardware&&!v.referenceRepair&&!v.karma&&!v.referenceHospital&&v.mesh){const exclude=[...(v.mallLayout?.shops||[]).map(s=>s.referenceRoot),v.roof,v.door,v.worker,...(v.staff||[]).map(s=>s.mesh)].filter(Boolean);F.upgrade(THREE,v.mesh,exclude);for(const room of window.level29RoomPerformance?.rooms||[])if(room.rect.x===v.b.x&&room.rect.y===v.b.y)F.upgrade(THREE,room.root);}return result;};
const build=buildCity;buildCity=function(){const result=build.apply(this,arguments);refresh();return result;};
function release(root){if(!root)return;root.parent?.remove(root);const geos=new Set(),mats=new Set();root.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)mats.add(o.material);});for(const g of geos)g.dispose();for(const m of mats)m.dispose();}
const tick=update;update=function(){tick.apply(this,arguments);if(owner!==city)refresh();if(state!=='play'||!player||frame<scan)return;scan=frame+20;
 sites=sites.filter(s=>{if(s.source!==cityGroup&&!s.source.parent){release(s.root);return false;}return true;});
 let built=0;for(const site of sites){const b=site.b,d=Math.hypot(Math.max(b.x-player.x,0,player.x-b.x-b.w),Math.max(b.y-player.y,0,player.y-b.y-b.h)),show=site.visible()&&d<320&&Math.abs(terrainHeight(player.x,player.y)-site.base)<36;
  if(site.root){site.root.visible=show&&site.source.parent!==null;continue;}if(!show||built)continue;
  site.root=F.decorate(THREE,b,{base:site.base,theme:F.profile(site.v)});cityGroup.add(site.root);built++;
 }
};window.level29InteriorFinishes={register,get sites(){return sites;}};
})();
