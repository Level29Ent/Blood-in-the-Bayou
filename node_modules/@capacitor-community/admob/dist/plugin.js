var capacitorStripe = (function (exports, core) {
    'use strict';

    const NATIVE_AD_ELEMENT_NAME = 'capacitor-admob-native';
    const defineNativeAdElement = (findFeed) => {
        const runtime = globalThis;
        runtime.__capacitorAdMobNativeFeedLookup = findFeed;
        if (typeof customElements === 'undefined' || customElements.get(NATIVE_AD_ELEMENT_NAME)) {
            return;
        }
        customElements.define(NATIVE_AD_ELEMENT_NAME, class extends HTMLElement {
            static get observedAttributes() {
                return ['feed-id', 'slot-key'];
            }
            connectedCallback() {
                this.connectToFeed();
            }
            disconnectedCallback() {
                this.disconnectFromFeed();
            }
            attributeChangedCallback() {
                if (!this.isConnected) {
                    return;
                }
                this.disconnectFromFeed();
                this.connectToFeed();
            }
            connectToFeed() {
                var _a, _b, _c;
                const feedId = (_a = this.getAttribute('feed-id')) === null || _a === void 0 ? void 0 : _a.trim();
                const slotKey = (_b = this.getAttribute('slot-key')) === null || _b === void 0 ? void 0 : _b.trim();
                const feed = feedId ? (_c = runtime.__capacitorAdMobNativeFeedLookup) === null || _c === void 0 ? void 0 : _c.call(runtime, feedId) : undefined;
                if (!feed || !slotKey) {
                    return;
                }
                try {
                    feed.attach(slotKey, this);
                    this.attachedFeed = feed;
                }
                catch (error) {
                    this.dispatchEvent(new CustomEvent('nativeAdError', { bubbles: true, detail: error }));
                }
            }
            disconnectFromFeed() {
                var _a;
                (_a = this.attachedFeed) === null || _a === void 0 ? void 0 : _a.detach(this);
                this.attachedFeed = undefined;
            }
        });
    };
    const connectNativeAdElements = () => {
        document
            .querySelectorAll(NATIVE_AD_ELEMENT_NAME)
            .forEach((element) => { var _a, _b; return (_b = (_a = element).connectToFeed) === null || _b === void 0 ? void 0 : _b.call(_a); });
    };

    const intersectRects = (left, right) => {
        const x = Math.max(left.x, right.x);
        const y = Math.max(left.y, right.y);
        const maxX = Math.min(left.x + left.width, right.x + right.width);
        const maxY = Math.min(left.y + left.height, right.y + right.height);
        return {
            x,
            y,
            width: Math.max(0, maxX - x),
            height: Math.max(0, maxY - y),
        };
    };
    const toNativeRect = (rect) => ({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
    });
    const clipsDescendants = (element) => {
        const style = window.getComputedStyle(element);
        return [style.overflow, style.overflowX, style.overflowY].some((value) => ['auto', 'hidden', 'scroll', 'clip'].includes(value));
    };
    function* nativeAdAncestors(element) {
        var _a, _b;
        let current = element;
        while (current) {
            const root = current.getRootNode();
            current =
                (_b = (_a = current.assignedSlot) !== null && _a !== void 0 ? _a : current.parentElement) !== null && _b !== void 0 ? _b : (root instanceof ShadowRoot ? root.host : null);
            if (current)
                yield current;
        }
    }
    const measureNativeAdSlot = (element, scrollElement) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const style = window.getComputedStyle(element);
        const domRect = element.getBoundingClientRect();
        if (!element.isConnected ||
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            Number.parseFloat(style.opacity || '1') === 0 ||
            domRect.width <= 0 ||
            domRect.height <= 0) {
            return undefined;
        }
        const rect = toNativeRect(domRect);
        let clipRect = scrollElement
            ? rect
            : {
                x: (_b = (_a = window.visualViewport) === null || _a === void 0 ? void 0 : _a.offsetLeft) !== null && _b !== void 0 ? _b : 0,
                y: (_d = (_c = window.visualViewport) === null || _c === void 0 ? void 0 : _c.offsetTop) !== null && _d !== void 0 ? _d : 0,
                width: (_f = (_e = window.visualViewport) === null || _e === void 0 ? void 0 : _e.width) !== null && _f !== void 0 ? _f : window.innerWidth,
                height: (_h = (_g = window.visualViewport) === null || _g === void 0 ? void 0 : _g.height) !== null && _h !== void 0 ? _h : window.innerHeight,
            };
        let foundScrollElement = !scrollElement;
        for (const ancestor of nativeAdAncestors(element)) {
            if (ancestor === scrollElement) {
                foundScrollElement = true;
                break;
            }
            if (clipsDescendants(ancestor)) {
                clipRect = intersectRects(clipRect, toNativeRect(ancestor.getBoundingClientRect()));
            }
        }
        clipRect = intersectRects(rect, clipRect);
        if (!foundScrollElement || clipRect.width <= 0 || clipRect.height <= 0)
            return undefined;
        if (scrollElement) {
            const origin = scrollElement.getBoundingClientRect();
            const translate = (value) => (Object.assign(Object.assign({}, value), { x: value.x - origin.left + scrollElement.scrollLeft, y: value.y - origin.top + scrollElement.scrollTop }));
            return { rect: translate(rect), clipRect: translate(clipRect) };
        }
        return { rect, clipRect };
    };
    const measureNativeAdScrollContainer = (element) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const rect = toNativeRect(element.getBoundingClientRect());
        let clipRect = intersectRects(rect, {
            x: (_b = (_a = window.visualViewport) === null || _a === void 0 ? void 0 : _a.offsetLeft) !== null && _b !== void 0 ? _b : 0,
            y: (_d = (_c = window.visualViewport) === null || _c === void 0 ? void 0 : _c.offsetTop) !== null && _d !== void 0 ? _d : 0,
            width: (_f = (_e = window.visualViewport) === null || _e === void 0 ? void 0 : _e.width) !== null && _f !== void 0 ? _f : window.innerWidth,
            height: (_h = (_g = window.visualViewport) === null || _g === void 0 ? void 0 : _g.height) !== null && _h !== void 0 ? _h : window.innerHeight,
        });
        for (const ancestor of nativeAdAncestors(element)) {
            if (clipsDescendants(ancestor)) {
                clipRect = intersectRects(clipRect, toNativeRect(ancestor.getBoundingClientRect()));
            }
        }
        return { rect, clipRect, contentWidth: element.scrollWidth, contentHeight: element.scrollHeight };
    };

    /**
     * Layouts rendered by the native Google Mobile Ads SDK.
     *
     * The dimensions of a native ad slot must remain stable while it is used by a
     * virtual scroller. `small` is intended for compact rows, while `medium`
     * includes a larger media area.
     */
    exports.NativeAdTemplate = void 0;
    (function (NativeAdTemplate) {
        NativeAdTemplate["Small"] = "small";
        NativeAdTemplate["Medium"] = "medium";
    })(exports.NativeAdTemplate || (exports.NativeAdTemplate = {}));

    const SCROLL_SETTLE_MS = 120;
    const MAX_NATIVE_ADS = 3;
    const MAX_ACTIVE_FEEDS = 2;
    const MIN_SMALL_SLOT_WIDTH = 120;
    const MIN_MEDIUM_SLOT_WIDTH = 144;
    const MIN_MEDIUM_SLOT_HEIGHT = 300;
    const MIN_SMALL_SLOT_HEIGHT = 120;
    const TEMPLATE_ATTRIBUTE = 'data-capacitor-admob-template';
    const applySlotDefaults = (element, template) => {
        const root = element.getRootNode();
        const container = root instanceof ShadowRoot ? root : element.ownerDocument.head;
        if (!container.querySelector('style[data-capacitor-admob-defaults]')) {
            const style = element.ownerDocument.createElement('style');
            style.setAttribute('data-capacitor-admob-defaults', '');
            // Prefer the first cascade layer; older WebViews use zero-specificity rules.
            const defaults = `
      :where([${TEMPLATE_ATTRIBUTE}]) { display: block; height: 320px; }
      :where([${TEMPLATE_ATTRIBUTE}="small"]) { height: 120px; }
    `;
            style.textContent =
                'CSSLayerBlockRule' in globalThis ? `@layer capacitor-admob-defaults { ${defaults} }` : defaults;
            container.prepend(style);
        }
        element.setAttribute(TEMPLATE_ATTRIBUTE, template);
    };
    let bridge;
    let sessionSequence = 0;
    const feeds = new Map();
    const createSessionId = () => { var _a, _b, _c; return (_c = (_b = (_a = globalThis.crypto) === null || _a === void 0 ? void 0 : _a.randomUUID) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : `${Date.now()}-${++sessionSequence}-${Math.random().toString(36).slice(2)}`; };
    /**
     * Experimental manager for native-ad integration research.
     *
     * A stable `slotKey`, rather than the element or array index, owns the native
     * ad lifecycle. Virtual-scroller compatibility has not yet been validated.
     *
     * @experimental Native overlay gesture routing is still being validated on devices.
     */
    class NativeAdFeed {
        constructor(options) {
            var _a;
            this.sessionId = createSessionId();
            this.slots = new Map();
            this.elementSlots = new Map();
            this.scrollRoots = new Set();
            this.destroyed = false;
            this.nativeStarted = false;
            this.paused = false;
            this.layoutInvalidated = false;
            this.lastPlacementWasDirect = false;
            this.placementAcknowledgementRequired = false;
            this.operationTask = Promise.resolve();
            this.updateDirty = false;
            this.placementSequence = 0;
            this.listenerHandles = new Set();
            this.handleViewportMotion = (event) => {
                if (this.destroyed) {
                    return;
                }
                if (!(this.nativeScrollElement &&
                    event instanceof Event &&
                    ['scroll', 'touchmove', 'wheel'].includes(event.type))) {
                    this.schedulePlacementUpdate();
                }
                this.scheduleEvaluation();
            };
            this.handleVisibilityChange = () => {
                if (this.destroyed) {
                    return;
                }
                if (document.hidden) {
                    this.layoutInvalidated = true;
                    void this.requestPlacementUpdate();
                    return;
                }
                this.scheduleEvaluation();
            };
            const id = options.feedId.trim();
            if (!id) {
                throw new Error('Native ad feed id must not be empty');
            }
            if (feeds.has(id)) {
                throw new Error(`Native ad feed id already exists: ${id}`);
            }
            if (feeds.size >= MAX_ACTIVE_FEEDS) {
                throw new Error(`At most ${MAX_ACTIVE_FEEDS} native ad feeds can be active`);
            }
            this.options = Object.assign(Object.assign({}, options), { feedId: id });
            this.nativeScrollElement = core.Capacitor.getPlatform() === 'ios' ? options.scrollElement : undefined;
            if (typeof IntersectionObserver !== 'undefined') {
                this.intersectionObserver = new IntersectionObserver((entries) => {
                    for (const entry of entries) {
                        const slotKey = this.elementSlots.get(entry.target);
                        const state = slotKey ? this.slots.get(slotKey) : undefined;
                        if (state) {
                            state.intersecting = entry.isIntersecting;
                        }
                    }
                    this.schedulePlacementUpdate();
                    this.scheduleEvaluation();
                });
            }
            if (typeof ResizeObserver !== 'undefined') {
                this.resizeObserver = new ResizeObserver(this.handleViewportMotion);
                if (this.nativeScrollElement)
                    this.resizeObserver.observe(this.nativeScrollElement);
            }
            document.addEventListener('scroll', this.handleViewportMotion, true);
            document.addEventListener('touchmove', this.handleViewportMotion, { capture: true, passive: true });
            document.addEventListener('wheel', this.handleViewportMotion, { capture: true, passive: true });
            window.addEventListener('resize', this.handleViewportMotion, { passive: true });
            (_a = window.visualViewport) === null || _a === void 0 ? void 0 : _a.addEventListener('resize', this.handleViewportMotion, { passive: true });
            document.addEventListener('visibilitychange', this.handleVisibilityChange);
            document.addEventListener('load', this.handleViewportMotion, true);
            feeds.set(id, this);
        }
        static async create(options) {
            var _a;
            if (!bridge) {
                throw new Error('AdMob native ad bridge is not configured');
            }
            if (typeof document === 'undefined' || typeof window === 'undefined') {
                throw new Error('NativeAdFeed can only be created in a browser environment');
            }
            if (options.isTesting !== true && !((_a = options.adId) === null || _a === void 0 ? void 0 : _a.trim())) {
                throw new Error('adId is required unless isTesting is true');
            }
            const feed = new NativeAdFeed(options);
            try {
                await bridge.startNativeAdFeed({ feedId: feed.feedId, sessionId: feed.sessionId });
                feed.nativeStarted = true;
                defineNativeAdElement((feedId) => feeds.get(feedId));
                connectNativeAdElements();
                return feed;
            }
            catch (error) {
                await feed.destroy();
                throw error;
            }
        }
        get feedId() {
            return this.options.feedId;
        }
        async addListener(eventName, listener) {
            this.assertActive();
            if (!bridge) {
                throw new Error('AdMob native ad bridge is not configured');
            }
            const nativeHandle = await bridge.addListener(eventName, (event) => {
                if (event.feedId === this.options.feedId && event.sessionId === this.sessionId) {
                    const filteredListener = listener;
                    filteredListener(event);
                }
            });
            if (this.destroyed) {
                await nativeHandle.remove();
                this.assertActive();
            }
            let removed = false;
            const handle = {
                remove: async () => {
                    if (removed) {
                        return;
                    }
                    removed = true;
                    this.listenerHandles.delete(handle);
                    await nativeHandle.remove();
                },
            };
            this.listenerHandles.add(handle);
            return handle;
        }
        attach(slotKey, element) {
            var _a, _b, _c;
            this.assertActive();
            const normalizedKey = slotKey.trim();
            if (!normalizedKey) {
                throw new Error('Native ad slotKey must not be empty');
            }
            const previousKey = this.elementSlots.get(element);
            if (previousKey === normalizedKey) {
                return;
            }
            if (previousKey && previousKey !== normalizedKey) {
                this.detach(element);
            }
            const existing = this.slots.get(normalizedKey);
            if ((existing === null || existing === void 0 ? void 0 : existing.element) && existing.element !== element) {
                throw new Error(`Native ad slotKey is already attached: ${normalizedKey}`);
            }
            const state = existing !== null && existing !== void 0 ? existing : {
                slotKey: normalizedKey,
                generation: 0,
                intersecting: !this.intersectionObserver,
                status: 'idle',
                lastUsed: Date.now(),
                loadVersion: 0,
            };
            applySlotDefaults(element, (_a = this.options.template) !== null && _a !== void 0 ? _a : exports.NativeAdTemplate.Medium);
            state.element = element;
            state.generation += 1;
            state.lastUsed = Date.now();
            this.slots.set(normalizedKey, state);
            this.elementSlots.set(element, normalizedKey);
            this.updateScrollRoots();
            (_b = this.intersectionObserver) === null || _b === void 0 ? void 0 : _b.observe(element);
            (_c = this.resizeObserver) === null || _c === void 0 ? void 0 : _c.observe(element);
            this.scheduleEvaluation();
        }
        detach(element) {
            var _a, _b;
            const slotKey = this.elementSlots.get(element);
            if (!slotKey) {
                return;
            }
            const state = this.slots.get(slotKey);
            if ((state === null || state === void 0 ? void 0 : state.element) === element) {
                state.element = undefined;
                state.intersecting = false;
                state.generation += 1;
                state.lastUsed = Date.now();
            }
            (_a = this.intersectionObserver) === null || _a === void 0 ? void 0 : _a.unobserve(element);
            (_b = this.resizeObserver) === null || _b === void 0 ? void 0 : _b.unobserve(element);
            this.elementSlots.delete(element);
            this.updateScrollRoots();
            void this.requestPlacementUpdate();
            this.scheduleEvaluation();
        }
        async reload(slotKey) {
            this.assertActive();
            const normalizedKey = slotKey.trim();
            const state = this.slots.get(normalizedKey);
            if (!state) {
                throw new Error(`Native ad slotKey is not registered: ${normalizedKey}`);
            }
            await this.runOperation(async () => {
                await this.removeStateAd(state);
                const protectedStates = new Set(this.getVisibleStates());
                protectedStates.add(state);
                await this.evictUnusedAds(protectedStates);
                if ([...this.slots.values()].filter((slot) => this.occupiesNativeAd(slot)).length >= MAX_NATIVE_ADS) {
                    throw new Error('Native ad capacity is currently in use by visible slots');
                }
                await this.loadState(state);
            });
        }
        /** Immediately hides this feed's overlays until {@link resume} is called. */
        async pause() {
            this.assertActive();
            this.paused = true;
            this.layoutInvalidated = true;
            if (!(await this.requestPlacementUpdate())) {
                throw new Error('Failed to hide native ad placements');
            }
        }
        /** Re-evaluates slots and restores eligible overlays after the viewport settles. */
        resume() {
            this.assertActive();
            this.paused = false;
            this.scheduleEvaluation();
        }
        /** Hides stale overlays and remeasures after an application-driven layout change. */
        async invalidateLayout() {
            this.assertActive();
            this.layoutInvalidated = true;
            this.scheduleEvaluation();
            if (!(await this.requestPlacementUpdate())) {
                throw new Error('Failed to hide native ad placements');
            }
        }
        async destroy() {
            var _a, _b, _c;
            if (!this.destroyed) {
                this.destroyed = true;
                feeds.delete(this.options.feedId);
                document.removeEventListener('scroll', this.handleViewportMotion, true);
                for (const root of this.scrollRoots) {
                    root.removeEventListener('scroll', this.handleViewportMotion, true);
                }
                this.scrollRoots.clear();
                document.removeEventListener('touchmove', this.handleViewportMotion, true);
                document.removeEventListener('wheel', this.handleViewportMotion, true);
                window.removeEventListener('resize', this.handleViewportMotion);
                (_a = window.visualViewport) === null || _a === void 0 ? void 0 : _a.removeEventListener('resize', this.handleViewportMotion);
                document.removeEventListener('visibilitychange', this.handleVisibilityChange);
                document.removeEventListener('load', this.handleViewportMotion, true);
                if (this.settleTimer) {
                    clearTimeout(this.settleTimer);
                }
                if (this.placementFrame !== undefined) {
                    cancelAnimationFrame(this.placementFrame);
                    this.placementFrame = undefined;
                }
                (_b = this.intersectionObserver) === null || _b === void 0 ? void 0 : _b.disconnect();
                (_c = this.resizeObserver) === null || _c === void 0 ? void 0 : _c.disconnect();
            }
            if (this.destroyTask) {
                return this.destroyTask;
            }
            this.destroyTask = this.destroyResources();
            try {
                await this.destroyTask;
            }
            finally {
                this.destroyTask = undefined;
            }
        }
        schedulePlacementUpdate() {
            if (this.destroyed || this.placementFrame !== undefined) {
                return;
            }
            this.placementFrame = requestAnimationFrame(() => {
                this.placementFrame = undefined;
                void this.requestPlacementUpdate(true);
            });
        }
        updateScrollRoots() {
            const roots = new Set();
            for (const element of this.elementSlots.keys()) {
                for (const ancestor of [element, ...nativeAdAncestors(element)]) {
                    const root = ancestor.getRootNode();
                    if (root instanceof ShadowRoot)
                        roots.add(root);
                }
            }
            for (const root of this.scrollRoots) {
                if (!roots.has(root)) {
                    root.removeEventListener('scroll', this.handleViewportMotion, true);
                    this.scrollRoots.delete(root);
                }
            }
            for (const root of roots) {
                if (!this.scrollRoots.has(root)) {
                    // Element scroll events do not cross a shadow boundary.
                    root.addEventListener('scroll', this.handleViewportMotion, true);
                    this.scrollRoots.add(root);
                }
            }
        }
        scheduleEvaluation() {
            if (this.destroyed) {
                return;
            }
            if (this.settleTimer) {
                clearTimeout(this.settleTimer);
            }
            this.settleTimer = setTimeout(() => {
                this.layoutInvalidated = false;
                void this.runOperation(() => this.evaluate());
            }, SCROLL_SETTLE_MS);
        }
        async evaluate() {
            if (this.destroyed || this.paused || document.hidden) {
                return;
            }
            const visibleStates = this.getVisibleStates();
            for (const state of visibleStates) {
                state.lastUsed = Date.now();
            }
            await this.evictUnusedAds(new Set(visibleStates));
            const occupied = [...this.slots.values()].filter((state) => this.occupiesNativeAd(state)).length;
            const loadable = visibleStates
                .filter((state) => state.status === 'idle')
                .slice(0, Math.max(0, MAX_NATIVE_ADS - occupied));
            await Promise.allSettled(loadable.map((state) => this.loadState(state)));
            void this.requestPlacementUpdate();
        }
        async loadState(state) {
            var _a;
            if (state.status !== 'idle' || !bridge) {
                return;
            }
            state.status = 'loading';
            const loadVersion = ++state.loadVersion;
            try {
                await bridge.loadNativeAd({
                    feedId: this.options.feedId,
                    sessionId: this.sessionId,
                    slotKey: state.slotKey,
                    template: (_a = this.options.template) !== null && _a !== void 0 ? _a : exports.NativeAdTemplate.Medium,
                    style: this.options.style,
                    adId: this.options.adId,
                    isTesting: this.options.isTesting,
                    npa: this.options.npa,
                });
                if (state.loadVersion === loadVersion) {
                    state.status = 'loaded';
                    state.lastUsed = Date.now();
                }
            }
            catch (error) {
                if (state.loadVersion === loadVersion) {
                    state.status = 'failed';
                }
                throw error;
            }
        }
        async evictUnusedAds(visibleStates) {
            const occupied = [...this.slots.values()].filter((state) => this.occupiesNativeAd(state));
            const requestedLoads = [...visibleStates].filter((state) => state.status === 'idle').length;
            const evictionCount = Math.max(0, occupied.length + Math.min(requestedLoads, MAX_NATIVE_ADS) - MAX_NATIVE_ADS);
            const evicted = occupied
                .filter((state) => !visibleStates.has(state))
                .sort((left, right) => left.lastUsed - right.lastUsed)
                .slice(0, evictionCount);
            await Promise.allSettled(evicted.map((state) => this.removeStateAd(state)));
            const detached = [...this.slots.values()]
                .filter((state) => !state.element && !this.occupiesNativeAd(state))
                .sort((left, right) => right.lastUsed - left.lastUsed);
            for (const state of detached.slice(MAX_NATIVE_ADS)) {
                this.slots.delete(state.slotKey);
            }
        }
        occupiesNativeAd(state) {
            return ['loading', 'loaded', 'removing', 'removeFailed'].includes(state.status);
        }
        getVisibleStates() {
            return [...this.slots.values()].filter((state) => {
                const measured = state.element && state.intersecting ? measureNativeAdSlot(state.element) : undefined;
                return Boolean(measured && this.isSupportedSize(measured));
            });
        }
        isSupportedSize(measured) {
            var _a, _b;
            const minimumHeight = ((_a = this.options.template) !== null && _a !== void 0 ? _a : exports.NativeAdTemplate.Medium) === exports.NativeAdTemplate.Small
                ? MIN_SMALL_SLOT_HEIGHT
                : MIN_MEDIUM_SLOT_HEIGHT;
            const minimumWidth = ((_b = this.options.template) !== null && _b !== void 0 ? _b : exports.NativeAdTemplate.Medium) === exports.NativeAdTemplate.Small
                ? MIN_SMALL_SLOT_WIDTH
                : MIN_MEDIUM_SLOT_WIDTH;
            return measured.rect.width >= minimumWidth && measured.rect.height >= minimumHeight;
        }
        async removeStateAd(state) {
            if (state.status === 'removing') {
                return;
            }
            if (!bridge || state.status === 'idle' || state.status === 'failed') {
                state.status = 'idle';
                return;
            }
            state.status = 'removing';
            const removeVersion = ++state.loadVersion;
            await this.requestPlacementUpdate();
            try {
                await bridge.removeNativeAd({
                    feedId: this.options.feedId,
                    sessionId: this.sessionId,
                    slotKey: state.slotKey,
                });
                if (state.loadVersion === removeVersion) {
                    state.status = 'idle';
                }
            }
            catch (error) {
                if (state.loadVersion === removeVersion) {
                    state.status = 'removeFailed';
                }
                throw error;
            }
        }
        runOperation(operation) {
            const result = this.operationTask.then(operation);
            this.operationTask = result.catch(() => undefined);
            return result;
        }
        async destroyResources() {
            await Promise.all([
                ...[...this.listenerHandles].map((handle) => handle.remove()),
                ...(this.nativeStarted && bridge
                    ? [bridge.destroyNativeAdFeed({ feedId: this.options.feedId, sessionId: this.sessionId })]
                    : []),
            ]);
            this.nativeStarted = false;
            this.listenerHandles.clear();
            this.slots.clear();
            this.elementSlots.clear();
        }
        requestPlacementUpdate(allowDirect = false) {
            this.updateDirty = true;
            this.placementAcknowledgementRequired || (this.placementAcknowledgementRequired = !allowDirect);
            if (!this.placementUpdateTask) {
                this.placementUpdateTask = Promise.resolve().then(() => this.flushPlacementUpdates());
            }
            return this.placementUpdateTask;
        }
        async flushPlacementUpdates() {
            if (!bridge || this.destroyed) {
                return true;
            }
            try {
                while (this.updateDirty && !this.destroyed) {
                    this.updateDirty = false;
                    const allowDirect = !this.placementAcknowledgementRequired;
                    this.placementAcknowledgementRequired = false;
                    const placements = [...this.slots.values()]
                        .filter((state) => state.status === 'loaded')
                        .map((state) => {
                        const measured = state.element ? measureNativeAdSlot(state.element, this.nativeScrollElement) : undefined;
                        const visible = Boolean(!this.paused && !this.layoutInvalidated && measured && this.isSupportedSize(measured) && !document.hidden);
                        return {
                            feedId: this.options.feedId,
                            slotKey: state.slotKey,
                            generation: state.generation,
                            visible,
                            rect: measured === null || measured === void 0 ? void 0 : measured.rect,
                            clipRect: measured === null || measured === void 0 ? void 0 : measured.clipRect,
                        };
                    });
                    const scrollContainer = this.nativeScrollElement
                        ? measureNativeAdScrollContainer(this.nativeScrollElement)
                        : undefined;
                    const serializedPlacements = JSON.stringify({ placements, scrollContainer });
                    if (serializedPlacements === this.lastPlacements && (allowDirect || !this.lastPlacementWasDirect)) {
                        continue;
                    }
                    try {
                        const batch = Object.assign({ feedId: this.options.feedId, sessionId: this.sessionId, sequence: ++this.placementSequence, placements }, (scrollContainer ? { scrollContainer } : {}));
                        const channel = core.Capacitor.getPlatform() === 'android'
                            ? window
                                .capacitorAdMobPlacements
                            : undefined;
                        let sentDirectly = false;
                        if (allowDirect && channel) {
                            try {
                                channel.postMessage(JSON.stringify(batch));
                                sentDirectly = true;
                            }
                            catch (_a) {
                                // Keep the acknowledged bridge available if the direct channel fails.
                            }
                        }
                        if (!sentDirectly)
                            await bridge.updateNativeAdPlacements(batch);
                        this.lastPlacementWasDirect = sentDirectly;
                        this.lastPlacements = serializedPlacements;
                    }
                    catch (_b) {
                        this.lastPlacements = undefined;
                        // Retry on the next scroll, resize, or lifecycle update without
                        // creating an unhandled rejection from this fire-and-forget task.
                        this.updateDirty = true;
                        return false;
                    }
                }
                return true;
            }
            catch (_c) {
                this.updateDirty = true;
                return false;
            }
            finally {
                this.placementUpdateTask = undefined;
            }
        }
        assertActive() {
            if (this.destroyed) {
                throw new Error(`Native ad feed has been destroyed: ${this.options.feedId}`);
            }
        }
    }
    const configureNativeAdBridge = (adMobBridge) => {
        bridge = adMobBridge;
    };

    exports.MaxAdContentRating = void 0;
    (function (MaxAdContentRating) {
        /**
         * Content suitable for general audiences, including families.
         */
        MaxAdContentRating["General"] = "General";
        /**
         * Content suitable for most audiences with parental guidance.
         */
        MaxAdContentRating["ParentalGuidance"] = "ParentalGuidance";
        /**
         * Content suitable for teen and older audiences.
         */
        MaxAdContentRating["Teen"] = "Teen";
        /**
         * Content suitable only for mature audiences.
         */
        MaxAdContentRating["MatureAudience"] = "MatureAudience";
    })(exports.MaxAdContentRating || (exports.MaxAdContentRating = {}));

    // This enum should be keep in sync with their native equivalents with the same name
    exports.BannerAdPluginEvents = void 0;
    (function (BannerAdPluginEvents) {
        /**
         * Emits when the displayed banner size changes.
         */
        BannerAdPluginEvents["SizeChanged"] = "bannerAdSizeChanged";
        /**
         * Emits when a banner ad has loaded.
         */
        BannerAdPluginEvents["Loaded"] = "bannerAdLoaded";
        /**
         * Emits when a banner ad fails to load.
         */
        BannerAdPluginEvents["FailedToLoad"] = "bannerAdFailedToLoad";
        /**
         * Emits when a banner opens an overlay after the user taps it.
         */
        BannerAdPluginEvents["Opened"] = "bannerAdOpened";
        /**
         * Emits when the banner overlay is closed.
         */
        BannerAdPluginEvents["Closed"] = "bannerAdClosed";
        /**
         * Emits when an impression is recorded for the banner ad.
         */
        BannerAdPluginEvents["AdImpression"] = "bannerAdImpression";
        /**
         * Emits impression-level ad revenue data when a paid event is recorded.
         */
        BannerAdPluginEvents["AdPaid"] = "bannerAdPaid";
    })(exports.BannerAdPluginEvents || (exports.BannerAdPluginEvents = {}));

    /**
     * @see https://developer.android.com/reference/android/widget/LinearLayout#attr_android:gravity
     */
    exports.BannerAdPosition = void 0;
    (function (BannerAdPosition) {
        /**
         * Positions the banner at the top center of the screen.
         */
        BannerAdPosition["TOP_CENTER"] = "TOP_CENTER";
        /**
         * Positions the banner at the center of the screen.
         */
        BannerAdPosition["CENTER"] = "CENTER";
        /**
         * Positions the banner at the bottom center of the screen.
         */
        BannerAdPosition["BOTTOM_CENTER"] = "BOTTOM_CENTER";
    })(exports.BannerAdPosition || (exports.BannerAdPosition = {}));

    /**
     *  For more information:
     *  https://developers.google.com/admob/ios/banner#banner_sizes
     *  https://developers.google.com/android/reference/com/google/android/gms/ads/AdSize
     *
     * */
    exports.BannerAdSize = void 0;
    (function (BannerAdSize) {
        /**
         * Mobile Marketing Association (MMA)
         * banner ad size (320x50 density-independent pixels).
         */
        BannerAdSize["BANNER"] = "BANNER";
        /**
         * Interactive Advertising Bureau (IAB)
         * full banner ad size (468x60 density-independent pixels).
         */
        BannerAdSize["FULL_BANNER"] = "FULL_BANNER";
        /**
         * Large banner ad size (320x100 density-independent pixels).
         */
        BannerAdSize["LARGE_BANNER"] = "LARGE_BANNER";
        /**
         * Interactive Advertising Bureau (IAB)
         * medium rectangle ad size (300x250 density-independent pixels).
         */
        BannerAdSize["MEDIUM_RECTANGLE"] = "MEDIUM_RECTANGLE";
        /**
         * Interactive Advertising Bureau (IAB)
         * leaderboard ad size (728x90 density-independent pixels).
         */
        BannerAdSize["LEADERBOARD"] = "LEADERBOARD";
        /**
         * A dynamically sized banner that is full-width and auto-height.
         */
        BannerAdSize["ADAPTIVE_BANNER"] = "ADAPTIVE_BANNER";
        /**
         * A legacy smart banner sized to the screen width.
         * Retained for compatibility; use `ADAPTIVE_BANNER` for new integrations.
         *
         * @deprecated Use `ADAPTIVE_BANNER` instead.
         */
        BannerAdSize["SMART_BANNER"] = "SMART_BANNER";
    })(exports.BannerAdSize || (exports.BannerAdSize = {}));

    // This enum should be keep in sync with their native equivalents with the same name
    exports.InterstitialAdPluginEvents = void 0;
    (function (InterstitialAdPluginEvents) {
        /**
         * Emits when an interstitial ad has loaded and is ready to show.
         */
        InterstitialAdPluginEvents["Loaded"] = "interstitialAdLoaded";
        /**
         * Emits when an interstitial ad fails to load.
         */
        InterstitialAdPluginEvents["FailedToLoad"] = "interstitialAdFailedToLoad";
        /**
         * Emits when an interstitial ad is shown.
         */
        InterstitialAdPluginEvents["Showed"] = "interstitialAdShowed";
        /**
         * Emits when a loaded interstitial ad fails to show.
         */
        InterstitialAdPluginEvents["FailedToShow"] = "interstitialAdFailedToShow";
        /**
         * Emits when an interstitial ad is dismissed.
         */
        InterstitialAdPluginEvents["Dismissed"] = "interstitialAdDismissed";
        /**
         * Emits impression-level ad revenue data when a paid event is recorded.
         */
        InterstitialAdPluginEvents["AdImpression"] = "interstitialAdImpression";
    })(exports.InterstitialAdPluginEvents || (exports.InterstitialAdPluginEvents = {}));

    // This enum should be keep in sync with their native equivalents with the same name
    exports.RewardInterstitialAdPluginEvents = void 0;
    (function (RewardInterstitialAdPluginEvents) {
        /**
         * Emits when a rewarded interstitial ad has loaded and is ready to show.
         */
        RewardInterstitialAdPluginEvents["Loaded"] = "onRewardedInterstitialAdLoaded";
        /**
         * Emits when a rewarded interstitial ad fails to load.
         */
        RewardInterstitialAdPluginEvents["FailedToLoad"] = "onRewardedInterstitialAdFailedToLoad";
        /**
         * Emits when a rewarded interstitial ad is shown.
         */
        RewardInterstitialAdPluginEvents["Showed"] = "onRewardedInterstitialAdShowed";
        /**
         * Emits when a loaded rewarded interstitial ad fails to show.
         */
        RewardInterstitialAdPluginEvents["FailedToShow"] = "onRewardedInterstitialAdFailedToShow";
        /**
         * Emits when a rewarded interstitial ad is dismissed.
         *
         * This event does not indicate whether the user earned a reward. Listen for
         * `Rewarded` separately before granting the reward.
         */
        RewardInterstitialAdPluginEvents["Dismissed"] = "onRewardedInterstitialAdDismissed";
        /**
         * Emits when the user earns the advertised reward.
         */
        RewardInterstitialAdPluginEvents["Rewarded"] = "onRewardedInterstitialAdReward";
        /**
         * Emits impression-level ad revenue data when a paid event is recorded.
         */
        RewardInterstitialAdPluginEvents["AdImpression"] = "onRewardedInterstitialAdImpression";
    })(exports.RewardInterstitialAdPluginEvents || (exports.RewardInterstitialAdPluginEvents = {}));

    // This enum should be keep in sync with their native equivalents with the same name
    exports.RewardAdPluginEvents = void 0;
    (function (RewardAdPluginEvents) {
        /**
         * Emits when the SDK records a click on a rewarded ad.
         */
        RewardAdPluginEvents["adClicked"] = "onRewardedVideoAdClicked";
        /**
         * Emits when a rewarded ad has loaded and is ready to show.
         */
        RewardAdPluginEvents["Loaded"] = "onRewardedVideoAdLoaded";
        /**
         * Emits when a rewarded ad fails to load.
         */
        RewardAdPluginEvents["FailedToLoad"] = "onRewardedVideoAdFailedToLoad";
        /**
         * Emits when a rewarded ad is shown.
         */
        RewardAdPluginEvents["Showed"] = "onRewardedVideoAdShowed";
        /**
         * Emits when a loaded rewarded ad fails to show.
         */
        RewardAdPluginEvents["FailedToShow"] = "onRewardedVideoAdFailedToShow";
        /**
         * Emits when a rewarded ad is dismissed.
         *
         * This event does not indicate whether the user earned a reward. Listen for
         * `Rewarded` separately before granting the reward.
         */
        RewardAdPluginEvents["Dismissed"] = "onRewardedVideoAdDismissed";
        /**
         * Emits when the user earns the advertised reward.
         */
        RewardAdPluginEvents["Rewarded"] = "onRewardedVideoAdReward";
        /**
         * Emits impression-level ad revenue data when a paid event is recorded.
         */
        RewardAdPluginEvents["AdImpression"] = "onRewardedVideoAdImpression";
    })(exports.RewardAdPluginEvents || (exports.RewardAdPluginEvents = {}));

    /**
     *  For more information:
     *  https://developers.google.com/admob/unity/reference/namespace/google-mobile-ads/ump/api#consentstatus
     *
     * */
    exports.AdmobConsentStatus = void 0;
    (function (AdmobConsentStatus) {
        /**
         * User consent not required.
         */
        AdmobConsentStatus["NOT_REQUIRED"] = "NOT_REQUIRED";
        /**
         * User consent already obtained.
         */
        AdmobConsentStatus["OBTAINED"] = "OBTAINED";
        /**
         * User consent required but not yet obtained.
         */
        AdmobConsentStatus["REQUIRED"] = "REQUIRED";
        /**
         * Unknown consent status, AdsConsent.requestInfoUpdate needs to be called to update it.
         */
        AdmobConsentStatus["UNKNOWN"] = "UNKNOWN";
    })(exports.AdmobConsentStatus || (exports.AdmobConsentStatus = {}));

    /**
     *  For more information:
     *  https://developers.google.com/admob/unity/reference/namespace/google-mobile-ads/ump/api#debuggeography
     *
     * */
    exports.AdmobConsentDebugGeography = void 0;
    (function (AdmobConsentDebugGeography) {
        /**
         * Debug geography disabled.
         */
        AdmobConsentDebugGeography[AdmobConsentDebugGeography["DISABLED"] = 0] = "DISABLED";
        /**
         * Geography appears as in EEA for debug devices.
         */
        AdmobConsentDebugGeography[AdmobConsentDebugGeography["EEA"] = 1] = "EEA";
        /**
         * Geography appears as not in EEA for debug devices.
         * @deprecated
         */
        AdmobConsentDebugGeography[AdmobConsentDebugGeography["NOT_EEA"] = 2] = "NOT_EEA";
        /**
         * Geography appears as in regulated US state for debug devices.
         */
        AdmobConsentDebugGeography[AdmobConsentDebugGeography["US"] = 3] = "US";
        /**
         * Geography appears as OTHER state for debug devices.
         */
        AdmobConsentDebugGeography[AdmobConsentDebugGeography["OTHER"] = 4] = "OTHER";
    })(exports.AdmobConsentDebugGeography || (exports.AdmobConsentDebugGeography = {}));

    /**
     * The precision of an impression-level ad value.
     */
    exports.AdValuePrecision = void 0;
    (function (AdValuePrecision) {
        /**
         * The ad value precision is unknown.
         */
        AdValuePrecision[AdValuePrecision["Unknown"] = 0] = "Unknown";
        /**
         * The ad value is estimated from aggregated data.
         */
        AdValuePrecision[AdValuePrecision["Estimated"] = 1] = "Estimated";
        /**
         * The ad value was provided by the publisher.
         */
        AdValuePrecision[AdValuePrecision["PublisherProvided"] = 2] = "PublisherProvided";
        /**
         * The ad value is the precise value paid for this ad.
         */
        AdValuePrecision[AdValuePrecision["Precise"] = 3] = "Precise";
    })(exports.AdValuePrecision || (exports.AdValuePrecision = {}));

    exports.AppOpenAdPluginEvents = void 0;
    (function (AppOpenAdPluginEvents) {
        /**
         * Emits when an App Open ad has loaded.
         */
        AppOpenAdPluginEvents["Loaded"] = "appOpenAdLoaded";
        /**
         * Emits when an App Open ad fails to load.
         */
        AppOpenAdPluginEvents["FailedToLoad"] = "appOpenAdFailedToLoad";
        /**
         * Emits when an App Open ad is shown.
         */
        AppOpenAdPluginEvents["Opened"] = "appOpenAdOpened";
        /**
         * Emits when an App Open ad is dismissed.
         */
        AppOpenAdPluginEvents["Closed"] = "appOpenAdClosed";
        /**
         * Emits when a loaded App Open ad fails to show.
         */
        AppOpenAdPluginEvents["FailedToShow"] = "appOpenAdFailedToShow";
        /**
         * Emits impression-level ad revenue data when a paid event is recorded.
         */
        AppOpenAdPluginEvents["AdImpression"] = "appOpenAdImpression";
    })(exports.AppOpenAdPluginEvents || (exports.AppOpenAdPluginEvents = {}));

    exports.NativeAdPluginEvents = void 0;
    (function (NativeAdPluginEvents) {
        NativeAdPluginEvents["Loaded"] = "nativeAdLoaded";
        NativeAdPluginEvents["FailedToLoad"] = "nativeAdFailedToLoad";
        NativeAdPluginEvents["Clicked"] = "nativeAdClicked";
        NativeAdPluginEvents["AdImpression"] = "nativeAdImpression";
        NativeAdPluginEvents["Opened"] = "nativeAdOpened";
        NativeAdPluginEvents["Closed"] = "nativeAdClosed";
        NativeAdPluginEvents["AdPaid"] = "nativeAdPaid";
    })(exports.NativeAdPluginEvents || (exports.NativeAdPluginEvents = {}));

    const nativeAdBridge = core.registerPlugin('AdMob', {
        web: () => Promise.resolve().then(function () { return web; }).then((m) => new m.AdMobWeb()),
    });
    const AdMob = nativeAdBridge;
    configureNativeAdBridge(nativeAdBridge);

    /**
     *  For more information:
     *  https://developers.google.com/admob/unity/reference/namespace/google-mobile-ads/ump/api#privacyoptionsrequirementstatus
     *
     * */
    var PrivacyOptionsRequirementStatus;
    (function (PrivacyOptionsRequirementStatus) {
        /**
         * Privacy options entry point is not required.
         */
        PrivacyOptionsRequirementStatus["NOT_REQUIRED"] = "NOT_REQUIRED";
        /**
         * Privacy options entry point is required.
         */
        PrivacyOptionsRequirementStatus["REQUIRED"] = "REQUIRED";
        /**
         * Privacy options requirement status is unknown.
         */
        PrivacyOptionsRequirementStatus["UNKNOWN"] = "UNKNOWN";
    })(PrivacyOptionsRequirementStatus || (PrivacyOptionsRequirementStatus = {}));

    class AdMobWeb extends core.WebPlugin {
        async initialize() {
            console.log('initialize');
        }
        async requestTrackingAuthorization() {
            console.log('requestTrackingAuthorization');
        }
        async trackingAuthorizationStatus() {
            return {
                status: 'authorized',
            };
        }
        async requestConsentInfo(options) {
            console.log('requestConsentInfo', options);
            return {
                status: exports.AdmobConsentStatus.REQUIRED,
                isConsentFormAvailable: true,
                canRequestAds: true,
                privacyOptionsRequirementStatus: PrivacyOptionsRequirementStatus.REQUIRED,
            };
        }
        async showPrivacyOptionsForm() {
            console.log('showPrivacyOptionsForm');
        }
        async showConsentForm() {
            console.log('showConsentForm');
            return {
                status: exports.AdmobConsentStatus.REQUIRED,
                canRequestAds: true,
                privacyOptionsRequirementStatus: PrivacyOptionsRequirementStatus.REQUIRED,
            };
        }
        async resetConsentInfo() {
            console.log('resetConsentInfo');
        }
        async setApplicationMuted(options) {
            console.log('setApplicationMuted', options);
        }
        async setApplicationVolume(options) {
            console.log('setApplicationVolume', options);
        }
        async showBanner(options) {
            console.log('showBanner', options);
        }
        async hideBanner() {
            console.log('hideBanner');
        }
        async resumeBanner() {
            console.log('resumeBanner');
        }
        async removeBanner() {
            console.log('removeBanner');
        }
        async startNativeAdFeed() {
            throw new Error('Native ads are only available on iOS and Android');
        }
        async destroyNativeAdFeed(options) {
            console.log('destroyNativeAdFeed', options);
        }
        async loadNativeAd() {
            throw new Error('Native ads are only available on iOS and Android');
        }
        async updateNativeAdPlacements(options) {
            console.log('updateNativeAdPlacements', options);
        }
        async removeNativeAd(options) {
            console.log('removeNativeAd', options);
        }
        async prepareInterstitial(options) {
            console.log('prepareInterstitial', options);
            return {
                adUnitId: options.adId,
            };
        }
        async showInterstitial(options) {
            console.log('showInterstitial', options);
        }
        async prepareRewardVideoAd(options) {
            console.log('prepareRewardVideoAd', options);
            return {
                adUnitId: options.adId,
            };
        }
        async showRewardVideoAd(options) {
            console.log('showRewardVideoAd', options);
            return {
                type: '',
                amount: 0,
            };
        }
        async prepareRewardInterstitialAd(options) {
            console.log('prepareRewardInterstitialAd', options);
            return {
                adUnitId: options.adId,
            };
        }
        async showRewardInterstitialAd(options) {
            console.log('showRewardInterstitialAd', options);
            return {
                type: '',
                amount: 0,
            };
        }
        async loadAppOpen(options) {
            console.log('loadAppOpen', options);
            return {
                adUnitId: options.adId,
            };
        }
        async showAppOpen(options) {
            console.log('showAppOpen', options);
        }
        async isAppOpenLoaded() {
            return { value: false };
        }
        addListener(eventName, listenerFunc) {
            console.log('addListener', eventName);
            return Promise.resolve({ remove: () => Promise.resolve() });
        }
    }

    var web = /*#__PURE__*/Object.freeze({
        __proto__: null,
        AdMobWeb: AdMobWeb
    });

    exports.AdMob = AdMob;
    exports.NativeAdFeed = NativeAdFeed;

    return exports;

})({}, capacitorExports);
//# sourceMappingURL=plugin.js.map
