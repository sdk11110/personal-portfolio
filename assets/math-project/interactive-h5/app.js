export const chapterIds = ["intro", "interaction", "video-lab", "capabilities", "geometry", "teaching-tools", "closing"];

export const capabilityEntries = [
  { id: "math-in-motion", project: "Math in Motion", role: "HTML / CSS / JS · immersive H5", output: "H5" },
  { id: "cryptogram", project: "Cryptogram", role: "Manim / Python · TTS explainers", output: "VIDEO" },
  { id: "dive-log", project: "Dive Log", role: "case packaging · portfolio integration", output: "WEB" },
  { id: "teaching-objects", project: "Teaching Objects", role: "game-like tools · math interaction", output: "EDU" }
];

export const videoSources = [
  { id: "final-silent", file: "cryptogram_full_silent.mp4", src: "assets/videos/cryptogram_full_silent.mp4", title: "THE VISUAL MASTER", meta: "FINAL / SILENT · 155 SEC", copy: "完整无声成品，用来检查纯视觉的构造顺序和数学关系。", method: "silent" },
  { id: "final-tts", file: "cryptogram_full_tts.mp4", src: "assets/videos/cryptogram_full_tts.mp4", title: "THE FINISHED EXPLAINER", meta: "FINAL / TTS · 155 SEC", copy: "完整讲解成品，画面、配音和解释节奏已经合成。", method: "voice" },
  { id: "final-60fps", file: "cryptogram_full_tts_60fps.mp4", src: "assets/videos/cryptogram_full_tts_60fps.mp4", title: "THE PRESENTATION MASTER", meta: "FINAL / 60FPS · 1440P", copy: "最终超分与高帧率交付版本，用于更完整地呈现运动细节。", method: "reveal" }
];

export const videoMethods = [
  { id: "question", kicker: "01 / QUESTION", title: "先把题目拆成可讲的顺序", copy: "从 Cryptogram 的题目出发，先确定观众要看到什么、什么时候看到，再进入动画。", tools: "题目分析 · 讲解结构 · storyboard" },
  { id: "manim", kicker: "02 / MANIM", title: "用 Python 把关系变成运动", copy: "Manim 负责几何构造、公式变换和镜头节奏；每一段动画都是可重复渲染的数学场景。", tools: "Python · Manim · geometry · render" },
  { id: "voice", kicker: "03 / VOICE", title: "用 TTS 让画面获得讲解节奏", copy: "通过不同 TTS 音轨比较语速、停顿和信息密度，让同一套画面适配不同讲解方式。", tools: "TTS · narration · timing" },
  { id: "silent", kicker: "04 / SILENT CUT", title: "先验证无声画面是否成立", copy: "静音版用来检查：即使没有声音，构造顺序和视觉重点是否仍然足够清楚。", tools: "visual edit · pacing · clarity" },
  { id: "reveal", kicker: "05 / DELIVERY", title: "最后把视频包装进可进入的 H5", copy: "视频、poster、分镜按钮和章节转场被封装成一个可以浏览、切换和继续探索的作品案例。", tools: "HTML · CSS · JS · local assets" }
];

export function getVideoSource(id) {
  return videoSources.find((video) => video.id === id) || videoSources[0];
}

export function getVideoMethod(id) {
  return videoMethods.find((method) => method.id === id) || videoMethods[0];
}

export function calculateMean(values) {
  const numbers = Array.isArray(values) ? values.filter((value) => Number.isFinite(value)) : [];
  if (!numbers.length) return 0;
  return Number((numbers.reduce((sum, value) => sum + value, 0) / numbers.length).toFixed(2));
}

export function createMathDemoState(values = [4, 8, 12]) {
  const safeValues = Array.isArray(values) ? values.filter((value) => Number.isFinite(value)) : [];
  return { values: [...safeValues], mean: calculateMean(safeValues), status: "ready" };
}

export function moveDemoTile(state, fromIndex, toIndex) {
  if (!state || !Array.isArray(state.values)) return createMathDemoState();
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= state.values.length || toIndex >= state.values.length || fromIndex === toIndex) return { ...state, values: [...state.values] };
  const values = [...state.values];
  const [selected] = values.splice(fromIndex, 1);
  values.splice(toIndex, 0, selected);
  return { ...state, values, mean: calculateMean(values), status: "ready" };
}

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const state = {
  chapter: "intro",
  menuOpen: false,
  soundOn: false,
  demo: createMathDemoState(),
  selectedTile: null,
  reduceMotion: typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
};

function updateProgress(id) {
  const index = Math.max(0, chapterIds.indexOf(id));
  document.documentElement.style.setProperty("--chapter-index", index);
  document.documentElement.style.setProperty("--chapter-progress", String(index / (chapterIds.length - 1)));
  const rail = $("[data-progress-fill]");
  if (rail) rail.style.transform = `scaleY(${index / (chapterIds.length - 1)})`;
  $(".rail-label").textContent = `DEPTH / ${String(index + 1).padStart(2, "0")}`;
  $$(`[data-chapter]`).forEach((control) => {
    const isCurrent = control.dataset.chapter === id;
    control.classList.toggle("is-current", isCurrent);
    if (control.matches("a,button") && isCurrent) control.setAttribute("aria-current", "location");
    else control.removeAttribute("aria-current");
  });
}

