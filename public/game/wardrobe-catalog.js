'use strict';
(function(){
const colors=[['Bayou','#426b56'],['Midnight','#263243'],['Gold','#c6a455'],['Plum','#714c83']];
const styles={tops:['Crew Tee','Hoodie','Varsity Jacket','Vest','Striped Shirt'],pants:['Jeans','Cargo Pants','Joggers','Shorts','Dress Trousers'],shoes:['Sneakers','Work Boots','High Tops','Loafers','Sport Runners'],headwear:['Cap','Beanie','Durag','Bucket Hat','Headband'],accessories:['Gold Chain','Scarf','Crossbody Bag','Glasses','Watch']};
const catalog=[];for(const [category,cuts]of Object.entries(styles))for(const [cut,name]of cuts.entries())for(const [variant,[shade,color]]of colors.entries())catalog.push({id:category+'-'+cut+'-'+variant,category,cut,color,name:shade+' '+name});
function outfit(saved={}){if(!saved||typeof saved!=='object')saved={};const out={};for(const category of Object.keys(styles)){const item=catalog.find(i=>i.category===category&&i.id===saved[category]);if(item)out[category]=item.id;}return out;}
function equip(saved,id){const item=catalog.find(i=>i.id===id);return item?{...outfit(saved),[item.category]:id}:outfit(saved);}
function price(id){const i=catalog.find(i=>i.id===id);return i?({tops:175,pants:150,shoes:125,headwear:75,accessories:200}[i.category]+i.cut*25):null;}
function categories(name=''){if(/SHOE/i.test(name))return ['shoes'];if(/JEWELRY|LUXURY/i.test(name))return ['accessories','headwear'];if(/SPORTING|TACTICAL/i.test(name))return ['tops','pants','shoes','headwear'];if(/FASHION|THREADS|CLOTHING/i.test(name))return Object.keys(styles);return [];}
function buy(owned,saved,id,balance,allowed=Object.keys(styles)){const i=catalog.find(i=>i.id===id);if(!i||!allowed.includes(i.category)||!Number.isFinite(balance)||balance<0)return null;const cost=owned.includes(id)?0:price(id);if(balance<cost)return null;return {owned:[...new Set([...owned.filter(x=>catalog.some(i=>i.id===x)),id])],outfit:equip(saved,id),cash:balance-cost,cost};}
const api={catalog,styles,outfit,equip,price,categories,buy};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.level29WardrobeCatalog=api;
})();
