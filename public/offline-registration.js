'use strict';
(function(){
function registerOffline(nav,loc){if(!nav?.serviceWorker||!['http:','https:'].includes(loc.protocol)||loc.hostname==='localhost')return Promise.resolve(false);const key='__bayouOfflineRegistration';if(nav[key])return nav[key];nav[key]=Promise.resolve().then(()=>nav.serviceWorker.register('/sw.js')).then(()=>true,error=>{console.warn('Offline cache unavailable; online game remains available.',error?.message||error);return false;});return nav[key];}
if(typeof module!=='undefined')module.exports={registerOffline};if(typeof window!=='undefined')window.bayouOfflineReady=registerOffline(navigator,location);
})();