export function setChapter(id, { scroll = true } = {}) {
  if (!chapterIds.includes(id)) return;
  state.chapter = id;
  $$(`[data-scene]`).forEach((scene) => scene.classList.toggle("is-active", scene.dataset.scene === id));
  updateProgress(id);
  if (scroll) $("#" + id)?.scrollIntoView({ behavior: state.reduceMotion ? "auto" : "smooth", block: "start" });
  if (window.location.hash !== `#${id}`) history.replaceState(null, "", `#${id}`);
  closeMenu();
}

function openMenu() {
  state.menuOpen = true;
  $("[data-menu]").setAttribute("aria-expanded", "true");
  $("[data-menu-panel]").setAttribute("aria-hidden", "false");
  document.body.classList.add("menu-open");
}

function closeMenu() {
  state.menuOpen = false;
  $("[data-menu]")?.setAttribute("aria-expanded", "false");
  $("[data-menu-panel]")?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("menu-open");
}

function renderDemo() {
  const zone = $("[data-tile-zone]");
  if (!zone) return;
  zone.innerHTML = state.demo.values.map((value, index) => `<button class="number-tile${state.selectedTile === index ? " is-selected" : ""}" type="button" draggable="true" data-tile-index="${index}" aria-label="数字 ${value}，第 ${index + 1} 个">${value}<small>0${index + 1}</small></button>`).join("");
  $("[data-mean]").textContent = state.demo.mean;
  $("[data-demo-status]").textContent = state.selectedTile === null ? "READY TO REORDER / 等待排列" : "SELECT A DESTINATION / 选择位置";
}

function moveTileTo(index) {
  if (state.selectedTile === null) {
    state.selectedTile = index;
    renderDemo();
    return;
  }
  state.demo = moveDemoTile(state.demo, state.selectedTile, index);
  state.selectedTile = null;
  renderDemo();
  $("[data-demo-status]").textContent = "RELATION UPDATED / 关系已更新";
}

function initMathDemo() {
  renderDemo();
  const zone = $("[data-tile-zone]");
  zone?.addEventListener("click", (event) => {
    const tile = event.target.closest("[data-tile-index]");
    if (tile) moveTileTo(Number(tile.dataset.tileIndex));
  });
  zone?.addEventListener("dragstart", (event) => {
    const tile = event.target.closest("[data-tile-index]");
    if (!tile) return;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", tile.dataset.tileIndex);
  });
  zone?.addEventListener("dragover", (event) => event.preventDefault());
  zone?.addEventListener("drop", (event) => {
    event.preventDefault();
    const tile = event.target.closest("[data-tile-index]");
    if (!tile) return;
    const fromIndex = Number(event.dataTransfer.getData("text/plain"));
    const toIndex = Number(tile.dataset.tileIndex);
    state.demo = moveDemoTile(state.demo, fromIndex, toIndex);
    state.selectedTile = null;
    renderDemo();
    $("[data-demo-status]").textContent = "RELATION UPDATED / 关系已更新";
  });
  $("[data-reset-demo]")?.addEventListener("click", () => {
    state.demo = createMathDemoState();
    state.selectedTile = null;
    renderDemo();
  });
}

function initIntro() {
  const boot = $("[data-boot]");
  const progress = $("[data-boot-progress]");
  const bar = $("[data-boot-bar]");
  const status = $("[data-boot-status]");
  const bootImage = $("[data-boot-image]");
  let value = 0;
  const paintProgress = (nextValue) => {
    value = Math.max(0, Math.min(100, nextValue));
    progress.textContent = `${String(value).padStart(2, "0")}%`;
    bar.style.width = `${value}%`;
    boot?.style.setProperty("--boot-progress", `${value}%`);
    bootImage?.style.setProperty("--boot-progress", `${value}%`);
  };
  const finish = () => {
    paintProgress(100);
    status.textContent = "STUDIO READY / 工作室已准备";
    window.setTimeout(() => document.body.classList.add("boot-complete"), state.reduceMotion ? 0 : 420);
  };
  if (state.reduceMotion) finish();
  else {
    const timer = window.setInterval(() => {
      paintProgress(value + Math.ceil(Math.random() * 16));
      if (value > 35) status.textContent = "ALIGNING SHAPES / 正在对齐形状";
      if (value > 72) status.textContent = "LOADING MOTION / 正在加载动效";
      if (value >= 100) { window.clearInterval(timer); finish(); }
    }, 90);
  }
  $("[data-start]")?.addEventListener("click", () => setChapter("interaction"));
  $("[data-skip]")?.addEventListener("click", () => setChapter("interaction"));
  boot?.addEventListener("click", (event) => { if (event.target === boot) finish(); });
}

