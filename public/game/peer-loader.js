"use strict";
(function () {
  let pending = null;
  function load() {
    if (window.Peer) return Promise.resolve(window.Peer);
    if (pending) return pending;
    pending = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "peerjs.min.js?v=restored-world-9";
      const timer = setTimeout(() => {
        script.remove();
        pending = null;
        reject(Error("Multiplayer library timed out. Retry when connected."));
      }, 15000);
      script.onload = () => {
        clearTimeout(timer);
        if (window.Peer) resolve(window.Peer);
        else {
          pending = null;
          reject(Error("Multiplayer library unavailable."));
        }
      };
      script.onerror = () => {
        clearTimeout(timer);
        script.remove();
        pending = null;
        reject(Error("Multiplayer could not load. Check your connection."));
      };
      document.head.appendChild(script);
    });
    return pending;
  }
  window.level29Peer = { load };
})();
