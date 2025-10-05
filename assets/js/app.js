(() => {
  if (typeof window === 'undefined' || !window.document) {
    return;
  }

  const dom = {
    appRoot: document.getElementById('appRoot'),
    layout: document.getElementById('appLayout'),
    leftRail: document.getElementById('leftRail'),
    rightRail: document.getElementById('rightRail'),
    leftTabsBar: document.getElementById('leftRailTabs'),
    leftTabButtons: Array.from(document.querySelectorAll('[data-left-tab]')),
    leftTabPanes: document.getElementById('leftRailPanes'),
    rightTabsBar: document.getElementById('rightRailTabs'),
    rightTabButtons: Array.from(document.querySelectorAll('[data-right-tab]')),
    rightTabPanes: document.getElementById('rightRailPanes'),
    mobileDrawer: document.getElementById('mobileDrawer'),
    mobileTabs: Array.from(document.querySelectorAll('.mobile-tab')),
    mobilePanels: {
      tools: document.getElementById('mobilePanelTools'),
      color: document.getElementById('mobilePanelColor'),
      frames: document.getElementById('mobilePanelFrames'),
      settings: document.getElementById('mobilePanelSettings'),
    },
    sections: {
      tools: document.getElementById('panelTools'),
      color: document.getElementById('panelColor'),
      frames: document.getElementById('panelFrames'),
      settings: document.getElementById('panelSettings'),
    },
    canvases: {
      stack: document.getElementById('canvasStack'),
      drawing: /** @type {HTMLCanvasElement} */ (document.getElementById('drawingCanvas')),
      overlay: /** @type {HTMLCanvasElement} */ (document.getElementById('overlayCanvas')),
      selection: /** @type {HTMLCanvasElement} */ (document.getElementById('selectionCanvas')),
    },
    toggles: {
      left: document.getElementById('openLeftRail'),
      right: document.getElementById('openRightRail'),
    },
    toolGroupButtons: Array.from(document.querySelectorAll('.tool-group-button[data-tool-group]')),
    toolGrid: document.getElementById('toolGrid'),
    controls: {
      toggleGrid: document.getElementById('toggleGrid'),
      toggleMajorGrid: document.getElementById('toggleMajorGrid'),
      toggleBackgroundMode: document.getElementById('toggleBackgroundMode'),
      undoAction: document.getElementById('undoAction'),
      redoAction: document.getElementById('redoAction'),
      zoomOut: document.getElementById('zoomOut'),
      zoomIn: document.getElementById('zoomIn'),
      zoomLevel: document.getElementById('zoomLevel'),
      zoomSlider: document.getElementById('zoomSlider'),
      brushSize: document.getElementById('brushSize'),
      brushSizeValue: document.getElementById('brushSizeValue'),
      brushOpacity: document.getElementById('brushOpacity'),
      brushOpacityValue: document.getElementById('brushOpacityValue'),
      colorMode: Array.from(document.querySelectorAll('input[name="colorMode"]')),
      paletteList: document.getElementById('paletteList'),
      addPaletteColor: document.getElementById('addPaletteColor'),
      paletteIndex: document.getElementById('paletteIndex'),
      paletteColor: document.getElementById('paletteColor'),
      paletteR: document.getElementById('paletteR'),
      paletteG: document.getElementById('paletteG'),
      paletteB: document.getElementById('paletteB'),
      paletteA: document.getElementById('paletteA'),
      rgbColor: document.getElementById('rgbColor'),
      rgbR: document.getElementById('rgbR'),
      rgbG: document.getElementById('rgbG'),
      rgbB: document.getElementById('rgbB'),
      rgbA: document.getElementById('rgbA'),
      layerList: document.getElementById('layerList'),
      frameList: document.getElementById('frameList'),
      addLayer: document.getElementById('addLayer'),
      removeLayer: document.getElementById('removeLayer'),
      addFrame: document.getElementById('addFrame'),
      removeFrame: document.getElementById('removeFrame'),
      playAnimation: document.getElementById('playAnimation'),
      animationFps: document.getElementById('animationFps'),
      canvasWidth: document.getElementById('canvasWidth'),
      canvasHeight: document.getElementById('canvasHeight'),
      toggleChecker: document.getElementById('toggleChecker'),
      togglePixelPreview: document.getElementById('togglePixelPreview'),
      openDocument: document.getElementById('openDocument'),
      clearCanvas: document.getElementById('clearCanvas'),
      enableAutosave: document.getElementById('enableAutosave'),
      autosaveStatus: document.getElementById('autosaveStatus'),
    },
  };

  const LEFT_TAB_KEYS = ['tools', 'color'];
  const RIGHT_TAB_KEYS = ['frames', 'settings'];
  const TOOL_GROUPS = {
    selection: { label: '範囲選択', tools: ['selectRect', 'selectLasso', 'selectSame'] },
    pen: { label: 'ペン', tools: ['pen', 'eyedropper'] },
    eraser: { label: '消しゴム', tools: ['eraser'] },
    shape: { label: '図形', tools: ['line', 'curve', 'rect', 'rectFill', 'ellipse', 'ellipseFill'] },
    fill: { label: '塗りつぶし', tools: ['fill'] },
  };
  const DEFAULT_GROUP_TOOL = {
    selection: 'selectRect',
    pen: 'pen',
    eraser: 'eraser',
    shape: 'line',
    fill: 'fill',
  };
  const TOOL_TO_GROUP = Object.keys(TOOL_GROUPS).reduce((acc, key) => {
    TOOL_GROUPS[key].tools.forEach(tool => {
      acc[tool] = key;
    });
    return acc;
  }, {});

  const layoutMap = {
    tools: { desktop: dom.leftTabPanes || dom.leftRail, mobile: dom.mobilePanels.tools },
    color: { desktop: dom.leftTabPanes || dom.leftRail, mobile: dom.mobilePanels.color },
    frames: { desktop: dom.rightTabPanes || dom.rightRail, mobile: dom.mobilePanels.frames },
    settings: { desktop: dom.rightTabPanes || dom.rightRail, mobile: dom.mobilePanels.settings },
  };

  const ctx = {
    drawing: dom.canvases.drawing?.getContext('2d', { willReadFrequently: true }) || null,
    overlay: dom.canvases.overlay?.getContext('2d', { willReadFrequently: true }) || null,
    selection: dom.canvases.selection?.getContext('2d', { willReadFrequently: true }) || null,
  };

  if (ctx.drawing) {
    ctx.drawing.imageSmoothingEnabled = false;
  }
  if (ctx.overlay) {
    ctx.overlay.imageSmoothingEnabled = false;
  }
  if (ctx.selection) {
    ctx.selection.imageSmoothingEnabled = false;
  }

  const SESSION_STORAGE_KEY = 'pixieedraw:sessionState';
  const canUseSessionStorage = (() => {
    try {
      return typeof window !== 'undefined' && 'localStorage' in window && window.localStorage !== null;
    } catch (error) {
      return false;
    }
  })();
  let sessionPersistHandle = null;
  const AUTOSAVE_SUPPORTED = typeof window !== 'undefined' && 'showSaveFilePicker' in window && 'indexedDB' in window;
  const AUTOSAVE_DB_NAME = 'pixieedraw-autosave';
  const AUTOSAVE_DB_VERSION = 1;
  const AUTOSAVE_STORE_NAME = 'handles';
  const AUTOSAVE_HANDLE_KEY = 'document';
  const AUTOSAVE_WRITE_DELAY = 800;
  const DOCUMENT_FILE_VERSION = 1;
  let autosaveHandle = null;
  let pendingAutosaveHandle = null;
  let autosavePermissionListener = null;
  let autosaveWriteTimer = null;
  let autosaveRestoring = false;
  const brushOffsetCache = new Map();

  const rails = { leftCollapsed: false, rightCollapsed: window.innerWidth <= 900 };
  const state = createInitialState();
  restoreSessionState();
  updateGridDecorations();
  const pointerState = createPointerState();
  if (canUseSessionStorage) {
    window.addEventListener('beforeunload', persistSessionState);
  }
  let hoverPixel = null;
  let overlayNeedsRedraw = true;
  const history = { past: [], future: [], pending: null, limit: 50 };
  const fillPreviewCache = { key: null, pixels: null };
  const HISTORY_DRAW_TOOLS = new Set(['pen', 'eraser', 'line', 'curve', 'rect', 'rectFill', 'ellipse', 'ellipseFill', 'fill']);
  let toolButtons = [];
  let renderScheduled = false;
  let layoutMode = null;
  let playbackHandle = null;
  let lastFrameTime = 0;
  let curveBuilder = null;

  function createInitialState() {
    const width = 128;
    const height = 128;
    const palette = [
      { r: 0, g: 0, b: 0, a: 0 },
      { r: 20, g: 20, b: 20, a: 255 },
      { r: 88, g: 196, b: 255, a: 255 },
      { r: 255, g: 255, b: 255, a: 255 },
      { r: 255, g: 96, b: 96, a: 255 },
    ];
    const layers = [createLayer('レイヤー 1', width, height)];
    const frames = [createFrame('フレーム 1', layers, width, height)];

    return {
      width,
      height,
      scale: 8,
      pan: { x: 0, y: 0 },
      tool: 'pen',
      brushSize: 1,
      brushOpacity: 1,
      showGrid: true,
      showPixelGuides: true,
      showMajorGrid: false,
      gridScreenStep: 8,
      majorGridSpacing: 16,
      backgroundMode: 'dark',
      activeToolGroup: 'pen',
      lastGroupTool: { ...DEFAULT_GROUP_TOOL },
      activeLeftTab: 'tools',
      activeRightTab: 'frames',
      showChecker: true,
      colorMode: 'index',
      palette,
      activePaletteIndex: 2,
      activeRgb: { r: 88, g: 196, b: 255, a: 255 },
      frames,
      activeFrame: 0,
      activeLayer: frames[0].layers[0].id,
      selectionMask: null,
      selectionBounds: null,
      playback: { isPlaying: false, lastFrame: 0 },
    };
  }

  function createLayer(name, width, height) {
    const size = width * height;
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `layer-${Math.random().toString(36).slice(2)}`,
      name,
      visible: true,
      opacity: 1,
      indices: new Int16Array(size).fill(-1),
      direct: new Uint8ClampedArray(size * 4),
    };
  }

  function cloneLayer(baseLayer, width, height) {
    const layer = createLayer(baseLayer.name, width, height);
    layer.visible = baseLayer.visible;
    layer.opacity = baseLayer.opacity;
    layer.indices.set(baseLayer.indices);
    layer.direct.set(baseLayer.direct);
    return layer;
  }

  function createFrame(name, layers, width, height) {
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `frame-${Math.random().toString(36).slice(2)}`,
      name,
      duration: 1000 / 12,
      layers: layers.map(layer => cloneLayer(layer, width ?? state.width, height ?? state.height)),
    };
  }

  function createPointerState() {
    return {
      active: false,
      pointerId: null,
      tool: null,
      start: null,
      current: null,
      last: null,
      path: [],
      preview: null,
      selectionPreview: null,
      startClient: null,
      panOrigin: { x: 0, y: 0 },
      curveHandle: null,
    };
  }

  function makeHistorySnapshot() {
    return {
      width: state.width,
      height: state.height,
      scale: state.scale,
      pan: { x: state.pan.x, y: state.pan.y },
      tool: state.tool,
      brushSize: state.brushSize,
      brushOpacity: state.brushOpacity,
      colorMode: state.colorMode,
      palette: state.palette.map(color => ({ ...color })),
      activePaletteIndex: state.activePaletteIndex,
      activeRgb: { ...state.activeRgb },
      frames: state.frames.map(frame => ({
        id: frame.id,
        name: frame.name,
        duration: frame.duration,
        layers: frame.layers.map(layer => ({
          id: layer.id,
          name: layer.name,
          visible: layer.visible,
          opacity: layer.opacity,
          indices: new Int16Array(layer.indices),
          direct: new Uint8ClampedArray(layer.direct),
        })),
      })),
      activeFrame: state.activeFrame,
      activeLayer: state.activeLayer,
      selectionMask: state.selectionMask ? new Uint8Array(state.selectionMask) : null,
      selectionBounds: state.selectionBounds ? { ...state.selectionBounds } : null,
      showGrid: state.showGrid,
      showMajorGrid: state.showMajorGrid,
      gridScreenStep: state.gridScreenStep,
      majorGridSpacing: state.majorGridSpacing,
      backgroundMode: state.backgroundMode,
      activeToolGroup: state.activeToolGroup,
      lastGroupTool: { ...(state.lastGroupTool || DEFAULT_GROUP_TOOL) },
      activeLeftTab: state.activeLeftTab,
      activeRightTab: state.activeRightTab,
      showPixelGuides: state.showPixelGuides,
      showChecker: state.showChecker,
      playback: { ...state.playback },
    };
  }

  function applyHistorySnapshot(snapshot) {
    state.width = snapshot.width;
    state.height = snapshot.height;
    state.scale = snapshot.scale;
    state.pan = { x: snapshot.pan.x, y: snapshot.pan.y };
    state.tool = snapshot.tool;
    state.brushSize = snapshot.brushSize;
    state.brushOpacity = snapshot.brushOpacity;
    state.colorMode = snapshot.colorMode;
    state.palette = snapshot.palette.map(color => ({ ...color }));
    state.activePaletteIndex = snapshot.activePaletteIndex;
    state.activeRgb = { ...snapshot.activeRgb };
    state.frames = snapshot.frames.map(frame => ({
      id: frame.id,
      name: frame.name,
      duration: frame.duration,
      layers: frame.layers.map(layer => ({
        id: layer.id,
        name: layer.name,
        visible: layer.visible,
        opacity: layer.opacity,
        indices: new Int16Array(layer.indices),
        direct: new Uint8ClampedArray(layer.direct),
      })),
    }));
    state.activeFrame = snapshot.activeFrame;
    state.activeLayer = snapshot.activeLayer;
    state.selectionMask = snapshot.selectionMask ? new Uint8Array(snapshot.selectionMask) : null;
    state.selectionBounds = snapshot.selectionBounds ? { ...snapshot.selectionBounds } : null;
    state.showGrid = snapshot.showGrid;
    state.showMajorGrid = snapshot.showMajorGrid ?? false;
    state.gridScreenStep = snapshot.gridScreenStep ?? state.gridScreenStep ?? 16;
    state.majorGridSpacing = snapshot.majorGridSpacing ?? state.majorGridSpacing ?? 16;
    state.backgroundMode = snapshot.backgroundMode ?? 'dark';
    state.activeToolGroup = snapshot.activeToolGroup ?? state.activeToolGroup ?? TOOL_TO_GROUP[state.tool] ?? 'pen';
    state.lastGroupTool = { ...DEFAULT_GROUP_TOOL, ...(snapshot.lastGroupTool || {}) };
    state.activeLeftTab = snapshot.activeLeftTab ?? state.activeLeftTab ?? 'tools';
    state.activeRightTab = snapshot.activeRightTab ?? state.activeRightTab ?? 'frames';
    state.showPixelGuides = snapshot.showPixelGuides;
    state.showChecker = snapshot.showChecker;
    state.playback = { ...snapshot.playback };

    pointerState.active = false;
    pointerState.preview = null;
    pointerState.selectionPreview = null;
    pointerState.path = [];
    pointerState.startClient = null;
    pointerState.panOrigin = { x: 0, y: 0 };
    hoverPixel = null;

    resizeCanvases();
    renderFrameList();
    renderLayerList();
    renderPalette();
    syncPaletteInputs();
    syncControlsWithState();
    applyViewportTransform();
    invalidateFillPreviewCache();
    requestRender();
    requestOverlayRender();
    updateHistoryButtons();
    scheduleSessionPersist();
  }

  function beginHistory(label) {
    if (history.pending) return;
    history.pending = {
      before: makeHistorySnapshot(),
      dirty: false,
      label,
    };
  }

  function invalidateFillPreviewCache() {
    fillPreviewCache.key = null;
    fillPreviewCache.pixels = null;
  }

  function markHistoryDirty() {
    invalidateFillPreviewCache();
    if (history.pending) {
      history.pending.dirty = true;
    }
  }

  function commitHistory() {
    if (!history.pending) return;
    if (history.pending.dirty) {
      history.past.push(history.pending.before);
      if (history.past.length > history.limit) {
        history.past.shift();
      }
      history.future.length = 0;
      scheduleAutosaveSnapshot();
    }
    history.pending = null;
    updateHistoryButtons();
    scheduleSessionPersist();
  }

  function undo() {
    commitHistory();
    if (!history.past.length) return;
    const snapshot = makeHistorySnapshot();
    history.future.push(snapshot);
    if (history.future.length > history.limit) {
      history.future.shift();
    }
    const previous = history.past.pop();
    applyHistorySnapshot(previous);
    updateHistoryButtons();
  }

  function redo() {
    commitHistory();
    if (!history.future.length) return;
    const snapshot = makeHistorySnapshot();
    history.past.push(snapshot);
    if (history.past.length > history.limit) {
      history.past.shift();
    }
    const next = history.future.pop();
    applyHistorySnapshot(next);
    updateHistoryButtons();
  }

  function updateHistoryButtons() {
    if (dom.controls.undoAction) {
      dom.controls.undoAction.disabled = history.past.length === 0;
    }
    if (dom.controls.redoAction) {
      dom.controls.redoAction.disabled = history.future.length === 0;
    }
  }

  function setupLeftTabs() {
    dom.leftTabButtons = Array.from(document.querySelectorAll('[data-left-tab]'));
    if (!dom.leftTabButtons || !dom.leftTabButtons.length) return;
    dom.leftTabButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (layoutMode === 'mobilePortrait') return;
        const target = button.dataset.leftTab;
        if (!target) return;
        setLeftTab(target);
      });
    });
    updateLeftTabUI();
  }

  function setLeftTab(tab) {
    if (!LEFT_TAB_KEYS.includes(tab)) return;
    if (state.activeLeftTab === tab) return;
    state.activeLeftTab = tab;
    updateLeftTabUI();
    updateLeftTabVisibility();
    scheduleSessionPersist();
  }

  function updateLeftTabUI() {
    if (!dom.leftTabButtons) return;
    dom.leftTabButtons.forEach(button => {
      const tab = button.dataset.leftTab;
      const isActive = tab === state.activeLeftTab;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
      button.setAttribute('tabindex', isActive ? '0' : '-1');
    });
  }

  function updateLeftTabVisibility() {
    const isMobile = layoutMode === 'mobilePortrait';
    if (dom.leftTabsBar) {
      dom.leftTabsBar.toggleAttribute('hidden', isMobile);
    }
    if (isMobile) {
      LEFT_TAB_KEYS.forEach(key => {
        const section = dom.sections[key];
        if (!section) return;
        section.hidden = false;
        section.setAttribute('aria-hidden', 'false');
        section.classList.add('is-active');
      });
      return;
    }
    LEFT_TAB_KEYS.forEach(key => {
      const section = dom.sections[key];
      if (!section) return;
      const isActive = state.activeLeftTab === key;
      section.hidden = !isActive;
      section.setAttribute('aria-hidden', String(!isActive));
      section.classList.toggle('is-active', isActive);
    });
  }

  function setupRightTabs() {
    dom.rightTabButtons = Array.from(document.querySelectorAll('[data-right-tab]'));
    if (!RIGHT_TAB_KEYS.includes(state.activeRightTab)) {
      state.activeRightTab = 'frames';
    }
    if (!dom.rightTabButtons || !dom.rightTabButtons.length) return;
    dom.rightTabButtons.forEach(button => {
      if (button.dataset.bound === 'true') return;
      button.dataset.bound = 'true';
      button.addEventListener('click', () => {
        if (layoutMode === 'mobilePortrait') return;
        const target = button.dataset.rightTab;
        if (!target) return;
        setRightTab(target);
      });
    });
    updateRightTabUI();
    updateRightTabVisibility();
  }

  function setRightTab(tab) {
    if (!RIGHT_TAB_KEYS.includes(tab)) return;
    if (state.activeRightTab === tab) return;
    state.activeRightTab = tab;
    updateRightTabUI();
    updateRightTabVisibility();
    scheduleSessionPersist();
  }

  function updateRightTabUI() {
    if (!dom.rightTabButtons) return;
    dom.rightTabButtons.forEach(button => {
      const tab = button.dataset.rightTab;
      const isActive = tab === state.activeRightTab;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
      button.setAttribute('tabindex', isActive ? '0' : '-1');
    });
  }

  function updateRightTabVisibility() {
    const isMobile = layoutMode === 'mobilePortrait';
    if (dom.rightTabsBar) {
      dom.rightTabsBar.toggleAttribute('hidden', isMobile);
    }
    if (isMobile) {
      RIGHT_TAB_KEYS.forEach(key => {
        const section = dom.sections[key];
        if (!section) return;
        section.hidden = false;
        section.setAttribute('aria-hidden', 'false');
        section.classList.add('is-active');
      });
      return;
    }
    RIGHT_TAB_KEYS.forEach(key => {
      const section = dom.sections[key];
      if (!section) return;
      const isActive = state.activeRightTab === key;
      section.hidden = !isActive;
      section.setAttribute('aria-hidden', String(!isActive));
      section.classList.toggle('is-active', isActive);
    });
  }

  function resetCurveBuilder() {
    if (!curveBuilder) return;
    curveBuilder = null;
    pointerState.curveHandle = null;
    pointerState.preview = null;
    pointerState.tool = null;
    if (history.pending && history.pending.label === 'curve' && !history.pending.dirty) {
      history.pending = null;
    }
    requestOverlayRender();
  }

  function setupToolGroups() {
    dom.toolGroupButtons = Array.from(document.querySelectorAll('.tool-group-button[data-tool-group]'));
    if (!state.lastGroupTool) {
      state.lastGroupTool = { ...DEFAULT_GROUP_TOOL };
    }
    if (!TOOL_GROUPS[state.activeToolGroup]) {
      state.activeToolGroup = TOOL_TO_GROUP[state.tool] || 'pen';
    }
    if (dom.toolGroupButtons && dom.toolGroupButtons.length) {
      dom.toolGroupButtons.forEach(button => {
        button.addEventListener('click', () => {
          const target = button.dataset.toolGroup;
          if (!target) return;
          setToolGroup(target);
        });
      });
    }
    updateToolGroupButtons();
    updateToolVisibility();
    const activeGroupTools = TOOL_GROUPS[state.activeToolGroup]?.tools || [];
    if (activeGroupTools.length && !activeGroupTools.includes(state.tool)) {
      const fallback = state.lastGroupTool[state.activeToolGroup] && activeGroupTools.includes(state.lastGroupTool[state.activeToolGroup])
        ? state.lastGroupTool[state.activeToolGroup]
        : activeGroupTools[0];
      setActiveTool(fallback, toolButtons, { persist: false, skipGroupUpdate: true });
    } else if (activeGroupTools.includes(state.tool)) {
      state.lastGroupTool[state.activeToolGroup] = state.tool;
    }
  }

  function setToolGroup(group, { persist = true } = {}) {
    if (!TOOL_GROUPS[group]) return;
    if (!state.lastGroupTool) {
      state.lastGroupTool = { ...DEFAULT_GROUP_TOOL };
    }
    if (!state.lastGroupTool[group]) {
      state.lastGroupTool[group] = DEFAULT_GROUP_TOOL[group] || TOOL_GROUPS[group].tools[0];
    }
    state.activeToolGroup = group;
    updateToolGroupButtons();
    updateToolVisibility();
    const tools = TOOL_GROUPS[group].tools;
    const desired = state.lastGroupTool[group] && tools.includes(state.lastGroupTool[group])
      ? state.lastGroupTool[group]
      : tools[0];
    if (!tools.includes(state.tool)) {
      setActiveTool(desired, toolButtons, { persist, skipGroupUpdate: true });
    } else {
      state.lastGroupTool[group] = state.tool;
      if (persist) scheduleSessionPersist();
    }
  }

  function updateToolGroupButtons() {
    if (!dom.toolGroupButtons) return;
    dom.toolGroupButtons.forEach(button => {
      const group = button.dataset.toolGroup;
      const isActive = group === state.activeToolGroup;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
      button.setAttribute('aria-selected', String(isActive));
      button.setAttribute('tabindex', isActive ? '0' : '-1');
    });
  }

  function updateToolVisibility() {
    if (!toolButtons || !toolButtons.length) return;
    const isMobile = layoutMode === 'mobilePortrait';
    const activeGroup = isMobile ? null : (state.activeToolGroup || TOOL_TO_GROUP[state.tool] || 'pen');
    toolButtons.forEach(button => {
      const group = button.dataset.toolGroup || TOOL_TO_GROUP[button.dataset.tool];
      const show = !activeGroup || !group || group === activeGroup;
      if (isMobile) {
        button.hidden = false;
        button.setAttribute('aria-hidden', 'false');
      } else {
        button.hidden = !show;
        button.setAttribute('aria-hidden', String(!show));
      }
    });
    if (dom.toolGrid) {
      if (activeGroup) {
        dom.toolGrid.dataset.activeGroup = activeGroup;
      } else {
        dom.toolGrid.removeAttribute('data-active-group');
      }
    }
  }

  function handleCurvePointerDown(event, position, layer) {
    if (!position || !layer) {
      pointerState.active = false;
      return;
    }
    hoverPixel = null;
    requestOverlayRender();

    if (!curveBuilder) {
      beginHistory('curve');
      curveBuilder = {
        stage: 'line',
        start: position,
        end: position,
        control1: null,
        control2: null,
        awaitingEndPoint: true,
      };
    }

    if (curveBuilder.stage === 'line') {
      pointerState.active = true;
      pointerState.pointerId = event.pointerId;
      pointerState.tool = 'curve';
      pointerState.start = curveBuilder.start || position;
      pointerState.current = position;
      pointerState.last = position;
      pointerState.path = [position];
      pointerState.curveHandle = null;
      curveBuilder.end = position;
      pointerState.preview = { start: pointerState.start, end: position };
      dom.canvases.drawing.setPointerCapture(event.pointerId);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      requestOverlayRender();
      return;
    }

    if (curveBuilder.stage === 'control1' || curveBuilder.stage === 'control2') {
      pointerState.active = true;
      pointerState.pointerId = event.pointerId;
      pointerState.tool = 'curve';
      pointerState.curveHandle = curveBuilder.stage;
      pointerState.start = position;
      pointerState.current = position;
      pointerState.last = position;
      pointerState.path = [position];
      pointerState.preview = null;
      dom.canvases.drawing.setPointerCapture(event.pointerId);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      if (curveBuilder.stage === 'control1') {
        curveBuilder.control1 = position;
      } else {
        curveBuilder.control2 = position;
      }
      requestOverlayRender();
      return;
    }

    resetCurveBuilder();
  }

  function handleCurvePointerMove(event) {
    const position = getPointerPosition(event);
    if (!position || !curveBuilder) return;
    pointerState.current = position;
    if (curveBuilder.stage === 'line') {
      curveBuilder.end = position;
      pointerState.path.push(position);
      const lineStart = curveBuilder.start || pointerState.start || position;
      pointerState.preview = { start: lineStart, end: position };
    } else if (pointerState.curveHandle === 'control1') {
      curveBuilder.control1 = position;
    } else if (pointerState.curveHandle === 'control2') {
      curveBuilder.control2 = position;
    }
    requestOverlayRender();
  }

  function handleCurvePointerUp(event) {
    if (!curveBuilder) {
      dom.canvases.drawing.releasePointerCapture(event.pointerId);
      return;
    }
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    const position = getPointerPosition(event) || pointerState.current || curveBuilder.end;
    if (curveBuilder.stage === 'line') {
      const start = curveBuilder.start;
      curveBuilder.end = position;
      const moved = start && position && (start.x !== position.x || start.y !== position.y);
      pointerState.active = false;
      pointerState.pointerId = null;
      pointerState.path = [];
      pointerState.curveHandle = null;
      dom.canvases.drawing.releasePointerCapture(event.pointerId);
      if (!moved) {
        curveBuilder.awaitingEndPoint = true;
        pointerState.preview = null;
        pointerState.tool = null;
        requestOverlayRender();
        return;
      }

      curveBuilder.awaitingEndPoint = false;
      if (!curveBuilder.control1) curveBuilder.control1 = { ...curveBuilder.start };
      if (!curveBuilder.control2) curveBuilder.control2 = { ...curveBuilder.end };
      curveBuilder.stage = 'control1';
      pointerState.preview = null;
      pointerState.tool = null;
      requestOverlayRender();
      return;
    }

    if (pointerState.curveHandle === 'control1') {
      curveBuilder.control1 = position;
      curveBuilder.stage = 'control2';
      pointerState.curveHandle = null;
      pointerState.active = false;
      pointerState.pointerId = null;
      pointerState.path = [];
      dom.canvases.drawing.releasePointerCapture(event.pointerId);
      requestOverlayRender();
      scheduleSessionPersist();
      return;
    }

    if (pointerState.curveHandle === 'control2') {
      curveBuilder.control2 = position;
      pointerState.curveHandle = null;
      pointerState.active = false;
      pointerState.pointerId = null;
      pointerState.path = [];
      dom.canvases.drawing.releasePointerCapture(event.pointerId);
      finalizeCurve();
      return;
    }
  }

  function finalizeCurve() {
    if (!curveBuilder) return;
    const layer = getActiveLayer();
    if (!layer) {
      resetCurveBuilder();
      return;
    }
    const { start, end } = curveBuilder;
    let { control1, control2 } = curveBuilder;
    control1 = control1 || { ...start };
    control2 = control2 || { ...end };
    const points = sampleCubicBezierPoints(start, control1, control2, end);
    forEachCurveStrokePixel(points, (x, y) => stampBrush(layer, x, y));
    requestRender();
    commitHistory();
    scheduleSessionPersist();
    resetCurveBuilder();
  }

  function drawCurveGuides(builder) {
    if (!builder || !builder.start || !builder.end) return;
    const { start, end, control1, control2 } = builder;
    ctx.overlay.save();
    ctx.overlay.lineWidth = 0.5;
    ctx.overlay.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.overlay.setLineDash([1, 1]);
    ctx.overlay.beginPath();
    ctx.overlay.moveTo(start.x + 0.5, start.y + 0.5);
    ctx.overlay.lineTo(end.x + 0.5, end.y + 0.5);
    ctx.overlay.stroke();

    const handleColor = 'rgba(255,200,120,0.8)';
    if (control1) {
      ctx.overlay.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.overlay.beginPath();
      ctx.overlay.moveTo(start.x + 0.5, start.y + 0.5);
      ctx.overlay.lineTo(control1.x + 0.5, control1.y + 0.5);
      ctx.overlay.stroke();
      drawHandle(control1, pointerState.curveHandle === 'control1', handleColor);
    }
    if (control2) {
      ctx.overlay.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.overlay.beginPath();
      ctx.overlay.moveTo(end.x + 0.5, end.y + 0.5);
      ctx.overlay.lineTo(control2.x + 0.5, control2.y + 0.5);
      ctx.overlay.stroke();
      drawHandle(control2, pointerState.curveHandle === 'control2', handleColor);
    }

    if (builder.stage !== 'line') {
      const previewControl1 = control1 || { ...start };
      const previewControl2 = control2 || { ...end };
      const curvePoints = sampleCubicBezierPoints(start, previewControl1, previewControl2, end);
      const color = rgbaToCss(getActiveDrawColor());
      const width = state.width;
      const height = state.height;
      const selectionMask = state.selectionMask;
      ctx.overlay.fillStyle = color;
      const stamp = (x, y) => {
        if (x < 0 || y < 0 || x >= width || y >= height) return;
        if (selectionMask && selectionMask[y * width + x] !== 1) return;
        forEachBrushOffset((dx, dy) => {
          const px = x + dx;
          const py = y + dy;
          if (px < 0 || py < 0 || px >= width || py >= height) return;
          if (selectionMask && selectionMask[py * width + px] !== 1) return;
          ctx.overlay.fillRect(px, py, 1, 1);
        });
      };
      forEachCurveStrokePixel(curvePoints, stamp);
    }
    ctx.overlay.restore();
  }

  function drawHandle(point, isActive, color) {
    ctx.overlay.save();
    ctx.overlay.fillStyle = color;
    ctx.overlay.strokeStyle = isActive ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.6)';
    ctx.overlay.lineWidth = 0.5;
    const size = isActive ? 3 : 2;
    const offset = (size - 1) / 2;
    ctx.overlay.fillRect(point.x - offset, point.y - offset, size, size);
    ctx.overlay.strokeRect(point.x - offset, point.y - offset, size, size);
    ctx.overlay.restore();
  }

  function sampleCubicBezierPoints(p0, p1, p2, p3) {
    const tolerance = Math.max(0.1, Math.min(0.5, (state.brushSize || 1) * 0.2));
    const stack = [{ p0, p1, p2, p3, depth: 0 }];
    const seen = new Set();
    const points = [];

    const pushPoint = point => {
      const px = Math.round(point.x);
      const py = Math.round(point.y);
      const key = `${px},${py}`;
      if (seen.has(key)) return;
      seen.add(key);
      points.push({ x: px, y: py });
    };

    pushPoint(p0);

    while (stack.length) {
      const segment = stack.pop();
      const { p0: s0, p1: s1, p2: s2, p3: s3, depth } = segment;
      if (depth > 18 || cubicBezierFlatEnough(s0, s1, s2, s3, tolerance)) {
        pushPoint(s3);
        continue;
      }
      const [left, right] = subdivideCubicBezier(s0, s1, s2, s3);
      stack.push({ ...right, depth: depth + 1 });
      stack.push({ ...left, depth: depth + 1 });
    }

    return points;
  }

  function cubicBezierComponent(a, b, c, d, t) {
    const mt = 1 - t;
    return (mt ** 3) * a + 3 * (mt ** 2) * t * b + 3 * mt * (t ** 2) * c + (t ** 3) * d;
  }

  function cubicBezierFlatEnough(p0, p1, p2, p3, tolerance) {
    const d1 = distancePointToSegment(p1, p0, p3);
    const d2 = distancePointToSegment(p2, p0, p3);
    return d1 <= tolerance && d2 <= tolerance;
  }

  function subdivideCubicBezier(p0, p1, p2, p3) {
    const p01 = midpoint(p0, p1);
    const p12 = midpoint(p1, p2);
    const p23 = midpoint(p2, p3);
    const p012 = midpoint(p01, p12);
    const p123 = midpoint(p12, p23);
    const p0123 = midpoint(p012, p123);
    return [
      { p0, p1: p01, p2: p012, p3: p0123 },
      { p0: p0123, p1: p123, p2: p23, p3 },
    ];
  }

  function midpoint(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  function distancePointToSegment(point, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (dx === 0 && dy === 0) {
      return Math.hypot(point.x - a.x, point.y - a.y);
    }
    const t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy);
    const clamped = Math.max(0, Math.min(1, t));
    const px = a.x + clamped * dx;
    const py = a.y + clamped * dy;
    return Math.hypot(point.x - px, point.y - py);
  }

  function forEachCurveStrokePixel(points, callback) {
    if (!points || points.length === 0) return;
    let previous = points[0];
    callback(previous.x, previous.y);
    for (let i = 1; i < points.length; i += 1) {
      const current = points[i];
      if (current.x === previous.x && current.y === previous.y) {
        continue;
      }
      const segment = bresenhamLine(previous.x, previous.y, current.x, current.y);
      for (let j = 1; j < segment.length; j += 1) {
        callback(segment[j].x, segment[j].y);
      }
      previous = current;
    }
  }

  function updateGridDecorations() {
    const stack = dom.canvases.stack;
    if (!stack) return;
    const scale = Math.max(Number(state.scale) || 1, 1);
    const tileScreenSize = 16 * scale;
    const minorStep = scale;
    const majorMultiplier = Math.max(Number(state.majorGridSpacing) || 16, 1);
    const majorStep = Math.max(minorStep, majorMultiplier * minorStep);
    state.gridScreenStep = minorStep;
    stack.dataset.grid = state.showGrid ? 'true' : 'false';
    stack.dataset.majorGrid = state.showMajorGrid ? 'true' : 'false';
    stack.style.setProperty('--grid-screen-step', `${minorStep}px`);
    stack.style.setProperty('--grid-major-step', `${majorStep}px`);
    stack.style.setProperty('--grid-offset-x', '0px');
    stack.style.setProperty('--grid-offset-y', '0px');
    stack.style.setProperty('--grid-major-offset-x', '0px');
    stack.style.setProperty('--grid-major-offset-y', '0px');
    stack.style.setProperty('--tile-screen-size', `${tileScreenSize}px`);
    stack.style.setProperty('--tile-offset-x', '0px');
    stack.style.setProperty('--tile-offset-y', '0px');
    stack.dataset.background = state.backgroundMode;
  }

  function syncControlsWithState() {
    if (dom.controls.brushSize) {
      dom.controls.brushSize.value = String(state.brushSize);
    }
    if (dom.controls.brushSizeValue) {
      dom.controls.brushSizeValue.textContent = `${state.brushSize}px`;
    }
    if (dom.controls.brushOpacity) {
      dom.controls.brushOpacity.value = String(Math.round(state.brushOpacity * 100));
    }
    if (dom.controls.brushOpacityValue) {
      dom.controls.brushOpacityValue.textContent = `${Math.round(state.brushOpacity * 100)}%`;
    }
    if (dom.controls.canvasWidth) {
      dom.controls.canvasWidth.value = String(state.width);
    }
    if (dom.controls.canvasHeight) {
      dom.controls.canvasHeight.value = String(state.height);
    }
    if (dom.controls.toggleGrid) {
      dom.controls.toggleGrid.setAttribute('aria-pressed', String(state.showGrid));
      dom.controls.toggleGrid.classList.toggle('is-active', state.showGrid);
    }
    if (dom.controls.toggleMajorGrid) {
      dom.controls.toggleMajorGrid.setAttribute('aria-pressed', String(state.showMajorGrid));
      dom.controls.toggleMajorGrid.classList.toggle('is-active', state.showMajorGrid);
    }
    if (dom.controls.toggleBackgroundMode) {
      const labelMap = {
        dark: '背景:黒',
        light: '背景:白',
        pink: '背景:桃',
      };
      dom.controls.toggleBackgroundMode.setAttribute('aria-pressed', String(state.backgroundMode !== 'dark'));
      dom.controls.toggleBackgroundMode.textContent = labelMap[state.backgroundMode] || '背景';
    }
    if (dom.controls.toggleChecker) {
      dom.controls.toggleChecker.checked = state.showChecker;
    }
    if (dom.canvases.stack) {
      dom.canvases.stack.classList.toggle('is-flat', !state.showChecker);
    }
    if (dom.controls.togglePixelPreview) {
      dom.controls.togglePixelPreview.checked = state.showPixelGuides;
    }
    if (dom.controls.zoomSlider) {
      dom.controls.zoomSlider.value = String(state.scale);
    }
    if (dom.controls.zoomLevel) {
      dom.controls.zoomLevel.textContent = `${Math.round(state.scale * 100)}%`;
    }
    if (toolButtons.length) {
      setActiveTool(state.tool, toolButtons, { persist: false });
    }
    updateLeftTabUI();
    updateLeftTabVisibility();
    updateRightTabUI();
    updateRightTabVisibility();
    updateGridDecorations();
    updateHistoryButtons();
  }

  // -------------------------------------------------------------------------
  // Autosave & File System Access support
  // -------------------------------------------------------------------------

  function updateAutosaveStatus(message, tone = 'info') {
    const statusNode = dom.controls.autosaveStatus;
    if (!statusNode) return;
    statusNode.textContent = message;
    statusNode.dataset.tone = tone;
  }

  function setupAutosaveControls() {
    const button = dom.controls.enableAutosave;
    if (!button) return;
    if (!AUTOSAVE_SUPPORTED) {
      button.disabled = true;
      updateAutosaveStatus('自動保存: このブラウザでは利用できません', 'warn');
      return;
    }
    if (button.dataset.bound === 'true') return;
    button.dataset.bound = 'true';
    button.addEventListener('click', async () => {
      if (pendingAutosaveHandle && !autosaveHandle) {
        const reauthorized = await attemptAutosaveReauthorization();
        if (reauthorized) {
          return;
        }
      }
      requestAutosaveBinding();
    });
  }

  async function initializeAutosave() {
    setupAutosaveControls();
    const button = dom.controls.enableAutosave;
    if (!AUTOSAVE_SUPPORTED) {
      return;
    }

    updateAutosaveStatus('自動保存: 初期化中…');

    try {
      const handle = await loadStoredAutosaveHandle();
      if (!handle) {
        updateAutosaveStatus('自動保存: 未設定');
        return;
      }
      const granted = await ensureHandlePermission(handle, { request: false });
      if (granted) {
        autosaveHandle = handle;
        if (button) {
          button.textContent = '保存先を変更';
        }
        const restored = await restoreAutosaveDocument(handle);
        if (restored) {
          updateAutosaveStatus('自動保存: 有効');
        }
      } else {
        schedulePendingAutosavePermission(handle);
      }
    } catch (error) {
      console.warn('Autosave initialisation failed', error);
      updateAutosaveStatus('自動保存: 初期化でエラーが発生しました', 'error');
    }
  }

  function scheduleAutosaveSnapshot() {
    if (!AUTOSAVE_SUPPORTED) return;
    if (!autosaveHandle) return;
    if (autosaveRestoring) return;
    if (autosaveWriteTimer !== null) {
      window.clearTimeout(autosaveWriteTimer);
    }
    autosaveWriteTimer = window.setTimeout(() => {
      autosaveWriteTimer = null;
      writeAutosaveSnapshot().catch(error => {
        console.warn('Autosave failed', error);
        updateAutosaveStatus('自動保存: 保存に失敗しました', 'error');
      });
    }, AUTOSAVE_WRITE_DELAY);
  }

  async function writeAutosaveSnapshot() {
    if (!AUTOSAVE_SUPPORTED) return;
    if (!autosaveHandle) return;
    const granted = await ensureHandlePermission(autosaveHandle, { request: false });
    if (!granted) {
      schedulePendingAutosavePermission(autosaveHandle);
      autosaveHandle = null;
      return;
    }
    try {
      updateAutosaveStatus('自動保存: 保存中…');
      const snapshot = makeHistorySnapshot();
      const payload = serializeDocumentSnapshot(snapshot);
      const json = JSON.stringify({ version: DOCUMENT_FILE_VERSION, document: payload, updatedAt: new Date().toISOString() });
      const writable = await autosaveHandle.createWritable();
      await writable.write(json);
      await writable.close();
      updateAutosaveStatus('自動保存: 保存済み', 'success');
    } catch (error) {
      throw error;
    }
  }

  async function restoreAutosaveDocument(handle) {
    try {
      const file = await handle.getFile();
      if (!file) {
        return false;
      }
      const text = await file.text();
      if (!text) {
        updateAutosaveStatus('自動保存: 新しいファイルに保存します');
        return false;
      }
      const parsed = JSON.parse(text);
      const payload = parsed && typeof parsed === 'object' && parsed.document ? parsed.document : parsed;
      const snapshot = deserializeDocumentPayload(payload);
      autosaveRestoring = true;
      applyHistorySnapshot(snapshot);
      history.past = [];
      history.future = [];
      history.pending = null;
      autosaveRestoring = false;
      return true;
    } catch (error) {
      autosaveRestoring = false;
      console.warn('Failed to restore autosave document', error);
      updateAutosaveStatus('自動保存: ファイルを読み込めませんでした', 'error');
      return false;
    }
  }

  async function requestAutosaveBinding() {
    if (!AUTOSAVE_SUPPORTED) return;
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: 'pixieedraw-document.pixieedraw',
        types: [
          {
            description: 'PiXiEEDraw ドキュメント',
            accept: {
              'application/json': ['.json', '.pxdraw', '.pixieedraw'],
              'application/x-pixieedraw': ['.pixieedraw'],
            },
          },
        ],
      });
      const granted = await ensureHandlePermission(handle, { request: true });
      if (!granted) {
        updateAutosaveStatus('自動保存: 権限が必要です', 'warn');
        return;
      }
      autosaveHandle = handle;
      pendingAutosaveHandle = null;
      clearPendingPermissionListener();
      await storeAutosaveHandle(handle);
      if (dom.controls.enableAutosave) {
        dom.controls.enableAutosave.textContent = '保存先を変更';
      }
      updateAutosaveStatus('自動保存: 保存中…');
      await writeAutosaveSnapshot();
    } catch (error) {
      if (error && error.name === 'AbortError') {
        updateAutosaveStatus('自動保存: キャンセルしました', 'warn');
        return;
      }
      console.warn('Autosave binding failed', error);
      updateAutosaveStatus('自動保存: ファイルを選択できませんでした', 'error');
    }
  }

  async function ensureHandlePermission(handle, { request = false } = {}) {
    if (!handle) return false;
    const opts = { mode: 'readwrite' };
    const canQuery = typeof handle.queryPermission === 'function';
    const canRequest = typeof handle.requestPermission === 'function';

    if (!canQuery) {
      if (!request || !canRequest) {
        return false;
      }
      const outcome = await handle.requestPermission(opts);
      return outcome === 'granted';
    }

    let permission = await handle.queryPermission(opts);
    if (permission === 'granted') {
      return true;
    }
    if (!request || !canRequest) {
      return false;
    }
    permission = await handle.requestPermission(opts);
    return permission === 'granted';
  }

  function schedulePendingAutosavePermission(handle) {
    pendingAutosaveHandle = handle;
    autosaveHandle = null;
    clearPendingPermissionListener();
    updateAutosaveStatus('自動保存: 権限が必要です。キャンバスをクリックして再許可してください', 'warn');
    if (dom.controls.enableAutosave) {
      dom.controls.enableAutosave.textContent = '自動保存を再許可';
    }
    const listener = () => {
      attemptAutosaveReauthorization().catch(error => {
        console.warn('Autosave reauthorization failed', error);
        updateAutosaveStatus('自動保存: 権限を付与できませんでした', 'error');
      });
    };
    autosavePermissionListener = listener;
    window.addEventListener('pointerdown', listener, { once: true });
  }

  function clearPendingPermissionListener() {
    if (!autosavePermissionListener) return;
    window.removeEventListener('pointerdown', autosavePermissionListener);
    autosavePermissionListener = null;
  }

  async function attemptAutosaveReauthorization() {
    if (!pendingAutosaveHandle) {
      return false;
    }
    const handle = pendingAutosaveHandle;
    clearPendingPermissionListener();
    const granted = await ensureHandlePermission(handle, { request: true });
    if (!granted) {
      updateAutosaveStatus('自動保存: 権限が必要です。右のボタンから再許可してください', 'warn');
      schedulePendingAutosavePermission(handle);
      return false;
    }
    pendingAutosaveHandle = null;
    autosaveHandle = handle;
    if (dom.controls.enableAutosave) {
      dom.controls.enableAutosave.textContent = '保存先を変更';
    }
    try {
      const restored = await restoreAutosaveDocument(handle);
      if (restored) {
        updateAutosaveStatus('自動保存: 有効', 'success');
      } else {
        updateAutosaveStatus('自動保存: 保存中…', 'info');
      }
    } catch (error) {
      console.warn('Autosave restore after reauthorization failed', error);
      updateAutosaveStatus('自動保存: 復元に失敗しました', 'error');
    }
    return true;
  }

  async function openDocumentDialog() {
    if (typeof window.showOpenFilePicker === 'function') {
      try {
        const [handle] = await window.showOpenFilePicker({
          multiple: false,
          types: [
            {
              description: 'PiXiEEDraw ドキュメント',
              accept: {
                'application/json': ['.json', '.pxdraw', '.pixieedraw'],
                'application/x-pixieedraw': ['.pixieedraw'],
              },
            },
          ],
        });
        if (!handle) return;
        await loadDocumentFromHandle(handle);
        return;
      } catch (error) {
        if (error && error.name === 'AbortError') {
          return;
        }
        console.warn('Document open failed', error);
        updateAutosaveStatus('ドキュメントを開けませんでした', 'error');
        return;
      }
    }
    openDocumentViaInput();
  }

  function openDocumentViaInput() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.pxdraw,.pixieedraw,application/json,application/x-pixieedraw';
    input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      if (!file) {
        input.remove();
        return;
      }
      try {
        const text = await file.text();
        await loadDocumentFromText(text, null);
      } catch (error) {
        console.warn('Document load failed', error);
        updateAutosaveStatus('ドキュメントを開けませんでした', 'error');
      } finally {
        input.value = '';
        input.remove();
      }
    });
    input.addEventListener('click', () => {
      input.value = '';
    });
    input.click();
  }

  async function loadDocumentFromHandle(handle) {
    try {
      const file = await handle.getFile();
      const text = await file.text();
      await loadDocumentFromText(text, handle);
    } catch (error) {
      console.warn('Document handle load failed', error);
      updateAutosaveStatus('ドキュメントを開けませんでした', 'error');
    }
  }

  async function loadDocumentFromText(text, handle) {
    let snapshot;
    try {
      snapshot = snapshotFromDocumentText(text);
    } catch (error) {
      console.warn('Failed to parse document', error);
      updateAutosaveStatus('ドキュメントの読み込みに失敗しました', 'error');
      return;
    }

    autosaveRestoring = true;
    applyHistorySnapshot(snapshot);
    history.past = [];
    history.future = [];
    history.pending = null;
    autosaveRestoring = false;

    if (handle) {
      const granted = await ensureHandlePermission(handle, { request: true });
      if (granted) {
        autosaveHandle = handle;
        pendingAutosaveHandle = null;
        clearPendingPermissionListener();
        await storeAutosaveHandle(handle);
        if (dom.controls.enableAutosave) {
          dom.controls.enableAutosave.textContent = '保存先を変更';
        }
        updateAutosaveStatus('自動保存: 有効', 'success');
      } else {
        schedulePendingAutosavePermission(handle);
      }
    } else {
      autosaveHandle = null;
      pendingAutosaveHandle = null;
      clearPendingPermissionListener();
      if (AUTOSAVE_SUPPORTED) {
        updateAutosaveStatus('自動保存: 読み込み済み。保存先を設定してください', 'warn');
      }
    }

    scheduleSessionPersist();
    scheduleAutosaveSnapshot();
  }

  function snapshotFromDocumentText(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Document text is empty');
    }
    const parsed = JSON.parse(text);
    const payload = parsed && typeof parsed === 'object' && parsed.document ? parsed.document : parsed;
    return deserializeDocumentPayload(payload);
  }

  async function storeAutosaveHandle(handle) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(AUTOSAVE_DB_NAME, AUTOSAVE_DB_VERSION);
      request.onupgradeneeded = event => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(AUTOSAVE_STORE_NAME)) {
          db.createObjectStore(AUTOSAVE_STORE_NAME);
        }
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(AUTOSAVE_STORE_NAME, 'readwrite');
        const store = tx.objectStore(AUTOSAVE_STORE_NAME);
        const putRequest = store.put(handle, AUTOSAVE_HANDLE_KEY);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
        tx.oncomplete = () => db.close();
        tx.onerror = () => {
          const { error } = tx;
          db.close();
          if (error) reject(error);
        };
      };
    });
  }

  async function loadStoredAutosaveHandle() {
    if (!AUTOSAVE_SUPPORTED) return null;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(AUTOSAVE_DB_NAME, AUTOSAVE_DB_VERSION);
      request.onupgradeneeded = event => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(AUTOSAVE_STORE_NAME)) {
          db.createObjectStore(AUTOSAVE_STORE_NAME);
        }
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(AUTOSAVE_STORE_NAME, 'readonly');
        const store = tx.objectStore(AUTOSAVE_STORE_NAME);
        const getRequest = store.get(AUTOSAVE_HANDLE_KEY);
        getRequest.onsuccess = () => {
          resolve(getRequest.result || null);
        };
        getRequest.onerror = () => reject(getRequest.error);
        tx.oncomplete = () => db.close();
        tx.onerror = () => {
          const { error } = tx;
          db.close();
          if (error) reject(error);
        };
      };
    }).catch(error => {
      console.warn('Autosave handle load failed', error);
      return null;
    });
  }

  async function clearStoredAutosaveHandle() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(AUTOSAVE_DB_NAME, AUTOSAVE_DB_VERSION);
      request.onupgradeneeded = event => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(AUTOSAVE_STORE_NAME)) {
          db.createObjectStore(AUTOSAVE_STORE_NAME);
        }
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(AUTOSAVE_STORE_NAME, 'readwrite');
        const store = tx.objectStore(AUTOSAVE_STORE_NAME);
        const deleteRequest = store.delete(AUTOSAVE_HANDLE_KEY);
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
        tx.oncomplete = () => db.close();
        tx.onerror = () => {
          const { error } = tx;
          db.close();
          if (error) reject(error);
        };
      };
    });
  }

  function serializeDocumentSnapshot(snapshot) {
    const palette = snapshot.palette.map(color => normalizeColorValue(color));
    return {
      version: DOCUMENT_FILE_VERSION,
      width: snapshot.width,
      height: snapshot.height,
      scale: snapshot.scale,
      pan: { ...snapshot.pan },
      tool: snapshot.tool,
      brushSize: snapshot.brushSize,
      brushOpacity: snapshot.brushOpacity,
      colorMode: snapshot.colorMode,
      palette,
      activePaletteIndex: snapshot.activePaletteIndex,
      activeRgb: normalizeColorValue(snapshot.activeRgb),
      frames: snapshot.frames.map(frame => ({
        id: frame.id,
        name: frame.name,
        duration: frame.duration,
        layers: frame.layers.map(layer => ({
          id: layer.id,
          name: layer.name,
          visible: layer.visible,
          opacity: layer.opacity,
          indices: encodeTypedArray(layer.indices),
          direct: encodeTypedArray(layer.direct),
        })),
      })),
      activeFrame: snapshot.activeFrame,
      activeLayer: snapshot.activeLayer,
      selectionMask: snapshot.selectionMask ? encodeTypedArray(snapshot.selectionMask) : null,
      selectionBounds: snapshot.selectionBounds ? { ...snapshot.selectionBounds } : null,
      showGrid: snapshot.showGrid,
      showMajorGrid: snapshot.showMajorGrid,
      gridScreenStep: snapshot.gridScreenStep,
      majorGridSpacing: snapshot.majorGridSpacing,
      backgroundMode: snapshot.backgroundMode,
      activeToolGroup: snapshot.activeToolGroup,
      lastGroupTool: { ...(snapshot.lastGroupTool || DEFAULT_GROUP_TOOL) },
      activeLeftTab: snapshot.activeLeftTab,
      activeRightTab: snapshot.activeRightTab,
      showPixelGuides: snapshot.showPixelGuides,
      showChecker: snapshot.showChecker,
      playback: { ...snapshot.playback },
    };
  }

  function deserializeDocumentPayload(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid document payload');
    }
    const width = clamp(Math.round(Number(payload.width) || state.width || 128), 1, 4096);
    const height = clamp(Math.round(Number(payload.height) || state.height || 128), 1, 4096);
    const pixelCount = width * height;
    const paletteSource = Array.isArray(payload.palette) ? payload.palette : [];
    const palette = paletteSource.length ? paletteSource.map(color => normalizeColorValue(color)) : state.palette.map(color => ({ ...color }));

    const framesSource = Array.isArray(payload.frames) ? payload.frames : [];
    if (!framesSource.length) {
      throw new Error('Document has no frames');
    }

    const frames = framesSource.map((frame, frameIndex) => {
      if (!frame || !Array.isArray(frame.layers) || !frame.layers.length) {
        throw new Error(`Frame ${frameIndex} has no layers`);
      }
      const layers = frame.layers.map((layer, layerIndex) => {
        if (!layer || typeof layer.indices !== 'string' || typeof layer.direct !== 'string') {
          throw new Error(`Layer ${layerIndex} is missing pixel data`);
        }
        const indicesBytes = decodeBase64(layer.indices);
        const directBytes = decodeBase64(layer.direct);
        if (indicesBytes.length !== pixelCount * 2 || directBytes.length !== pixelCount * 4) {
          throw new Error('Layer pixel data mismatch');
        }
        const indicesView = new Int16Array(indicesBytes.buffer, indicesBytes.byteOffset, indicesBytes.byteLength / 2);
        const indices = new Int16Array(indicesView.length);
        indices.set(indicesView);
        const direct = new Uint8ClampedArray(directBytes.length);
        direct.set(directBytes);
        return {
          id: typeof layer.id === 'string' ? layer.id : `layer-${frameIndex}-${layerIndex}`,
          name: typeof layer.name === 'string' ? layer.name : `レイヤー ${layerIndex + 1}`,
          visible: layer.visible !== false,
          opacity: clamp(Number(layer.opacity) ?? 1, 0, 1),
          indices,
          direct,
        };
      });
      return {
        id: typeof frame.id === 'string' ? frame.id : `frame-${frameIndex + 1}`,
        name: typeof frame.name === 'string' ? frame.name : `フレーム ${frameIndex + 1}`,
        duration: clamp(Number(frame.duration) || 1000 / 12, 16, 2000),
        layers,
      };
    });

    const activeFrameIndex = clamp(Math.round(Number(payload.activeFrame) || 0), 0, frames.length - 1);
    const activeFrame = frames[activeFrameIndex];
    let activeLayerId = typeof payload.activeLayer === 'string' ? payload.activeLayer : activeFrame.layers[activeFrame.layers.length - 1].id;
    if (!activeFrame.layers.some(layer => layer.id === activeLayerId)) {
      activeLayerId = activeFrame.layers[activeFrame.layers.length - 1].id;
    }

    let selectionMask = null;
    if (typeof payload.selectionMask === 'string') {
      const maskBytes = decodeBase64(payload.selectionMask);
      if (maskBytes.length === pixelCount) {
        selectionMask = new Uint8Array(maskBytes.length);
        selectionMask.set(maskBytes);
      }
    }

    const selectionBounds = validateBoundsObject(payload.selectionBounds);
    const activeTool = typeof payload.tool === 'string' ? payload.tool : state.tool;
    const activeRgb = normalizeColorValue(payload.activeRgb || state.activeRgb);
    const colorMode = payload.colorMode === 'rgb' ? 'rgb' : 'index';
    const activePaletteIndex = clamp(Math.round(Number(payload.activePaletteIndex) || 0), 0, palette.length - 1);
    const backgroundMode = payload.backgroundMode === 'light' || payload.backgroundMode === 'pink' ? payload.backgroundMode : 'dark';
    const activeToolGroup = TOOL_GROUPS[payload.activeToolGroup] ? payload.activeToolGroup : (TOOL_TO_GROUP[activeTool] || state.activeToolGroup);
    const lastGroupTool = normalizeLastGroupTool(payload.lastGroupTool);
    const activeLeftTab = LEFT_TAB_KEYS.includes(payload.activeLeftTab) ? payload.activeLeftTab : state.activeLeftTab;
    const activeRightTab = RIGHT_TAB_KEYS.includes(payload.activeRightTab) ? payload.activeRightTab : state.activeRightTab;

    return {
      width,
      height,
      scale: clamp(Math.round(Number(payload.scale) || state.scale || 1), 1, 40),
      pan: {
        x: Math.round(Number(payload.pan?.x) || 0),
        y: Math.round(Number(payload.pan?.y) || 0),
      },
      tool: activeTool,
      brushSize: clamp(Math.round(Number(payload.brushSize) || state.brushSize || 1), 1, 64),
      brushOpacity: clamp(Number(payload.brushOpacity ?? state.brushOpacity ?? 1), 0, 1),
      colorMode,
      palette,
      activePaletteIndex,
      activeRgb,
      frames,
      activeFrame: activeFrameIndex,
      activeLayer: activeLayerId,
      selectionMask,
      selectionBounds,
      showGrid: Boolean(payload.showGrid ?? state.showGrid),
      showMajorGrid: Boolean(payload.showMajorGrid ?? state.showMajorGrid),
      gridScreenStep: clamp(Math.round(Number(payload.gridScreenStep) || state.gridScreenStep || 8), 1, 256),
      majorGridSpacing: clamp(Math.round(Number(payload.majorGridSpacing) || state.majorGridSpacing || 16), 2, 512),
      backgroundMode,
      activeToolGroup,
      lastGroupTool,
      activeLeftTab,
      activeRightTab,
      showPixelGuides: Boolean(payload.showPixelGuides ?? state.showPixelGuides),
      showChecker: Boolean(payload.showChecker ?? state.showChecker),
      playback: typeof payload.playback === 'object' && payload.playback
        ? {
          isPlaying: Boolean(payload.playback.isPlaying),
          lastFrame: Number(payload.playback.lastFrame) || 0,
        }
        : { isPlaying: false, lastFrame: 0 },
    };
  }

  function encodeTypedArray(view) {
    if (!view) return '';
    const bytes = view instanceof Uint8Array
      ? view
      : new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return window.btoa(binary);
  }

  function decodeBase64(value) {
    if (typeof value !== 'string' || value.length === 0) {
      return new Uint8Array(0);
    }
    try {
      const binary = window.atob(value);
      const length = binary.length;
      const bytes = new Uint8Array(length);
      for (let i = 0; i < length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    } catch (error) {
      return new Uint8Array(0);
    }
  }

  function normalizeColorValue(input) {
    if (!input || typeof input !== 'object') {
      return { r: 0, g: 0, b: 0, a: 255 };
    }
    return {
      r: clamp(Math.round(Number(input.r) ?? 0), 0, 255),
      g: clamp(Math.round(Number(input.g) ?? 0), 0, 255),
      b: clamp(Math.round(Number(input.b) ?? 0), 0, 255),
      a: clamp(Math.round(Number(input.a) ?? 255), 0, 255),
    };
  }

  function normalizeLastGroupTool(value) {
    const fallback = { ...DEFAULT_GROUP_TOOL };
    if (!value || typeof value !== 'object') {
      return fallback;
    }
    const result = { ...fallback };
    Object.keys(TOOL_GROUPS).forEach(group => {
      const candidate = value[group];
      if (typeof candidate === 'string' && TOOL_GROUPS[group].tools.includes(candidate)) {
        result[group] = candidate;
      }
    });
    return result;
  }

  function validateBoundsObject(bounds) {
    if (!bounds || typeof bounds !== 'object') {
      return null;
    }
    const x0 = Number(bounds.x0);
    const y0 = Number(bounds.y0);
    const x1 = Number(bounds.x1);
    const y1 = Number(bounds.y1);
    if ([x0, y0, x1, y1].some(value => !Number.isFinite(value))) {
      return null;
    }
    return {
      x0: Math.floor(x0),
      y0: Math.floor(y0),
      x1: Math.floor(x1),
      y1: Math.floor(y1),
    };
  }

  function applyViewportTransform() {
    if (!dom.canvases.stack) return;
    const panX = Math.round(Number(state.pan.x) || 0);
    const panY = Math.round(Number(state.pan.y) || 0);
    if (panX !== state.pan.x) {
      state.pan.x = panX;
    }
    if (panY !== state.pan.y) {
      state.pan.y = panY;
    }
    dom.canvases.stack.style.transform = `translate(${panX}px, ${panY}px)`;
    updateGridDecorations();
  }

  async function init() {
    await initializeAutosave();
    setupLeftTabs();
    setupRightTabs();
    setupLayout();
    setupControls();
    setupTools();
    setupToolGroups();
    setupPaletteEditor();
    setupFramesAndLayers();
    setupCanvas();
    setupKeyboard();
    renderEverything();
  }

  function getActiveTool() {
    return pointerState.tool || state.tool;
  }

  function setupLayout() {
    window.addEventListener('resize', debounce(updateLayoutMode, 150));
    updateLayoutMode();

    dom.mobileTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.mobileTab;
        if (!target) return;
        dom.mobileTabs.forEach(btn => {
          const panel = dom.mobilePanels[btn.dataset.mobileTab];
          if (!panel) return;
          const isActive = btn === tab;
          btn.classList.toggle('is-active', isActive);
          btn.setAttribute('aria-selected', String(isActive));
          if (isActive) {
            btn.removeAttribute('tabindex');
          } else {
            btn.setAttribute('tabindex', '-1');
          }
          panel.classList.toggle('is-active', isActive);
          panel.toggleAttribute('hidden', !isActive);
        });
      });
    });

    dom.toggles.left?.addEventListener('click', () => {
      if (layoutMode === 'mobilePortrait') {
        return;
      }
      toggleRailCollapsed('left');
    });

    dom.toggles.right?.addEventListener('click', () => {
      if (layoutMode === 'mobilePortrait') {
        return;
      }
      toggleRailCollapsed('right');
    });

    updateRailToggleVisibility();
  }

  function setRailCollapsed(side, collapsed) {
    const isLeft = side === 'left';
    const railNode = isLeft ? dom.leftRail : dom.rightRail;
    if (!railNode) return;
    if (isLeft) {
      rails.leftCollapsed = collapsed;
    } else {
      rails.rightCollapsed = collapsed;
    }
    railNode.dataset.collapsed = collapsed ? 'true' : 'false';
  }

  function toggleRailCollapsed(side) {
    const isLeft = side === 'left';
    const railNode = isLeft ? dom.leftRail : dom.rightRail;
    if (!railNode) return;
    const collapsed = railNode.dataset.collapsed === 'true';
    setRailCollapsed(side, !collapsed);
    updateRailToggleVisibility();
  }

  function updateRailMetrics() {
    const layoutNode = dom.layout;
    if (!layoutNode) return;
    const isMobile = layoutMode === 'mobilePortrait';
    const leftCollapsed = isMobile || dom.leftRail?.dataset.collapsed === 'true';
    const rightCollapsed = isMobile || dom.rightRail?.dataset.collapsed === 'true';
    const leftWidth = !leftCollapsed && dom.leftRail ? dom.leftRail.offsetWidth : 0;
    const rightWidth = !rightCollapsed && dom.rightRail ? dom.rightRail.offsetWidth : 0;
    const toggleMargin = 12;
    layoutNode.style.setProperty('--left-toggle-offset', `${leftWidth ? leftWidth + toggleMargin : toggleMargin}px`);
    layoutNode.style.setProperty('--right-toggle-offset', `${rightWidth ? rightWidth + toggleMargin : toggleMargin}px`);
  }

  function updateLayoutMode() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const portrait = height >= width;
    let nextMode = 'desktop';

    if (width <= 900 && portrait) {
      nextMode = 'mobilePortrait';
    } else if (width <= 900) {
      nextMode = 'narrow';
    }

    if (layoutMode === nextMode) {
      updateRailToggleVisibility();
      return;
    }

    layoutMode = nextMode;
    applyLayoutMode();
  }

  function applyLayoutMode() {
    const isMobile = layoutMode === 'mobilePortrait';
    dom.mobileDrawer.hidden = !isMobile;
    if (isMobile) {
      dom.leftRail.dataset.collapsed = 'true';
      dom.rightRail.dataset.collapsed = 'true';
    } else {
      dom.leftRail.dataset.collapsed = rails.leftCollapsed ? 'true' : 'false';
      dom.rightRail.dataset.collapsed = rails.rightCollapsed ? 'true' : 'false';
    }

    Object.entries(layoutMap).forEach(([key, placement]) => {
      const section = dom.sections[key];
      if (!section) return;
      const target = isMobile ? placement.mobile : placement.desktop;
      if (!target) return;
      target.appendChild(section);
      section.classList.add('panel-section');
      section.classList.toggle('panel-section--mobile', isMobile);
    });

    updateLeftTabUI();
    updateLeftTabVisibility();
    updateRightTabUI();
    updateRightTabVisibility();

    if (isMobile) {
      dom.mobileTabs[0]?.click();
    }

    updateRailToggleVisibility();
    updateToolVisibility();
    applyViewportTransform();
  }

  function updateRailToggleVisibility() {
    const isMobile = layoutMode === 'mobilePortrait';
    const leftCollapsed = dom.leftRail?.dataset.collapsed === 'true';
    const rightCollapsed = dom.rightRail?.dataset.collapsed === 'true';
    updateRailMetrics();
    if (dom.toggles.left) {
      const showToggle = !isMobile;
      dom.toggles.left.classList.toggle('is-visible', showToggle);
      dom.toggles.left.textContent = leftCollapsed ? '⟨' : '⟩';
      dom.toggles.left.setAttribute('aria-label', leftCollapsed ? '左パネルを表示' : '左パネルを隠す');
      dom.toggles.left.setAttribute('aria-pressed', leftCollapsed ? 'false' : 'true');
    }
    if (dom.toggles.right) {
      const showToggle = !isMobile;
      dom.toggles.right.classList.toggle('is-visible', showToggle);
      dom.toggles.right.textContent = rightCollapsed ? '⟩' : '⟨';
      dom.toggles.right.setAttribute('aria-label', rightCollapsed ? '右パネルを表示' : '右パネルを隠す');
      dom.toggles.right.setAttribute('aria-pressed', rightCollapsed ? 'false' : 'true');
    }
  }

  function setupControls() {
    dom.controls.toggleGrid?.addEventListener('click', () => {
      state.showGrid = !state.showGrid;
      dom.controls.toggleGrid?.setAttribute('aria-pressed', String(state.showGrid));
      dom.controls.toggleGrid?.classList.toggle('is-active', state.showGrid);
      updateGridDecorations();
      requestOverlayRender();
      scheduleSessionPersist();
    });

    dom.controls.toggleMajorGrid?.addEventListener('click', () => {
      state.showMajorGrid = !state.showMajorGrid;
      dom.controls.toggleMajorGrid?.setAttribute('aria-pressed', String(state.showMajorGrid));
      dom.controls.toggleMajorGrid?.classList.toggle('is-active', state.showMajorGrid);
      updateGridDecorations();
      requestOverlayRender();
      scheduleSessionPersist();
    });

    dom.controls.toggleBackgroundMode?.addEventListener('click', () => {
      const modes = ['dark', 'light', 'pink'];
      const nextIndex = (modes.indexOf(state.backgroundMode) + 1) % modes.length;
      state.backgroundMode = modes[nextIndex];
      updateGridDecorations();
      syncControlsWithState();
      scheduleSessionPersist();
    });

    dom.controls.zoomOut?.addEventListener('click', () => setZoom(state.scale - 1));
    dom.controls.zoomIn?.addEventListener('click', () => setZoom(state.scale + 1));

    dom.controls.zoomSlider?.addEventListener('input', event => {
      const value = Number(event.target.value);
      setZoom(value);
    });

    dom.controls.brushSize?.addEventListener('input', event => {
      state.brushSize = clamp(Math.round(Number(event.target.value)), 1, 32);
      if (dom.controls.brushSizeValue) {
        dom.controls.brushSizeValue.textContent = `${state.brushSize}px`;
      }
      scheduleSessionPersist();
    });

    dom.controls.brushOpacity?.addEventListener('input', event => {
      const value = clamp(Number(event.target.value), 0, 100);
      state.brushOpacity = value / 100;
      if (dom.controls.brushOpacityValue) {
        dom.controls.brushOpacityValue.textContent = `${value}%`;
      }
      scheduleSessionPersist();
    });

    dom.controls.toggleChecker?.addEventListener('change', event => {
      state.showChecker = Boolean(event.target.checked);
      dom.canvases.stack.classList.toggle('is-flat', !state.showChecker);
      scheduleSessionPersist();
    });

    dom.controls.togglePixelPreview?.addEventListener('change', event => {
      state.showPixelGuides = Boolean(event.target.checked);
      requestOverlayRender();
      scheduleSessionPersist();
    });

    dom.controls.openDocument?.addEventListener('click', () => {
      openDocumentDialog();
    });

    dom.controls.canvasWidth?.addEventListener('change', handleCanvasResizeRequest);
    dom.controls.canvasHeight?.addEventListener('change', handleCanvasResizeRequest);

    dom.controls.clearCanvas?.addEventListener('click', () => {
      if (!confirm('すべてのフレームをクリアしますか？')) {
        return;
      }
      beginHistory('clearCanvas');
      state.frames.forEach(frame => {
        frame.layers.forEach(layer => {
          layer.indices.fill(-1);
          layer.direct.fill(0);
        });
      });
      markHistoryDirty();
      requestRender();
      requestOverlayRender();
      commitHistory();
      scheduleSessionPersist();
    });

    dom.controls.undoAction?.addEventListener('click', () => undo());
    dom.controls.redoAction?.addEventListener('click', () => redo());

    syncControlsWithState();
  }

  function handleCanvasResizeRequest() {
    const width = clamp(Number(dom.controls.canvasWidth.value), 1, 256) || state.width;
    const height = clamp(Number(dom.controls.canvasHeight.value), 1, 256) || state.height;
    if (width === state.width && height === state.height) {
      dom.controls.canvasWidth.value = String(state.width);
      dom.controls.canvasHeight.value = String(state.height);
      return;
    }

    beginHistory('resizeCanvas');
    resizeAllLayers(width, height);
    state.width = width;
    state.height = height;
    dom.controls.canvasWidth.value = String(width);
    dom.controls.canvasHeight.value = String(height);
    markHistoryDirty();
    resizeCanvases();
    clearSelection();
    requestRender();
    requestOverlayRender();
    commitHistory();
    scheduleSessionPersist();
  }

  function resizeAllLayers(width, height) {
    state.frames.forEach(frame => {
      frame.layers = frame.layers.map(layer => {
        const resized = createLayer(layer.name, width, height);
        const minW = Math.min(width, state.width);
        const minH = Math.min(height, state.height);
        for (let y = 0; y < minH; y += 1) {
          for (let x = 0; x < minW; x += 1) {
            const srcIdx = y * state.width + x;
            const dstIdx = y * width + x;
            resized.indices[dstIdx] = layer.indices[srcIdx];
            const baseSrc = srcIdx * 4;
            const baseDst = dstIdx * 4;
            resized.direct[baseDst] = layer.direct[baseSrc];
            resized.direct[baseDst + 1] = layer.direct[baseSrc + 1];
            resized.direct[baseDst + 2] = layer.direct[baseSrc + 2];
            resized.direct[baseDst + 3] = layer.direct[baseSrc + 3];
          }
        }
        resized.visible = layer.visible;
        resized.opacity = layer.opacity;
        return resized;
      });
    });
  }

  function setupTools() {
    toolButtons = Array.from(document.querySelectorAll('.tool-button[data-tool]'));
    toolButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tool = button.dataset.tool;
        if (!tool) return;
        setActiveTool(tool);
      });
    });
    setActiveTool(state.tool, toolButtons, { persist: false });

    dom.canvases.drawing.addEventListener('pointerdown', handlePointerDown);
    dom.canvases.drawing.addEventListener('pointermove', event => {
      if (pointerState.active) return;
      const awaitingLineEnd = curveBuilder && curveBuilder.stage === 'line' && curveBuilder.awaitingEndPoint && curveBuilder.start;
      const position = getPointerPosition(event);

      if (awaitingLineEnd) {
        let needsRender = false;
        const start = curveBuilder.start;
        if (start && position) {
          const prev = pointerState.preview;
          if (!prev || prev.end?.x !== position.x || prev.end?.y !== position.y) {
            pointerState.preview = { start, end: position };
            needsRender = true;
          }
          if (pointerState.tool !== 'curve') {
            pointerState.tool = 'curve';
            needsRender = true;
          }
          if (hoverPixel) {
            hoverPixel = null;
            needsRender = true;
          }
        } else {
          if (pointerState.preview) {
            pointerState.preview = null;
            needsRender = true;
          }
          if (pointerState.tool === 'curve') {
            pointerState.tool = null;
            needsRender = true;
          }
          if (hoverPixel) {
            hoverPixel = null;
            needsRender = true;
          }
        }
        if (needsRender) {
          requestOverlayRender();
        }
        return;
      }

      if (pointerState.preview && pointerState.tool === 'curve') {
        pointerState.preview = null;
        pointerState.tool = null;
        requestOverlayRender();
      }

      if (!position) {
        if (hoverPixel) {
          hoverPixel = null;
          requestOverlayRender();
        }
        return;
      }
      if (!hoverPixel || hoverPixel.x !== position.x || hoverPixel.y !== position.y) {
        hoverPixel = position;
        requestOverlayRender();
      }
    });
    dom.canvases.drawing.addEventListener('pointerleave', () => {
      let needsRender = false;
      if (hoverPixel) {
        hoverPixel = null;
        needsRender = true;
      }
      if (curveBuilder && curveBuilder.stage === 'line' && curveBuilder.awaitingEndPoint && pointerState.preview) {
        pointerState.preview = null;
        pointerState.tool = null;
        needsRender = true;
      }
      if (needsRender) {
        requestOverlayRender();
      }
    });
    dom.canvases.drawing.addEventListener('contextmenu', event => event.preventDefault());
  }

  function setActiveTool(tool, buttons = toolButtons, options = {}) {
    const { persist = true, skipGroupUpdate = false } = options;
    if (!tool) return;
    state.tool = tool;
    buttons.forEach(btn => {
      const isActive = btn.dataset.tool === tool;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
    if (!state.lastGroupTool) {
      state.lastGroupTool = { ...DEFAULT_GROUP_TOOL };
    }
    const group = TOOL_TO_GROUP[tool];
    if (group) {
      if (!state.lastGroupTool[group]) {
        state.lastGroupTool[group] = DEFAULT_GROUP_TOOL[group] || TOOL_GROUPS[group]?.tools?.[0] || tool;
      }
      state.lastGroupTool[group] = tool;
      if (!skipGroupUpdate) {
        state.activeToolGroup = group;
        updateToolGroupButtons();
        updateToolVisibility();
      }
    } else if (!skipGroupUpdate) {
      updateToolGroupButtons();
      updateToolVisibility();
    }
    if (tool !== 'curve') {
      resetCurveBuilder();
    }
    if (persist) {
      scheduleSessionPersist();
    }
  }

  function setupPaletteEditor() {
    dom.controls.colorMode.forEach(input => {
      input.addEventListener('change', event => {
        if (!event.target.checked) return;
        state.colorMode = event.target.value;
        document.getElementById('colorModeIndex')?.toggleAttribute('hidden', state.colorMode !== 'index');
        document.getElementById('colorModeRgb')?.toggleAttribute('hidden', state.colorMode !== 'rgb');
        scheduleSessionPersist();
      });
    });

    dom.controls.addPaletteColor?.addEventListener('click', () => {
      beginHistory('paletteAdd');
      const nextIndex = state.palette.length;
      const last = state.palette[state.palette.length - 1] || { r: 88, g: 196, b: 255, a: 255 };
      state.palette.push({ ...last });
      setActivePaletteIndex(nextIndex);
      applyPaletteChange();
      commitHistory();
    });

    [dom.controls.paletteR, dom.controls.paletteG, dom.controls.paletteB, dom.controls.paletteA].forEach((input, idx) => {
      input?.addEventListener('input', () => {
        const active = state.palette[state.activePaletteIndex];
        if (!active) return;
        beginHistory('paletteColor');
        const value = clamp(Number(input.value), 0, 255);
        if (idx === 0) active.r = value;
        if (idx === 1) active.g = value;
        if (idx === 2) active.b = value;
        if (idx === 3) active.a = value;
        syncPaletteInputs();
        applyPaletteChange();
        commitHistory();
      });
    });

    dom.controls.paletteColor?.addEventListener('input', () => {
      const active = state.palette[state.activePaletteIndex];
      if (!active) return;
      const rgba = hexToRgba(dom.controls.paletteColor.value);
      if (!rgba) return;
      beginHistory('paletteColor');
      Object.assign(active, rgba);
      dom.controls.paletteA.value = String(active.a);
      syncPaletteInputs();
      applyPaletteChange();
      commitHistory();
    });

    dom.controls.paletteIndex?.addEventListener('change', () => {
      const target = clamp(Number(dom.controls.paletteIndex.value), 0, state.palette.length - 1);
      if (Number.isNaN(target)) return;
      reorderPalette(state.activePaletteIndex, target);
    });

    [dom.controls.rgbR, dom.controls.rgbG, dom.controls.rgbB, dom.controls.rgbA].forEach((input, idx) => {
      input?.addEventListener('input', () => {
        const value = clamp(Number(input.value), 0, 255);
        if (idx === 0) state.activeRgb.r = value;
        if (idx === 1) state.activeRgb.g = value;
        if (idx === 2) state.activeRgb.b = value;
        if (idx === 3) state.activeRgb.a = value;
        dom.controls.rgbColor.value = rgbaToHex(state.activeRgb);
      });
    });

    dom.controls.rgbColor?.addEventListener('input', () => {
      const rgba = hexToRgba(dom.controls.rgbColor.value);
      if (!rgba) return;
      state.activeRgb = rgba;
      dom.controls.rgbR.value = String(rgba.r);
      dom.controls.rgbG.value = String(rgba.g);
      dom.controls.rgbB.value = String(rgba.b);
      dom.controls.rgbA.value = String(rgba.a);
    });

    renderPalette();
    syncPaletteInputs();
  }

  function reorderPalette(currentIndex, targetIndex) {
    if (currentIndex === targetIndex) return;
    beginHistory('paletteReorder');
    const previousOrder = state.palette.slice();
    const color = state.palette.splice(currentIndex, 1)[0];
    state.palette.splice(targetIndex, 0, color);
    const mapping = previousOrder.map(entry => state.palette.indexOf(entry));
    remapPaletteIndices(mapping);
    const newIndex = state.palette.indexOf(color);
    setActivePaletteIndex(newIndex);
    applyPaletteChange();
    commitHistory();
  }

  function setActivePaletteIndex(index) {
    state.activePaletteIndex = clamp(index, 0, state.palette.length - 1);
    syncPaletteInputs();
    renderPalette();
    scheduleSessionPersist();
  }

  function syncPaletteInputs() {
    const color = state.palette[state.activePaletteIndex];
    if (!color) return;
    dom.controls.paletteIndex.value = String(state.activePaletteIndex);
    dom.controls.paletteColor.value = rgbaToHex(color);
    dom.controls.paletteR.value = String(color.r);
    dom.controls.paletteG.value = String(color.g);
    dom.controls.paletteB.value = String(color.b);
    dom.controls.paletteA.value = String(color.a);
  }

  function renderPalette() {
    const container = dom.controls.paletteList;
    if (!container) return;
    container.innerHTML = '';
    state.palette.forEach((color, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'palette-swatch';
      button.dataset.index = String(index);
      button.style.backgroundColor = rgbaToCss(color);
      button.setAttribute('aria-label', `インデックス ${index}`);
      button.title = `${index}: ${rgbaToHex(color)}`;
      button.classList.toggle('is-active', index === state.activePaletteIndex);
      button.addEventListener('click', () => setActivePaletteIndex(index));
      button.addEventListener('contextmenu', event => {
        event.preventDefault();
        if (state.palette.length <= 1) return;
        removePaletteColor(index);
      });
      container.appendChild(button);
    });
  }

  function removePaletteColor(index) {
    beginHistory('paletteRemove');
    const previousOrder = state.palette.slice();
    state.palette.splice(index, 1);
    const mapping = previousOrder.map(entry => state.palette.indexOf(entry));
    remapPaletteIndices(mapping);
    if (state.activePaletteIndex >= state.palette.length) {
      state.activePaletteIndex = Math.max(0, state.palette.length - 1);
    }
    renderPalette();
    syncPaletteInputs();
    applyPaletteChange();
    commitHistory();
  }

  function remapPaletteIndices(mapping) {
    if (!mapping) return;
    state.frames.forEach(frame => {
      frame.layers.forEach(layer => {
        const length = layer.indices.length;
        for (let i = 0; i < length; i += 1) {
          const oldIndex = layer.indices[i];
          if (oldIndex < 0) continue;
          const next = mapping[oldIndex];
          layer.indices[i] = typeof next === 'number' && next >= 0 ? next : -1;
        }
      });
    });
  }

  function applyPaletteChange() {
    markHistoryDirty();
    requestRender();
    requestOverlayRender();
    scheduleSessionPersist();
  }

  function setupFramesAndLayers() {
    dom.controls.addLayer?.addEventListener('click', () => {
      const frame = getActiveFrame();
      if (!frame) return;
      beginHistory('addLayer');
      const layerCount = frame.layers.length + 1;
      const layer = createLayer(`レイヤー ${layerCount}`, state.width, state.height);
      frame.layers.splice(getActiveLayerIndex() + 1, 0, layer);
      state.activeLayer = layer.id;
      markHistoryDirty();
      scheduleSessionPersist();
      renderLayerList();
      requestRender();
      requestOverlayRender();
      commitHistory();
    });

    dom.controls.removeLayer?.addEventListener('click', () => {
      const frame = getActiveFrame();
      if (!frame || frame.layers.length <= 1) return;
      beginHistory('removeLayer');
      const index = getActiveLayerIndex();
      frame.layers.splice(index, 1);
      const nextIndex = clamp(index - 1, 0, frame.layers.length - 1);
      state.activeLayer = frame.layers[nextIndex].id;
      markHistoryDirty();
      scheduleSessionPersist();
      renderLayerList();
      requestRender();
      requestOverlayRender();
      commitHistory();
    });

    dom.controls.addFrame?.addEventListener('click', () => {
      const baseFrame = getActiveFrame();
      if (!baseFrame) return;
      beginHistory('addFrame');
      const newFrame = createFrame(`フレーム ${state.frames.length + 1}`, baseFrame.layers, state.width, state.height);
      state.frames.splice(state.activeFrame + 1, 0, newFrame);
      state.activeFrame += 1;
      state.activeLayer = newFrame.layers[newFrame.layers.length - 1].id;
      markHistoryDirty();
      scheduleSessionPersist();
      renderFrameList();
      renderLayerList();
      requestRender();
      requestOverlayRender();
      commitHistory();
    });

    dom.controls.removeFrame?.addEventListener('click', () => {
      if (state.frames.length <= 1) return;
      beginHistory('removeFrame');
      state.frames.splice(state.activeFrame, 1);
      state.activeFrame = clamp(state.activeFrame, 0, state.frames.length - 1);
      const frame = getActiveFrame();
      state.activeLayer = frame.layers[frame.layers.length - 1].id;
      markHistoryDirty();
      scheduleSessionPersist();
      renderFrameList();
      renderLayerList();
      requestRender();
      requestOverlayRender();
      commitHistory();
    });

    dom.controls.playAnimation?.addEventListener('click', togglePlayback);
    dom.controls.animationFps?.addEventListener('change', () => {
      const frame = getActiveFrame();
      const fps = clamp(Number(dom.controls.animationFps.value), 1, 60) || 12;
      frame.duration = 1000 / fps;
      dom.controls.animationFps.value = String(fps);
    });

    if (dom.controls.animationFps) {
      dom.controls.animationFps.value = String(Math.round(1000 / getActiveFrame().duration));
    }

    renderFrameList();
    renderLayerList();
  }

  function togglePlayback() {
    if (state.playback.isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  }

  function startPlayback() {
    if (state.playback.isPlaying) return;
    state.playback.isPlaying = true;
    dom.controls.playAnimation.textContent = '■';
    lastFrameTime = performance.now();
    playbackHandle = requestAnimationFrame(stepPlayback);
  }

  function stopPlayback() {
    state.playback.isPlaying = false;
    dom.controls.playAnimation.textContent = '▶';
    if (playbackHandle != null) {
      cancelAnimationFrame(playbackHandle);
      playbackHandle = null;
    }
  }

  function stepPlayback(timestamp) {
    if (!state.playback.isPlaying) return;
    const frame = getActiveFrame();
    const elapsed = timestamp - lastFrameTime;
    if (elapsed >= frame.duration) {
      state.activeFrame = (state.activeFrame + 1) % state.frames.length;
      renderFrameList();
      renderLayerList();
      requestRender();
      lastFrameTime = timestamp;
    }
    playbackHandle = requestAnimationFrame(stepPlayback);
  }

  function renderFrameList() {
    const list = dom.controls.frameList;
    if (!list) return;
    list.innerHTML = '';
    state.frames.forEach((frame, index) => {
      const item = document.createElement('li');
      item.className = 'item-row';
      item.classList.toggle('is-active', index === state.activeFrame);
      item.textContent = frame.name;
      item.addEventListener('click', () => {
        state.activeFrame = index;
        const activeLayer = frame.layers[frame.layers.length - 1];
        state.activeLayer = activeLayer.id;
        scheduleSessionPersist();
        renderFrameList();
        renderLayerList();
        requestRender();
      });
      list.appendChild(item);
    });
  }

  function renderLayerList() {
    const list = dom.controls.layerList;
    if (!list) return;
    list.innerHTML = '';
    const frame = getActiveFrame();
    frame.layers.slice().reverse().forEach(layer => {
      const item = document.createElement('li');
      item.className = 'item-row';
      const isActive = layer.id === state.activeLayer;
      item.classList.toggle('is-active', isActive);
      const nameSpan = document.createElement('span');
      nameSpan.textContent = layer.name;
      const visibility = document.createElement('button');
      visibility.type = 'button';
      visibility.className = 'visibility-toggle';
      visibility.textContent = layer.visible ? '👁' : '☒';
      visibility.setAttribute('aria-pressed', String(layer.visible));
      visibility.addEventListener('click', event => {
        event.stopPropagation();
        beginHistory('layerVisibility');
        layer.visible = !layer.visible;
        visibility.textContent = layer.visible ? '👁' : '☒';
        visibility.setAttribute('aria-pressed', String(layer.visible));
        markHistoryDirty();
        requestRender();
        commitHistory();
        scheduleSessionPersist();
      });
      item.appendChild(visibility);
      item.appendChild(nameSpan);
      const opacityBox = document.createElement('input');
      opacityBox.type = 'number';
      opacityBox.min = '0';
      opacityBox.max = '100';
      opacityBox.value = String(Math.round(layer.opacity * 100));
      opacityBox.addEventListener('change', event => {
        beginHistory('layerOpacity');
        layer.opacity = clamp(Number(event.target.value) / 100, 0, 1);
        markHistoryDirty();
        requestRender();
        commitHistory();
        scheduleSessionPersist();
      });
      item.appendChild(opacityBox);
      item.addEventListener('click', () => {
        state.activeLayer = layer.id;
        scheduleSessionPersist();
        renderLayerList();
      });
      list.appendChild(item);
    });
  }

  function setupCanvas() {
    resizeCanvases();
  }

  function resizeCanvases() {
    const { width, height, scale } = state;
    if (dom.canvases.drawing) {
      dom.canvases.drawing.width = width;
      dom.canvases.drawing.height = height;
    }
    if (dom.canvases.overlay) {
      dom.canvases.overlay.width = width;
      dom.canvases.overlay.height = height;
    }
    if (dom.canvases.selection) {
      dom.canvases.selection.width = width;
      dom.canvases.selection.height = height;
    }
    if (ctx.drawing) {
      ctx.drawing.imageSmoothingEnabled = false;
    }
    if (ctx.overlay) {
      ctx.overlay.imageSmoothingEnabled = false;
    }
    if (ctx.selection) {
      ctx.selection.imageSmoothingEnabled = false;
    }
    if (dom.canvases.drawing) {
      dom.canvases.drawing.style.width = `${width * scale}px`;
      dom.canvases.drawing.style.height = `${height * scale}px`;
    }
    if (dom.canvases.overlay) {
      dom.canvases.overlay.style.width = `${width * scale}px`;
      dom.canvases.overlay.style.height = `${height * scale}px`;
    }
    if (dom.canvases.selection) {
      dom.canvases.selection.style.width = `${width * scale}px`;
      dom.canvases.selection.style.height = `${height * scale}px`;
    }
    applyViewportTransform();
    syncControlsWithState();
    renderCanvas();
    requestOverlayRender();
  }

  function setZoom(nextScale) {
    const prevScale = state.scale;
    const scale = clamp(Math.round(nextScale), 1, 40);
    if (scale === prevScale) return;
    const ratio = scale / prevScale;
    state.scale = scale;
    state.pan.x = Math.round((Number(state.pan.x) || 0) * ratio);
    state.pan.y = Math.round((Number(state.pan.y) || 0) * ratio);
    resizeCanvases();
    scheduleSessionPersist();
  }

  function setupKeyboard() {
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        clearSelection();
        return;
      }
      const isModifier = event.metaKey || event.ctrlKey;
      if (!isModifier) {
        return;
      }
      const target = event.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) {
        return;
      }
      const key = event.key.toLowerCase();
      if (key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if ((key === 'z' && event.shiftKey) || key === 'y') {
        event.preventDefault();
        redo();
      }
    });
  }

  function handlePointerDown(event) {
    if (event.button === 1) return;
    event.preventDefault();
    const position = getPointerPosition(event);
    const activeTool = state.tool;
    const layer = getActiveLayer();

    if (HISTORY_DRAW_TOOLS.has(activeTool) && !layer) {
      return;
    }

    if (activeTool === 'pan') {
      pointerState.startClient = { x: event.clientX, y: event.clientY };
      pointerState.panOrigin = { x: state.pan.x, y: state.pan.y };
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return;
    }

    if (!position) {
      pointerState.active = false;
      return;
    }

    if (activeTool === 'curve') {
      if (HISTORY_DRAW_TOOLS.has(activeTool) && !layer) {
        return;
      }
      handleCurvePointerDown(event, position, layer);
      return;
    }

    dom.canvases.drawing.setPointerCapture(event.pointerId);
    hoverPixel = null;
    requestOverlayRender();
    pointerState.active = true;
    pointerState.pointerId = event.pointerId;
    pointerState.tool = activeTool;
    pointerState.start = position;
    pointerState.current = position;
    pointerState.last = position;
    pointerState.path = position ? [position] : [];
    pointerState.preview = null;
    pointerState.selectionPreview = null;

    if (HISTORY_DRAW_TOOLS.has(activeTool)) {
      beginHistory(activeTool);
    }

    if (activeTool === 'eyedropper') {
      sampleColor(position.x, position.y);
      pointerState.active = false;
      dom.canvases.drawing.releasePointerCapture(event.pointerId);
      return;
    }

    if (activeTool === 'selectSame') {
      createSelectionByColor(position.x, position.y);
      pointerState.active = false;
      dom.canvases.drawing.releasePointerCapture(event.pointerId);
      return;
    }

    if (activeTool === 'fill') {
      floodFill(position.x, position.y);
      commitHistory();
      pointerState.active = false;
      dom.canvases.drawing.releasePointerCapture(event.pointerId);
      requestOverlayRender();
      return;
    }

    if (activeTool === 'selectRect' || activeTool === 'selectLasso') {
      pointerState.selectionPreview = { start: position, points: [position] };
    } else if (activeTool === 'line' || activeTool === 'rect' || activeTool === 'rectFill' || activeTool === 'ellipse' || activeTool === 'ellipseFill') {
      pointerState.preview = { start: position, end: position, points: [position] };
    } else {
      applyBrushStroke(position.x, position.y, position.x, position.y);
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }

  function handlePointerMove(event) {
    if (!pointerState.active || event.pointerId !== pointerState.pointerId) return;
    if (pointerState.tool === 'pan') {
      const dx = event.clientX - (pointerState.startClient?.x || 0);
      const dy = event.clientY - (pointerState.startClient?.y || 0);
      const originX = pointerState.panOrigin?.x || 0;
      const originY = pointerState.panOrigin?.y || 0;
      state.pan.x = Math.round(originX + dx);
      state.pan.y = Math.round(originY + dy);
      applyViewportTransform();
      return;
    }
    if (pointerState.tool === 'curve') {
      handleCurvePointerMove(event);
      return;
    }

    const position = getPointerPosition(event);
    if (!position) return;
    pointerState.current = position;
    pointerState.path.push(position);

    if (pointerState.tool === 'pen' || pointerState.tool === 'eraser') {
      applyBrushStroke(pointerState.last.x, pointerState.last.y, position.x, position.y);
      pointerState.last = position;
    } else if (pointerState.tool === 'line' || pointerState.tool === 'rect' || pointerState.tool === 'rectFill' || pointerState.tool === 'ellipse' || pointerState.tool === 'ellipseFill') {
      pointerState.preview = { start: pointerState.start, end: position, points: pointerState.path.slice() };
      requestOverlayRender();
    } else if (pointerState.tool === 'selectRect' || pointerState.tool === 'selectLasso') {
      pointerState.selectionPreview.points.push(position);
      pointerState.selectionPreview.end = position;
      requestOverlayRender();
    }
  }

  function handlePointerUp(event) {
    if (!pointerState.active || event.pointerId !== pointerState.pointerId) return;
    dom.canvases.drawing.releasePointerCapture(event.pointerId);
    pointerState.active = false;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);

    if (pointerState.tool === 'pan') {
      pointerState.startClient = null;
      pointerState.panOrigin = { x: state.pan.x, y: state.pan.y };
      pointerState.path = [];
      requestOverlayRender();
      scheduleSessionPersist();
      return;
    }

    if (pointerState.tool === 'curve') {
      handleCurvePointerUp(event);
      return;
    }

    hoverPixel = getPointerPosition(event);
    const tool = pointerState.tool;

    if (tool === 'line') {
      drawLine(pointerState.start, pointerState.current);
    } else if (tool === 'rect') {
      drawRectangle(pointerState.start, pointerState.current, false);
    } else if (tool === 'rectFill') {
      drawRectangle(pointerState.start, pointerState.current, true);
    } else if (tool === 'ellipse') {
      drawEllipse(pointerState.start, pointerState.current, false);
    } else if (tool === 'ellipseFill') {
      drawEllipse(pointerState.start, pointerState.current, true);
    } else if (tool === 'selectRect') {
      createSelectionRect(pointerState.start, pointerState.current);
    } else if (tool === 'selectLasso') {
      createSelectionLasso(pointerState.selectionPreview.points);
    }

    if (HISTORY_DRAW_TOOLS.has(tool)) {
      commitHistory();
    }

    pointerState.pointerId = null;
    pointerState.preview = null;
    pointerState.selectionPreview = null;
    pointerState.path = [];
    requestOverlayRender();
  }

  function getPointerPosition(event) {
    const rect = dom.canvases.drawing.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * state.width);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * state.height);
    if (x < 0 || y < 0 || x >= state.width || y >= state.height) return null;
    return { x, y };
  }

  function applyBrushStroke(x0, y0, x1, y1) {
    const layer = getActiveLayer();
    if (!layer) return;
    const points = bresenhamLine(x0, y0, x1, y1);
    points.forEach(point => stampBrush(layer, point.x, point.y));
    requestRender();
  }

  function setPixel(layer, x, y) {
    if (x < 0 || y < 0 || x >= state.width || y >= state.height) return;
    if (state.selectionMask && state.selectionMask[y * state.width + x] !== 1) return;
    const index = y * state.width + x;
    const base = index * 4;

    if (pointerState.tool === 'eraser') {
      if (layer.indices[index] === -1 && layer.direct[base + 3] === 0) {
        return;
      }
      layer.indices[index] = -1;
      layer.direct[base] = 0;
      layer.direct[base + 1] = 0;
      layer.direct[base + 2] = 0;
      layer.direct[base + 3] = 0;
      markHistoryDirty();
      return;
    }

    if (state.colorMode === 'index') {
      if (layer.indices[index] === state.activePaletteIndex) {
        return;
      }
      layer.indices[index] = state.activePaletteIndex;
      layer.direct[base] = 0;
      layer.direct[base + 1] = 0;
      layer.direct[base + 2] = 0;
      layer.direct[base + 3] = 0;
      markHistoryDirty();
    } else {
      const target = {
        r: layer.direct[base],
        g: layer.direct[base + 1],
        b: layer.direct[base + 2],
        a: layer.direct[base + 3],
      };
      const blended = blendColors(target, state.activeRgb, state.brushOpacity);
      if (layer.indices[index] === -1 && target.r === blended.r && target.g === blended.g && target.b === blended.b && target.a === blended.a) {
        return;
      }
      layer.indices[index] = -1;
      layer.direct[base] = blended.r;
      layer.direct[base + 1] = blended.g;
      layer.direct[base + 2] = blended.b;
      layer.direct[base + 3] = blended.a;
      markHistoryDirty();
    }
  }

  function getBrushOffsets(size) {
    const base = clamp(Math.round(size || 1), 1, 64);
    let offsets = brushOffsetCache.get(base);
    if (!offsets) {
      const halfDown = Math.floor(base / 2);
      const halfUp = Math.ceil(base / 2);
      offsets = [];
      for (let dy = -halfDown; dy < halfUp; dy += 1) {
        for (let dx = -halfDown; dx < halfUp; dx += 1) {
          offsets.push({ dx, dy });
        }
      }
      brushOffsetCache.set(base, offsets);
    }
    return offsets;
  }

  function forEachBrushOffset(callback, sizeOverride) {
    const baseSize = sizeOverride ?? state.brushSize;
    const offsets = getBrushOffsets(baseSize || 1);
    for (let i = 0; i < offsets.length; i += 1) {
      const { dx, dy } = offsets[i];
      callback(dx, dy);
    }
  }

  function stampBrush(layer, cx, cy) {
    forEachBrushOffset((dx, dy) => setPixel(layer, cx + dx, cy + dy));
  }

  function drawLine(start, end) {
    const layer = getActiveLayer();
    if (!layer) return;
    const points = bresenhamLine(start.x, start.y, end.x, end.y);
    points.forEach(point => stampBrush(layer, point.x, point.y));
    requestRender();
  }

  function drawRectangle(start, end, filled) {
    const layer = getActiveLayer();
    if (!layer) return;
    const x0 = Math.min(start.x, end.x);
    const x1 = Math.max(start.x, end.x);
    const y0 = Math.min(start.y, end.y);
    const y1 = Math.max(start.y, end.y);

    if (filled) {
      for (let y = y0; y <= y1; y += 1) {
        for (let x = x0; x <= x1; x += 1) {
          stampBrush(layer, x, y);
        }
      }
    } else {
      for (let x = x0; x <= x1; x += 1) {
        stampBrush(layer, x, y0);
        stampBrush(layer, x, y1);
      }
      for (let y = y0; y <= y1; y += 1) {
        stampBrush(layer, x0, y);
        stampBrush(layer, x1, y);
      }
    }
    requestRender();
  }

  function drawEllipse(start, end, filled) {
    const layer = getActiveLayer();
    if (!layer) return;
    const cx = (start.x + end.x) / 2;
    const cy = (start.y + end.y) / 2;
    const rx = Math.abs(end.x - start.x) / 2;
    const ry = Math.abs(end.y - start.y) / 2;
    if (rx === 0 && ry === 0) {
      stampBrush(layer, Math.round(cx), Math.round(cy));
      requestRender();
      return;
    }

    const minX = Math.floor(cx - rx);
    const maxX = Math.ceil(cx + rx);
    const minY = Math.floor(cy - ry);
    const maxY = Math.ceil(cy + ry);
    const denomX = rx ** 2 || 1;
    const denomY = ry ** 2 || 1;
    const threshold = Math.max(0.6, Math.min(rx, ry) <= 1 ? 1.2 : 0.6);

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const norm = ((x - cx) ** 2) / denomX + ((y - cy) ** 2) / denomY;
        if (filled) {
          if (norm <= 1) {
            stampBrush(layer, x, y);
          }
        } else if (Math.abs(norm - 1) < threshold) {
          stampBrush(layer, x, y);
        }
      }
    }
    requestRender();
  }

  function floodFill(x, y) {
    const layer = getActiveLayer();
    if (!layer) return;
    const targetColor = sampleLayerColor(layer, x, y);
    const replacement = state.colorMode === 'index' ? { type: 'index', index: state.activePaletteIndex } : { type: 'direct', color: { ...state.activeRgb } };

    if (colorsEqual(targetColor, replacement)) {
      return;
    }

    const visited = new Uint8Array(state.width * state.height);
    const stack = [[x, y]];

    while (stack.length > 0) {
      const [px, py] = stack.pop();
      if (px < 0 || py < 0 || px >= state.width || py >= state.height) continue;
      const idx = py * state.width + px;
      if (visited[idx]) continue;
      visited[idx] = 1;
      if (state.selectionMask && state.selectionMask[idx] !== 1) continue;
      const current = sampleLayerColor(layer, px, py);
      if (!colorMatches(current, targetColor)) continue;
      setPixel(layer, px, py);
      stack.push([px + 1, py]);
      stack.push([px - 1, py]);
      stack.push([px, py + 1]);
      stack.push([px, py - 1]);
    }
    requestRender();
  }

  function sampleColor(x, y) {
    const { color, mode, index } = sampleCompositeColor(x, y);
    if (!color) return;
    if (mode === 'index') {
      state.colorMode = 'index';
      dom.controls.colorMode.forEach(input => {
        input.checked = input.value === 'index';
      });
      setActivePaletteIndex(index);
    } else {
      state.colorMode = 'rgb';
      dom.controls.colorMode.forEach(input => {
        input.checked = input.value === 'rgb';
      });
      state.activeRgb = { ...color };
      dom.controls.rgbR.value = String(color.r);
      dom.controls.rgbG.value = String(color.g);
      dom.controls.rgbB.value = String(color.b);
      dom.controls.rgbA.value = String(color.a);
      dom.controls.rgbColor.value = rgbaToHex(color);
      document.getElementById('colorModeIndex')?.setAttribute('hidden', 'true');
      document.getElementById('colorModeRgb')?.removeAttribute('hidden');
    }
  }

  function sampleCompositeColor(x, y) {
    const layers = getActiveFrame().layers;
    let color = null;
    let mode = 'rgb';
    let index = -1;
    for (let i = layers.length - 1; i >= 0; i -= 1) {
      const layer = layers[i];
      if (!layer.visible) continue;
      const idx = y * state.width + x;
      if (layer.indices[idx] >= 0) {
        color = state.palette[layer.indices[idx]];
        mode = 'index';
        index = layer.indices[idx];
        break;
      }
      const base = idx * 4;
      const a = layer.direct[base + 3];
      if (a > 0) {
        color = {
          r: layer.direct[base],
          g: layer.direct[base + 1],
          b: layer.direct[base + 2],
          a,
        };
        mode = 'rgb';
        break;
      }
    }
    return { color, mode, index };
  }

  function sampleLayerColor(layer, x, y) {
    const idx = y * state.width + x;
    if (layer.indices[idx] >= 0) {
      return { type: 'index', index: layer.indices[idx] };
    }
    const base = idx * 4;
    return {
      type: 'rgb',
      color: {
        r: layer.direct[base],
        g: layer.direct[base + 1],
        b: layer.direct[base + 2],
        a: layer.direct[base + 3],
      },
    };
  }

  function colorsEqual(target, replacement) {
    if (!target || !replacement) return false;
    if (target.type === 'index' && replacement.type === 'index') {
      return target.index === replacement.index;
    }
    if (target.type === 'rgb' && replacement.type === 'direct') {
      const c = replacement.color;
      return target.color.r === c.r && target.color.g === c.g && target.color.b === c.b && target.color.a === c.a;
    }
    return false;
  }

  function colorMatches(target, sample) {
    if (!sample || !target) return false;
    if (sample.type === 'index' && target.type === 'index') {
      return sample.index === target.index;
    }
    if (sample.type === 'rgb' && target.type === 'rgb') {
      return sample.color.r === target.color.r && sample.color.g === target.color.g && sample.color.b === target.color.b && sample.color.a === target.color.a;
    }
    return false;
  }

  function createSelectionRect(start, end) {
    const x0 = clamp(Math.min(start.x, end.x), 0, state.width - 1);
    const x1 = clamp(Math.max(start.x, end.x), 0, state.width - 1);
    const y0 = clamp(Math.min(start.y, end.y), 0, state.height - 1);
    const y1 = clamp(Math.max(start.y, end.y), 0, state.height - 1);
    const mask = new Uint8Array(state.width * state.height);
    for (let y = y0; y <= y1; y += 1) {
      for (let x = x0; x <= x1; x += 1) {
        mask[y * state.width + x] = 1;
      }
    }
    state.selectionMask = mask;
    state.selectionBounds = { x0, y0, x1, y1 };
  }

  function createSelectionLasso(points) {
    if (!points || points.length < 3) return;
    const mask = new Uint8Array(state.width * state.height);
    const bounds = {
      x0: state.width,
      y0: state.height,
      x1: 0,
      y1: 0,
    };
    for (const point of points) {
      bounds.x0 = Math.min(bounds.x0, point.x);
      bounds.y0 = Math.min(bounds.y0, point.y);
      bounds.x1 = Math.max(bounds.x1, point.x);
      bounds.y1 = Math.max(bounds.y1, point.y);
    }
    bounds.x0 = clamp(bounds.x0, 0, state.width - 1);
    bounds.y0 = clamp(bounds.y0, 0, state.height - 1);
    bounds.x1 = clamp(bounds.x1, 0, state.width - 1);
    bounds.y1 = clamp(bounds.y1, 0, state.height - 1);

    for (let y = bounds.y0; y <= bounds.y1; y += 1) {
      for (let x = bounds.x0; x <= bounds.x1; x += 1) {
        if (pointInPolygon({ x, y }, points)) {
          mask[y * state.width + x] = 1;
        }
      }
    }
    state.selectionMask = mask;
    state.selectionBounds = bounds;
  }

  function createSelectionByColor(x, y) {
    const frame = getActiveFrame();
    const mask = new Uint8Array(state.width * state.height);
    const bounds = { x0: state.width, y0: state.height, x1: 0, y1: 0 };
    const stack = [[x, y]];
    const visited = new Uint8Array(state.width * state.height);
    const target = sampleCompositeColor(x, y);

    while (stack.length > 0) {
      const [px, py] = stack.pop();
      if (px < 0 || py < 0 || px >= state.width || py >= state.height) continue;
      const idx = py * state.width + px;
      if (visited[idx]) continue;
      visited[idx] = 1;
      const sample = sampleCompositeColor(px, py);
      if (!compositeColorMatches(sample, target)) continue;
      mask[idx] = 1;
      bounds.x0 = Math.min(bounds.x0, px);
      bounds.y0 = Math.min(bounds.y0, py);
      bounds.x1 = Math.max(bounds.x1, px);
      bounds.y1 = Math.max(bounds.y1, py);
      stack.push([px + 1, py]);
      stack.push([px - 1, py]);
      stack.push([px, py + 1]);
      stack.push([px, py - 1]);
    }

    if (bounds.x0 > bounds.x1 || bounds.y0 > bounds.y1) {
      clearSelection();
      return;
    }

    state.selectionMask = mask;
    state.selectionBounds = bounds;
    requestOverlayRender();
  }

  function compositeColorMatches(a, b) {
    if (!a.color || !b.color) return false;
    if (a.mode === 'index' && b.mode === 'index') {
      return a.index === b.index;
    }
    return a.color.r === b.color.r && a.color.g === b.color.g && a.color.b === b.color.b && a.color.a === b.color.a;
  }

  function clearSelection() {
    state.selectionMask = null;
    state.selectionBounds = null;
    requestOverlayRender();
  }

  function renderEverything() {
    requestRender();
  }

  function requestRender() {
    if (renderScheduled) return;
    renderScheduled = true;
    requestAnimationFrame(() => {
      renderScheduled = false;
      renderCanvas();
      requestOverlayRender();
    });
  }

  function renderCanvas() {
    const { width, height } = state;
    const image = ctx.drawing.createImageData(width, height);
    const data = image.data;

    const layers = getActiveFrame().layers;
    for (let l = 0; l < layers.length; l += 1) {
      const layer = layers[l];
      if (!layer.visible || layer.opacity <= 0) continue;
      const opacity = layer.opacity;
      for (let i = 0; i < width * height; i += 1) {
        let pixel;
        const paletteIndex = layer.indices[i];
        if (paletteIndex >= 0) {
          pixel = state.palette[paletteIndex];
        } else {
          const base = i * 4;
          const alpha = layer.direct[base + 3];
          if (alpha === 0) continue;
          pixel = {
            r: layer.direct[base],
            g: layer.direct[base + 1],
            b: layer.direct[base + 2],
            a: alpha,
          };
        }
        if (!pixel) continue;
        const base = i * 4;
        const srcA = (pixel.a / 255) * opacity;
        if (srcA <= 0) continue;
        const dstA = data[base + 3] / 255;
        const outA = srcA + dstA * (1 - srcA);
        const blend = outA > 0 ? (value, channel) => {
          const src = pixel[channel];
          const dst = data[base + (channel === 'r' ? 0 : channel === 'g' ? 1 : 2)];
          return Math.round(((src * srcA) + dst * dstA * (1 - srcA)) / outA);
        } : () => 0;
        data[base] = blend(0, 'r');
        data[base + 1] = blend(0, 'g');
        data[base + 2] = blend(0, 'b');
        data[base + 3] = Math.round(outA * 255);
      }
    }

    ctx.drawing.putImageData(image, 0, 0);
  }

  function requestOverlayRender() {
    overlayNeedsRedraw = true;
    requestAnimationFrame(() => {
      if (!overlayNeedsRedraw) return;
      overlayNeedsRedraw = false;
      renderOverlay();
    });
  }

  function renderOverlay() {
    const { width, height } = state;
    if (ctx.overlay) {
      ctx.overlay.clearRect(0, 0, width, height);
    }
    if (ctx.selection) {
      ctx.selection.clearRect(0, 0, width, height);
    }
    if (state.selectionMask) {
      drawSelectionOverlay();
    }

    const focusPixel = pointerState.active ? pointerState.current : hoverPixel;
    const activeTool = getActiveTool();
    if (state.showPixelGuides && focusPixel) {
      const overrideSize = activeTool === 'fill' ? 1 : undefined;
      drawBrushCrosshair(focusPixel, overrideSize);
    }

    if (ctx.overlay && !pointerState.active && activeTool === 'fill' && focusPixel) {
      const previewPixels = getFillPreviewPixels(focusPixel.x, focusPixel.y);
      if (previewPixels && previewPixels.length) {
        ctx.overlay.save();
        ctx.overlay.fillStyle = rgbaToCss(getActiveDrawColor());
        previewPixels.forEach(idx => {
          const px = idx % state.width;
          const py = Math.floor(idx / state.width);
          ctx.overlay.fillRect(px, py, 1, 1);
        });
        ctx.overlay.restore();
      }
    }

    if (pointerState.preview && ctx.overlay && (pointerState.tool === 'line' || pointerState.tool === 'rect' || pointerState.tool === 'rectFill' || pointerState.tool === 'ellipse' || pointerState.tool === 'ellipseFill' || pointerState.tool === 'curve')) {
      drawPreviewShape(pointerState);
    }

    if (ctx.overlay && state.tool === 'curve' && curveBuilder) {
      drawCurveGuides(curveBuilder);
    }

    if (pointerState.selectionPreview && pointerState.tool === 'selectLasso') {
      drawLassoPreview(pointerState.selectionPreview.points);
    }

    if (pointerState.selectionPreview && pointerState.tool === 'selectRect') {
      drawRectanglePreview(pointerState.selectionPreview.start, pointerState.selectionPreview.end);
    }
  }

  function drawBrushPreview(center) {
    drawBrushCrosshair(center);
  }

  function drawBrushCrosshair(center, sizeOverride) {
    if (!center) return;
    if (!ctx.overlay) return;
    const { width, height } = state;
    if (width <= 0 || height <= 0) return;
    const selectionMask = state.selectionMask;
    const size = clamp(Math.round(sizeOverride || state.brushSize || 1), 1, 64);
    const halfDown = Math.floor(size / 2);
    const halfUp = Math.ceil(size / 2);
    const minX = clamp(center.x - halfDown, 0, width - 1);
    const maxX = clamp(center.x + halfUp - 1, 0, width - 1);
    const minY = clamp(center.y - halfDown, 0, height - 1);
    const maxY = clamp(center.y + halfUp - 1, 0, height - 1);
    const color = getActiveDrawColor();
    ctx.overlay.save();
    ctx.overlay.fillStyle = rgbaToCss(color);
    const crossY = clamp(center.y, minY, maxY);
    for (let x = minX; x <= maxX; x += 1) {
      const idx = crossY * width + x;
      if (!selectionMask || selectionMask[idx] === 1) {
        ctx.overlay.fillRect(x, crossY, 1, 1);
      }
    }
    const crossX = clamp(center.x, minX, maxX);
    for (let y = minY; y <= maxY; y += 1) {
      const idx = y * width + crossX;
      if (!selectionMask || selectionMask[idx] === 1) {
        ctx.overlay.fillRect(crossX, y, 1, 1);
      }
    }
    ctx.overlay.restore();
  }

  function computeFillPreview(x, y) {
    const layer = getActiveLayer();
    if (!layer) return null;
    const width = state.width;
    const height = state.height;
    const selectionMask = state.selectionMask;
    const startIdx = y * width + x;
    if (selectionMask && selectionMask[startIdx] !== 1) {
      return [];
    }
    const targetColor = sampleLayerColor(layer, x, y);
    const replacement = state.colorMode === 'index'
      ? { type: 'index', index: state.activePaletteIndex }
      : { type: 'direct', color: { ...state.activeRgb } };
    if (colorsEqual(targetColor, replacement)) {
      return [];
    }
    const visited = new Uint8Array(width * height);
    const stack = [[x, y]];
    const pixels = [];
    while (stack.length > 0) {
      const [px, py] = stack.pop();
      if (px < 0 || py < 0 || px >= width || py >= height) continue;
      const idx = py * width + px;
      if (visited[idx]) continue;
      visited[idx] = 1;
      if (selectionMask && selectionMask[idx] !== 1) continue;
      const current = sampleLayerColor(layer, px, py);
      if (!colorMatches(current, targetColor)) continue;
      pixels.push(idx);
      stack.push([px + 1, py]);
      stack.push([px - 1, py]);
      stack.push([px, py + 1]);
      stack.push([px, py - 1]);
    }
    return pixels;
  }

  function getFillPreviewKey(x, y) {
    const frame = getActiveFrame();
    const layer = getActiveLayer();
    if (!frame || !layer) return null;
    const colorKey = state.colorMode === 'index'
      ? `index-${state.activePaletteIndex}-${JSON.stringify(state.palette[state.activePaletteIndex] || {})}`
      : `rgb-${state.activeRgb.r}-${state.activeRgb.g}-${state.activeRgb.b}-${state.activeRgb.a}`;
    return `${frame.id}|${layer.id}|${state.width}x${state.height}|${x},${y}|${colorKey}`;
  }

  function getFillPreviewPixels(x, y) {
    if (state.selectionMask) {
      return computeFillPreview(x, y);
    }
    const key = getFillPreviewKey(x, y);
    if (key && fillPreviewCache.key === key) {
      return fillPreviewCache.pixels;
    }
    const pixels = computeFillPreview(x, y);
    if (key) {
      fillPreviewCache.key = key;
      fillPreviewCache.pixels = pixels;
    }
    return pixels;
  }

  function drawSelectionOverlay() {
    const mask = state.selectionMask;
    if (!mask) return;
    const { width, height } = state;
    strokeSelectionPath(pathCtx => {
      traceSelectionOutline(pathCtx, mask, width, height);
    }, { translateHalf: true });
  }

  function strokeSelectionPath(trace, options = {}) {
    if (typeof trace !== 'function') return;
    const targetCtx = ctx.selection || ctx.overlay;
    if (!targetCtx || typeof targetCtx.setLineDash !== 'function') {
      return;
    }
    const scale = Math.max(Number(state.scale) || 1, 1);
    const lineWidth = 1 / scale;
    const dashLength = 1 / scale;
    const dashPattern = [dashLength, dashLength];

    targetCtx.save();
    if (options.translateHalf) {
      targetCtx.translate(0.5, 0.5);
    }
    targetCtx.lineWidth = lineWidth;
    targetCtx.setLineDash(dashPattern);
    targetCtx.lineJoin = 'miter';
    targetCtx.lineCap = 'butt';

    targetCtx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
    targetCtx.lineDashOffset = 0;
    targetCtx.beginPath();
    trace(targetCtx);
    targetCtx.stroke();

    targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    targetCtx.lineDashOffset = dashLength;
    targetCtx.beginPath();
    trace(targetCtx);
    targetCtx.stroke();

    targetCtx.restore();
  }

  function traceSelectionOutline(pathCtx, mask, width, height) {
    for (let y = 0; y < height; y += 1) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x += 1) {
        const idx = rowOffset + x;
        if (mask[idx] !== 1) continue;
        const topFilled = y > 0 && mask[idx - width] === 1;
        const bottomFilled = y < height - 1 && mask[idx + width] === 1;
        const leftFilled = x > 0 && mask[idx - 1] === 1;
        const rightFilled = x < width - 1 && mask[idx + 1] === 1;

        if (!topFilled) {
          pathCtx.moveTo(x, y);
          pathCtx.lineTo(x + 1, y);
        }
        if (!bottomFilled) {
          pathCtx.moveTo(x, y + 1);
          pathCtx.lineTo(x + 1, y + 1);
        }
        if (!leftFilled) {
          pathCtx.moveTo(x, y);
          pathCtx.lineTo(x, y + 1);
        }
        if (!rightFilled) {
          pathCtx.moveTo(x + 1, y);
          pathCtx.lineTo(x + 1, y + 1);
        }
      }
    }
  }

  function drawPreviewShape(previewState) {
    const tool = pointerState.tool || state.tool;
    const preview = previewState.preview;
    if (!preview) return;
    const { start, end, points } = preview;
    if (!start || !end) return;
    const width = state.width;
    const height = state.height;
    const selectionMask = state.selectionMask;
    const color = getActiveDrawColor();
    ctx.overlay.save();
    ctx.overlay.fillStyle = rgbaToCss(color);
    const stamp = (x, y) => {
      forEachBrushOffset((dx, dy) => {
        const px = x + dx;
        const py = y + dy;
        if (px < 0 || py < 0 || px >= width || py >= height) {
          return;
        }
        if (selectionMask && selectionMask[py * width + px] !== 1) {
          return;
        }
        ctx.overlay.fillRect(px, py, 1, 1);
      });
    };

    if (tool === 'line' || tool === 'curve') {
      const linePoints = bresenhamLine(start.x, start.y, end.x, end.y);
      linePoints.forEach(pt => stamp(pt.x, pt.y));
    } else if (tool === 'rect' || tool === 'rectFill') {
      const x0 = Math.min(start.x, end.x);
      const x1 = Math.max(start.x, end.x);
      const y0 = Math.min(start.y, end.y);
      const y1 = Math.max(start.y, end.y);
      if (tool === 'rectFill') {
        for (let y = y0; y <= y1; y += 1) {
          for (let x = x0; x <= x1; x += 1) {
            stamp(x, y);
          }
        }
      } else {
        for (let x = x0; x <= x1; x += 1) {
          stamp(x, y0);
          stamp(x, y1);
        }
        for (let y = y0; y <= y1; y += 1) {
          stamp(x0, y);
          stamp(x1, y);
        }
      }
    } else if (tool === 'ellipse' || tool === 'ellipseFill') {
      const cx = (start.x + end.x) / 2;
      const cy = (start.y + end.y) / 2;
      const rx = Math.abs(end.x - start.x) / 2;
      const ry = Math.abs(end.y - start.y) / 2;
      if (rx === 0 && ry === 0) {
        stamp(Math.round(cx), Math.round(cy));
      } else {
        const minX = Math.floor(cx - rx);
        const maxX = Math.ceil(cx + rx);
        const minY = Math.floor(cy - ry);
        const maxY = Math.ceil(cy + ry);
        const denomX = rx ** 2 || 1;
        const denomY = ry ** 2 || 1;
        const threshold = Math.max(0.6, Math.min(rx, ry) <= 1 ? 1.2 : 0.6);
        for (let y = minY; y <= maxY; y += 1) {
          for (let x = minX; x <= maxX; x += 1) {
            const norm = ((x - cx) ** 2) / denomX + ((y - cy) ** 2) / denomY;
            if (tool === 'ellipseFill') {
              if (norm <= 1) {
                stamp(x, y);
              }
            } else if (Math.abs(norm - 1) < threshold) {
              stamp(x, y);
            }
          }
        }
      }
    }

    ctx.overlay.restore();
  }

  function drawLassoPreview(points) {
    if (!points || points.length < 2) return;
    strokeSelectionPath(pathCtx => {
      pathCtx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i += 1) {
        const point = points[i];
        pathCtx.lineTo(point.x, point.y);
      }
      pathCtx.closePath();
    }, { translateHalf: true });
  }

  function drawRectanglePreview(start, end) {
    if (!start || !end) return;
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const w = Math.abs(end.x - start.x) + 1;
    const h = Math.abs(end.y - start.y) + 1;
    strokeSelectionPath(pathCtx => {
      pathCtx.rect(x, y, w, h);
    }, { translateHalf: true });
  }

  function blendColors(target, source, opacity) {
    const srcA = (source.a / 255) * opacity;
    const dstA = target.a / 255;
    const outA = srcA + dstA * (1 - srcA);
    if (outA === 0) {
      return { r: 0, g: 0, b: 0, a: 0 };
    }
    const blendChannel = (dst, src) => Math.round(((src * srcA) + dst * dstA * (1 - srcA)) / outA);
    return {
      r: blendChannel(target.r, source.r),
      g: blendChannel(target.g, source.g),
      b: blendChannel(target.b, source.b),
      a: Math.round(outA * 255),
    };
  }

  function getActiveFrame() {
    return state.frames[state.activeFrame];
  }

  function getActiveLayer() {
    const frame = getActiveFrame();
    return frame.layers.find(layer => layer.id === state.activeLayer) || frame.layers[frame.layers.length - 1];
  }

  function getActiveLayerIndex() {
    const frame = getActiveFrame();
    return frame.layers.findIndex(layer => layer.id === state.activeLayer);
  }

  function bresenhamLine(x0, y0, x1, y1) {
    const points = [];
    let dx = Math.abs(x1 - x0);
    let sx = x0 < x1 ? 1 : -1;
    let dy = -Math.abs(y1 - y0);
    let sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    let x = x0;
    let y = y0;
    while (true) {
      points.push({ x, y });
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }
    }
    return points;
  }

  function pointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;
      const intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi + 0.00001) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function scheduleSessionPersist() {
    scheduleAutosaveSnapshot();
    if (!canUseSessionStorage) return;
    if (sessionPersistHandle !== null) return;
    sessionPersistHandle = window.setTimeout(() => {
      sessionPersistHandle = null;
      persistSessionState();
    }, 120);
  }

  function persistSessionState() {
    if (!canUseSessionStorage) return;
    try {
      const snapshot = {
        scale: clamp(Math.round(state.scale || 1), 1, 40),
        pan: {
          x: Math.round(Number(state.pan?.x) || 0),
          y: Math.round(Number(state.pan?.y) || 0),
        },
        tool: state.tool,
        brushSize: clamp(Math.round(state.brushSize || 1), 1, 32),
        brushOpacity: clamp(Number(state.brushOpacity ?? 1), 0, 1),
        showGrid: Boolean(state.showGrid),
        gridScreenStep: clamp(Math.round(state.gridScreenStep || 16), 1, 256),
        showMajorGrid: Boolean(state.showMajorGrid),
        majorGridSpacing: clamp(Math.round(state.majorGridSpacing || 16), 2, 512),
        showPixelGuides: Boolean(state.showPixelGuides),
        showChecker: Boolean(state.showChecker),
        activeFrame: clamp(Number(state.activeFrame) || 0, 0, state.frames.length - 1),
        activeLayer: state.activeLayer,
        paletteIndex: clamp(Number(state.activePaletteIndex) || 0, 0, state.palette.length - 1),
        colorMode: state.colorMode,
        leftTab: state.activeLeftTab,
        rightTab: state.activeRightTab,
        backgroundMode: state.backgroundMode,
        toolGroup: state.activeToolGroup,
        lastGroupTool: { ...(state.lastGroupTool || DEFAULT_GROUP_TOOL) },
      };
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(snapshot));
    } catch (error) {
      // Ignore storage errors (private mode or quota exceeded)
    }
  }

  function restoreSessionState() {
    if (!canUseSessionStorage) return;
    let payload;
    try {
      const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return;
      payload = JSON.parse(raw);
    } catch (error) {
      return;
    }
    if (!payload || typeof payload !== 'object') {
      return;
    }

    if (Number.isFinite(payload.scale)) {
      state.scale = clamp(Math.round(payload.scale), 1, 40);
    }
    if (payload.pan && Number.isFinite(payload.pan.x) && Number.isFinite(payload.pan.y)) {
      state.pan.x = Math.round(payload.pan.x);
      state.pan.y = Math.round(payload.pan.y);
    }
    if (typeof payload.tool === 'string') {
      state.tool = payload.tool;
    }
    if (Number.isFinite(payload.brushSize)) {
      state.brushSize = clamp(Math.round(payload.brushSize), 1, 32);
    }
    if (Number.isFinite(payload.brushOpacity)) {
      state.brushOpacity = clamp(payload.brushOpacity, 0, 1);
    }
    if (typeof payload.showGrid === 'boolean') {
      state.showGrid = payload.showGrid;
    }
    if (Number.isFinite(payload.gridScreenStep)) {
      state.gridScreenStep = clamp(Math.round(payload.gridScreenStep), 1, 256);
    }
    if (typeof payload.showMajorGrid === 'boolean') {
      state.showMajorGrid = payload.showMajorGrid;
    }
    if (Number.isFinite(payload.majorGridSpacing)) {
      state.majorGridSpacing = clamp(Math.round(payload.majorGridSpacing), 2, 512);
    }
    if (payload.backgroundMode === 'light' || payload.backgroundMode === 'dark' || payload.backgroundMode === 'pink') {
      state.backgroundMode = payload.backgroundMode;
    }
    if (payload.toolGroup && TOOL_GROUPS[payload.toolGroup]) {
      state.activeToolGroup = payload.toolGroup;
    }
    if (payload.lastGroupTool && typeof payload.lastGroupTool === 'object') {
      state.lastGroupTool = { ...DEFAULT_GROUP_TOOL, ...payload.lastGroupTool };
    }
    if (payload.leftTab && LEFT_TAB_KEYS.includes(payload.leftTab)) {
      state.activeLeftTab = payload.leftTab;
    }
    if (payload.rightTab && RIGHT_TAB_KEYS.includes(payload.rightTab)) {
      state.activeRightTab = payload.rightTab;
    }
    if (typeof payload.showPixelGuides === 'boolean') {
      state.showPixelGuides = payload.showPixelGuides;
    }
    if (typeof payload.showChecker === 'boolean') {
      state.showChecker = payload.showChecker;
    }
    if (typeof payload.colorMode === 'string') {
      state.colorMode = payload.colorMode === 'rgb' ? 'rgb' : 'index';
    }
    if (Number.isFinite(payload.paletteIndex)) {
      state.activePaletteIndex = clamp(Math.round(payload.paletteIndex), 0, state.palette.length - 1);
    }
    if (Number.isFinite(payload.activeFrame)) {
      state.activeFrame = clamp(Math.round(payload.activeFrame), 0, state.frames.length - 1);
    }
    const frame = state.frames[state.activeFrame];
    if (frame && frame.layers && frame.layers.length) {
      const preferredLayer = typeof payload.activeLayer === 'string' ? payload.activeLayer : null;
      const fallbackLayer = frame.layers.find(layer => layer.id === preferredLayer);
      state.activeLayer = fallbackLayer ? fallbackLayer.id : frame.layers[frame.layers.length - 1].id;
    }
    if (!state.lastGroupTool) {
      state.lastGroupTool = { ...DEFAULT_GROUP_TOOL };
    }
    state.activeToolGroup = state.activeToolGroup || TOOL_TO_GROUP[state.tool] || 'pen';
  }

  function rgbaToHex({ r, g, b, a }) {
    const toHex = value => value.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function rgbaToCss({ r, g, b, a }) {
    return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
  }

  function getActiveDrawColor(opacityOverride) {
    const previewTool = pointerState.tool || state.tool;
    let baseColor;
    if (previewTool === 'eraser') {
      baseColor = { r: 255, g: 255, b: 255, a: 255 };
    } else if (state.colorMode === 'index') {
      baseColor = state.palette[state.activePaletteIndex];
    } else {
      baseColor = state.activeRgb;
    }
    if (!baseColor) {
      baseColor = { r: 255, g: 255, b: 255, a: 255 };
    }
    const color = {
      r: baseColor.r ?? 255,
      g: baseColor.g ?? 255,
      b: baseColor.b ?? 255,
      a: baseColor.a ?? 255,
    };
    if (color.a <= 0) {
      color.a = 255;
    }
    if (typeof opacityOverride === 'number') {
      const clamped = clamp(opacityOverride, 0, 1);
      color.a = Math.round(clamped * 255);
    }
    return color;
  }

  function hexToRgba(value) {
    if (!value || value[0] !== '#') return null;
    const hex = value.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b, a: 255 };
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b, a: 255 };
    }
    return null;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function debounce(fn, wait) {
    let handle;
    return (...args) => {
      clearTimeout(handle);
      handle = setTimeout(() => fn(...args), wait);
    };
  }

  init();
})();
