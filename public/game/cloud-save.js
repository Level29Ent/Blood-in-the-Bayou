"use strict";
(function () {
  let revision = null,
    account = null,
    pending = false,
    previous = "menu",
    loaded = null;
  const dialog = document.createElement("dialog");
  dialog.id = "bayouCloud";
  dialog.className = "bayou-panel";
  dialog.setAttribute("aria-label", "Optional cloud save and local backups");
  document.body.appendChild(dialog);
  const text = (t) => {
    const p = document.createElement("p");
    p.textContent = t;
    dialog.appendChild(p);
    return p;
  };
  function close() {
    if (pending) return;
    if (dialog.open) dialog.close();
    if (state === "pause" && !mpRole)
      state = previous === "pause" ? "play" : previous;
  }
  function button(label, fn) {
    const b = document.createElement("button");
    b.textContent = label;
    b.type = "button";
    b.onclick = async () => {
      if (pending) return;
      pending = true;
      for (const node of dialog.querySelectorAll("button"))
        node.disabled = true;
      try {
        await fn();
      } catch (e) {
        text(
          e.message || "Save operation failed. Local progress is unchanged.",
        );
      } finally {
        pending = false;
        for (const node of dialog.querySelectorAll("button"))
          node.disabled = false;
      }
    };
    dialog.appendChild(b);
    return b;
  }
  async function connection() {
    if (
      !/^https?:$/.test(location.protocol) ||
      window.Capacitor?.isNativePlatform?.()
    )
      throw Error(
        "Cloud saves require the web game. Local backup recovery and save codes remain available here.",
      );
    const user = await BayouCommunity.user();
    if (account !== user.id) {
      account = user.id;
      revision = null;
      loaded = null;
    }
    return { user, client: await BayouCommunity.connect() };
  }
  async function inspect() {
    const { user, client } = await connection();
    const response = await client
      .from("bitb_cloud_saves")
      .select("revision,updated_at,payload")
      .eq("owner", user.id)
      .maybeSingle();
    if (response.error)
      throw Error(
        "Cloud saves unavailable. Sign in to Online Community and ask the database owner to apply the cloud-save migration. " +
          response.error.message,
      );
    loaded = response.data;
    revision = loaded?.revision || 0;
    if (loaded) BayouPolishCore.bundle(loaded.payload);
    return loaded;
  }
  function show() {
    if (!["menu", "play", "pause"].includes(state) || mpRole) return;
    if (!dialog.open) previous = state;
    if (state === "play") state = "pause";
    mouse.down = false;
    window.level29Bindings?.release();
    for (const k in keys) keys[k] = false;
    document.exitPointerLock?.();
    dialog.replaceChildren();
    const h = document.createElement("h2");
    h.textContent = "OPTIONAL SAVE BACKUPS";
    dialog.appendChild(h);
    text(
      "Offline play remains available. Nothing is uploaded automatically. Cloud copies include game progress and settings, not account credentials. Sign in on Online Community first; cloud saves require the dedicated database migration. Restoring replaces this device’s progress after making a local backup.",
    );
    const link = document.createElement("a");
    link.hidden =
      !/^https?:$/.test(location.protocol) ||
      !!window.Capacitor?.isNativePlatform?.();
    link.href = "/game/community.html";
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "OPEN ONLINE COMMUNITY / SIGN IN";
    dialog.appendChild(link);
    const status = text("Cloud not checked.");
    status.setAttribute("role", "status");
    button("CHECK CLOUD COPY", async () => {
      const row = await inspect();
      status.textContent = row
        ? "Cloud revision " +
          revision +
          " · " +
          new Date(row.updated_at).toLocaleString() +
          ". Check before overwriting."
        : "No cloud copy yet. You may upload this device’s save.";
    });
    button("UPLOAD THIS DEVICE · MANUAL", async () => {
      if (state !== "menu") window.level29Save?.save();
      const data = BayouPolishCore.collect(localStorage);
      const { client } = await connection();
      if (revision === null)
        throw Error("Check the cloud copy first. No upload sent.");
      const expected = revision;
      const response = await client.rpc("bitb_put_save", {
        payload: data,
        expected_revision: expected,
      });
      if (response.error) {
        revision = null;
        throw Error(
          "Upload not completed. Another device may have saved, or the database is unavailable. Check the cloud copy again. " +
            response.error.message,
        );
      }
      revision = response.data;
      loaded = null;
      status.textContent =
        "Uploaded cloud revision " + revision + ". Local save preserved.";
    });
    button("RESTORE CHECKED CLOUD COPY", async () => {
      if (!loaded) throw Error("Check a cloud copy before restoring.");
      const selected = loaded,
        owner = account;
      await connection();
      if (owner !== account)
        throw Error("Account changed. Check the cloud copy again.");
      // A second explicit button makes replacement a deliberate action.
      text(
        "Restore revision " +
          selected.revision +
          "? Current local progress will be backed up.",
      );
      button("CONFIRM RESTORE · RELOAD GAME", async () => {
        const { user } = await connection();
        if (user.id !== owner)
          throw Error("Account changed; no local changes made.");
        BayouPolishCore.install(localStorage, selected.payload);
        state = "menu";
        location.reload();
      });
    });
    button("DELETE CLOUD COPY", async () => {
      text(
        "Delete only the signed-in account’s cloud backup? Local saves remain.",
      );
      const owner = (await connection()).user.id;
      button("CONFIRM DELETE CLOUD COPY", async () => {
        const { user, client } = await connection();
        if (user.id !== owner) throw Error("Account changed; check again.");
        const response = await client
          .from("bitb_cloud_saves")
          .delete()
          .eq("owner", owner);
        if (response.error) throw Error(response.error.message);
        revision = 0;
        loaded = null;
        status.textContent = "Cloud copy deleted. Local progress unchanged.";
      });
    });
    const backups = BayouPolishCore.backups(localStorage);
    for (const item of backups)
      button(
        "RESTORE LOCAL BACKUP · " + new Date(item.at).toLocaleString(),
        async () => {
          text("Replace local progress with this checkpoint?");
          button("CONFIRM LOCAL RESTORE · RELOAD", async () => {
            BayouPolishCore.install(localStorage, item.data);
            state = "menu";
            location.reload();
          });
        },
      );
    if (!backups.length)
      text(
        "No valid local backup yet. Backups retain the last three distinct autosave/import checkpoints on this browser.",
      );
    button("CLOSE / RESUME", async () => {
      pending = false;
      close();
    });
    if (!dialog.open) dialog.showModal();
  }
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    close();
  });
  for (const type of [
    "pointerdown",
    "pointerup",
    "click",
    "touchstart",
    "touchend",
    "wheel",
    "keydown",
    "keyup",
  ])
    dialog.addEventListener(type, (e) => e.stopPropagation());
  const launch = document.createElement("button");
  launch.type = "button";
  launch.textContent = "CLOUD SAVE / BACKUPS";
  launch.onclick = show;
  document.querySelector("#menu .row")?.appendChild(launch);
  window.level29CloudSave = { show, close };
})();
