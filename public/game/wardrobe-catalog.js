'use strict';
(function(){
const colors=[['Bayou','#426b56'],['Midnight','#263243'],['Gold','#c6a455'],['Plum','#714c83']];
const styles={tops:['Crew Tee','Hoodie','Varsity Jacket','Vest','Striped Shirt'],pants:['Jeans','Cargo Pants','Joggers','Shorts','Dress Trousers'],shoes:['Sneakers','Work Boots','High Tops','Loafers','Sport Runners'],headwear:['Cap','Beanie','Durag','Bucket Hat','Headband'],accessories:['Gold Chain','Scarf','Crossbody Bag','Glasses','Watch']};
const catalog=[];for(const [category,cuts]of Object.entries(styles))for(const [cut,name]of cuts.entries())for(const [variant,[shade,color]]of colors.entries())catalog.push({id:category+'-'+cut+'-'+variant,category,cut,color,name:shade+' '+name});
function outfit(saved={}){const out={};for(const category of Object.keys(styles)){const item=catalog.find(i=>i.category===category&&i.id===saved[category]);if(item)out[category]=item.id;}return out;}
function equip(saved,id){const item=catalog.find(i=>i.id===id);return item?{...outfit(saved),[item.category]:id}:outfit(saved);}
const api={catalog,styles,outfit,equip};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29WardrobeCatalog=api;
})();
