"use strict";
(function () {
  let active = false,
    previous = "play",
    pivot = null,
    yaw = 0,
    pitch = 0.2,
    distance = 55,
    lens = 60,
    capture = false,
    hidden = false,
    photoCamera = null,
    lastURL = null,
    restoreFocus = null,
    generation = 0;
  const panel = document.createElement("section");
  panel.id = "photoControls";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Photo mode camera controls");
  document.body.appendChild(panel);
  const title = document.createElement("h2");
  title.textContent = "BAYOU PHOTO MODE";
  panel.appendChild(title);
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  panel.appendChild(status);
  function button(label, fn) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.onclick = fn;
    panel.appendChild(b);
    return b;
  }
  function range(label, min, max, initial, fn) {
    const l = document.createElement("label");
    l.textContent = label;
    const i = document.createElement("input");
    i.type = "range";
    i.min = String(min);
    i.max = String(max);
    i.step = "1";
    i.value = String(initial);
    i.setAttribute("aria-label", label);
    i.oninput = () => fn(Number(i.value));
    l.appendChild(i);
    panel.appendChild(l);
    return i;
  }
  const yawInput = range(
      "Orbit angle",
      -180,
      180,
      0,
      (n) => (yaw = (n * Math.PI) / 180),
    ),
    pitchInput = range(
      "Camera elevation",
      -10,
      70,
      15,
      (n) => (pitch = (n * Math.PI) / 180),
    ),
    distanceInput = range(
      "Camera distance",
      10,
      160,
      55,
      (n) => (distance = n),
    ),
    lensInput = range("Field of view", 25, 90, 60, (n) => (lens = n));
  button("HIDE CONTROLS · H TO RESTORE", () => {
    hidden = true;
    panel.hidden = true;
    restoreButton.hidden = false;
  });
  const captureButton = button("CAPTURE PNG", () => {
    capture = true;
    status.textContent = "Preparing capture…";
    captureButton.disabled = true;
  });
  const saveLink = document.createElement("a");
  saveLink.hidden = true;
  saveLink.textContent = "DOWNLOAD PHOTO";
  saveLink.download = "blood-in-the-bayou-photo.png";
  panel.appendChild(saveLink);
  button("RETURN TO GAME", close);
  function canOpen() {
    return (
      !window.level29Field?.active &&
      !window.level29Jobs?.active &&
      !window.level29Powell?.active &&
      !window.level29CityStories?.active &&
      !window.level29CityCareers?.active &&
      !window.level29Enterprise?.active &&
      !window.level29Heists?.active &&
      !window.level29SurvivorStories?.active &&
      !window.level29Nola?.active &&
      !window.level29NolaActivities?.active &&
      !window.level29Neighborhood?.active &&
      !window.level29BayouPolish?.active &&
      !!player &&
      !player.dead &&
      !mpRole &&
      ["play", "pause"].includes(state) &&
      !window.level29RuntimeResources?.lost &&
      !window.level29Prologue?.active &&
      !window.level29Operations?.active &&
      !window.level29Leisure?.session &&
      !window.level29Pursuits?.busy &&
      !window.level29SurvivalExpansion?.active &&
      !window.level29Park?.active &&
      !window.level29StreetActivities?.active &&
      !window.level29CityEvents?.dispatch &&
      !(
        window.level29AnthonyStory?.progress?.step > 0 &&
        window.level29AnthonyStory?.progress?.step < 10
      ) &&
      (!mission || mission.phase === "start")
    );
  }
  function open() {
    if (active || !canOpen())
      return toast(
        "PHOTO MODE · SOLO FREE ROAM ONLY · FINISH CURRENT ACTIVITY",
      );
    window.level29UX?.close();
    window.level29Leisure?.closeBoard?.();
    window.level29Pursuits?.closeBoard?.();
    window.level29Operations?.closeBoard?.();
    previous = state;
    restoreFocus = document.activeElement;
    state = "pause";
    mouse.down = false;
    window.level29Bindings?.release();
    if (typeof releaseTouchGesture === "function") releaseTouchGesture();
    for (const k in keys) keys[k] = false;
    document.exitPointerLock?.();
    const height = terrainHeight(player.x, player.y);
    pivot = new THREE.Vector3(player.x, height + 12, player.y);
    yaw = view.yaw + Math.PI;
    pitch = 0.2;
    distance = 55;
    lens = 60;
    photoCamera = camera.clone();
    photoCamera.up.set(0, 1, 0);
    yawInput.value = String(
      Math.round((Math.atan2(Math.sin(yaw), Math.cos(yaw)) * 180) / Math.PI),
    );
    pitchInput.value = "12";
    distanceInput.value = "55";
    lensInput.value = "60";
    generation++;
    active = true;
    hidden = false;
    capture = false;
    panel.hidden = false;
    saveLink.hidden = true;
    captureButton.disabled = false;
    status.textContent =
      "Simulation paused. Orbit stays within 160 game units. Geometry may obstruct the camera; adjust elevation/distance. H restores hidden controls; Escape exits.";
    document.body.classList.add("photo-active");
    panel.querySelector("button")?.focus();
  }
  const restoreButton = document.createElement("button");
  restoreButton.id = "photoRestore";
  restoreButton.type = "button";
  restoreButton.textContent = "SHOW PHOTO CONTROLS";
  restoreButton.hidden = true;
  restoreButton.onclick = () => {
    hidden = false;
    panel.hidden = false;
    restoreButton.hidden = true;
  };
  document.body.appendChild(restoreButton);
  function toggleControls() {
    hidden = !hidden;
    panel.hidden = hidden;
    restoreButton.hidden = !hidden;
  }
  function close() {
    if (!active) return;
    generation++;
    active = false;
    restoreButton.hidden = true;
    capture = false;
    panel.hidden = true;
    document.body.classList.remove("photo-active");
    if (lastURL) {
      URL.revokeObjectURL(lastURL);
      lastURL = null;
    }
    saveLink.hidden = true;
    photoCamera = null;
    state = previous === "pause" ? "play" : previous;
    mouse.down = false;
    window.level29Bindings?.release();
    restoreFocus?.focus?.();
  }
  function pose() {
    photoCamera.aspect = SW / SH;
    photoCamera.fov = lens;
    photoCamera.updateProjectionMatrix();
    photoCamera.position.set(
      pivot.x + Math.cos(yaw) * Math.cos(pitch) * distance,
      Math.max(2, pivot.y + Math.sin(pitch) * distance),
      pivot.z + Math.sin(yaw) * Math.cos(pitch) * distance,
    );
    photoCamera.lookAt(pivot);
    photoCamera.updateMatrixWorld(true);
  }
  const tick = update;
  update = function () {
    if (active) {
      state = "pause";
      if (player.dead || mpRole) {
        close();
      }
      return;
    }
    return tick.apply(this, arguments);
  };
  const draw = render;
  render = function () {
    if (!active) return draw.apply(this, arguments);
    if (window.level29RuntimeResources?.lost) return;
    syncViewport();
    pose();
    renderer.clear();
    renderer.render(scene, photoCamera);
    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx.clearRect(0, 0, SW, SH);
    if (capture) {
      capture = false;
      try {
        const token = generation;
        renderer.domElement.toBlob((blob) => {
          if (!active || token !== generation) return;
          captureButton.disabled = false;
          if (!blob) {
            status.textContent =
              "Capture unavailable in this browser. Use your device screenshot control.";
            return;
          }
          if (lastURL) URL.revokeObjectURL(lastURL);
          lastURL = URL.createObjectURL(blob);
          saveLink.href = lastURL;
          saveLink.hidden = false;
          status.textContent =
            "Photo ready. Choose DOWNLOAD PHOTO. No image was uploaded.";
        }, "image/png");
      } catch (e) {
        captureButton.disabled = false;
        status.textContent =
          "Capture unavailable: " + e.message + ". Use a device screenshot.";
      }
    }
  };
  addEventListener(
    "keydown",
    (e) => {
      if (!active) return;
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        close();
      } else if (e.key.toLowerCase() === "h" && !e.target?.closest?.("input")) {
        e.preventDefault();
        e.stopImmediatePropagation();
        toggleControls();
      } else if (!e.target?.closest?.("#photoControls,#photoRestore")) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    },
    true,
  );
  for (const t of [
    "click",
    "pointerdown",
    "pointerup",
    "touchstart",
    "touchend",
    "keydown",
    "keyup",
    "wheel",
  ])
    panel.addEventListener(t, (e) => e.stopPropagation());
  addEventListener(
    "webglcontextlost",
    () => {
      if (active) close();
    },
    true,
  );
  const start = startGame;
  startGame = function () {
    close();
    return start.apply(this, arguments);
  };
  const build = buildCity;
  buildCity = function () {
    close();
    return build.apply(this, arguments);
  };
  window.level29Photo = {
    open,
    close,
    canOpen,
    toggleControls,
    get active() {
      return active;
    },
  };
})();