function initStoryboard() {
  const player = $("[data-case-video]");
  const updateMethod = (id) => {
    const method = getVideoMethod(id);
    $$(`[data-video-method]`).forEach((item) => item.classList.toggle("is-current", item.dataset.videoMethod === method.id));
    $("[data-method-kicker]").textContent = method.kicker;
    $("[data-method-title]").textContent = method.title;
    $("[data-method-copy]").textContent = method.copy;
    $("[data-method-tools]").textContent = method.tools;
  };
  const updateVideo = (id, button) => {
    const video = getVideoSource(id);
    const filmScreen = player?.closest(".film-screen");
    $$(`[data-storyboard]`).forEach((item) => item.classList.toggle("is-current", item === button));
    $("[data-shot-number]").textContent = video.meta;
    $("[data-shot-title]").textContent = video.title;
    $("[data-shot-copy]").textContent = video.copy;
    $("[data-video-file]").textContent = video.file;
    updateMethod(video.method);
    if (player && player.getAttribute("src") !== video.src) {
      player.pause();
      player.setAttribute("src", video.src);
      player.load();
      if (filmScreen) {
        filmScreen.classList.remove("video-cut");
        void filmScreen.offsetWidth;
        filmScreen.classList.add("video-cut");
        window.setTimeout(() => filmScreen.classList.remove("video-cut"), 700);
      }
    }
  };
  $$(`[data-storyboard]`).forEach((button) => button.addEventListener("click", () => updateVideo(button.dataset.storyboard, button)));
  $$(`[data-video-method]`).forEach((button) => button.addEventListener("click", () => updateMethod(button.dataset.videoMethod)));
  const initialButton = $("[data-storyboard].is-current") || $("[data-storyboard]");
  if (initialButton) updateVideo(initialButton.dataset.storyboard, initialButton);
  $("[data-video-toggle]")?.addEventListener("click", () => {
    if (!player) return;
    if (player.paused) player.play().catch(() => {});
    else player.pause();
  });
  player?.addEventListener("play", () => { $("[data-video-toggle]").textContent = "Ⅱ"; document.body.classList.add("video-playing"); });
  player?.addEventListener("pause", () => { $("[data-video-toggle]").textContent = "▶"; document.body.classList.remove("video-playing"); });
}

function initTools() {
  const toolMethods = [
    { id: "0", title: "GRAB / 直接操作", copy: "先让手拿起、拖动或改变数量，概念从一个动作开始。", output: "CAN MAKE / 几何拖拽 · 计数操作 · 分数切分" },
    { id: "1", title: "SNAP / 比较关系", copy: "对象靠近目标时给出吸附预览，再把长度、数量或质量放到同一张关系图里。", output: "CAN MAKE / 长度比较 · 数量组合 · 天平平衡" },
    { id: "2", title: "VALIDATE / 反馈推进", copy: "正确状态给出短反馈，错误操作可以撤回，活动再进入下一步，而不是停在答案上。", output: "CAN MAKE / 几何证明 · 时钟挑战 · 教学游戏" }
  ];
  const updateToolMethod = (id) => {
    const method = toolMethods.find((item) => item.id === id) || toolMethods[0];
    $$(`[data-tool-method]`).forEach((item) => item.classList.toggle("is-current", item.dataset.toolMethod === method.id));
    $("[data-tool-title]").textContent = method.title;
    $("[data-tool-copy]").textContent = method.copy;
    $("[data-tool-output]").textContent = method.output;
  };
  $$(`[data-tool-step]`).forEach((control) => control.addEventListener("click", () => {
    const index = control.dataset.toolStep;
    $$(`[data-tool-step]`).forEach((item) => item.classList.toggle("is-current", item.dataset.toolStep === index));
    $(".tools-board")?.style.setProperty("--tool-progress", index / 2);
    updateToolMethod(index);
  }));
  $$(`[data-tool-method]`).forEach((control) => control.addEventListener("click", () => updateToolMethod(control.dataset.toolMethod)));
  updateToolMethod("0");
}

function initScrollScenes() {
  const revealItems = $$(`[data-reveal]`);
  if (state.reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("is-visible");
  }), { threshold: 0.16, rootMargin: "0px 0px -10%" });
  revealItems.forEach((item) => observer.observe(item));
}

function initChrome() {
  $("[data-menu]")?.addEventListener("click", () => state.menuOpen ? closeMenu() : openMenu());
  $$(`[data-close-menu]`).forEach((item) => item.addEventListener("click", closeMenu));
  $$(`[data-chapter]`).forEach((item) => item.addEventListener("click", (event) => {
    event.preventDefault();
    setChapter(item.dataset.chapter);
  }));
  $("[data-sound]")?.addEventListener("click", () => {
    state.soundOn = !state.soundOn;
    const button = $("[data-sound]");
    button.setAttribute("aria-pressed", String(state.soundOn));
    $("[data-sound-label]").textContent = state.soundOn ? "SOUND ON" : "SOUND OFF";
    document.body.classList.toggle("sound-on", state.soundOn);
  });
}

function init() {
  initIntro();
  initChrome();
  initMathDemo();
  initStoryboard();
  initTools();
  initScrollScenes();
  const initial = chapterIds.includes(window.location.hash.slice(1)) ? window.location.hash.slice(1) : "intro";
  setChapter(initial, { scroll: initial !== "intro" });
  window.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });
}

if (typeof document !== "undefined") init();
