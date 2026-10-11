const WORDS = [
  { word: 'woof', zh: '吠叫', phonetic: '/wʊf/', video: 'media/woof.mp4', mode: 'video', trimEnd: 1, tone: '#87b8d9' },
  { word: 'sound', zh: '声音', phonetic: '/saʊnd/', video: 'media/sound.mp4', mode: 'video', tone: '#79a997' },
  { word: 'dolphin', zh: '海豚', phonetic: '/ˈdɒlfɪn/', video: 'media/dolphin.mp4', mode: 'video', tone: '#6f9fba' },
  { word: 'year', zh: '年', phonetic: '/jɪə(r)/', video: 'media/year.mp4?v=800-cut-20260820', mode: 'video', tone: '#c8a979' },
  { word: 'pain', zh: '疼痛', phonetic: '/peɪn/', video: 'media/pain.mp4', mode: 'video', tone: '#df8069' },
  { word: 'zebra', zh: '斑马', phonetic: '/ˈzebrə/', video: 'media/zebra.mp4?v=800-cut-20260820', mode: 'video', tone: '#9b94ce' },
  { word: 'wolf', zh: '狼', phonetic: '/wʊlf/', video: 'media/wolf.mp4?v=800-cut-20260820', mode: 'video', tone: '#80a991' }
];

const PIPELINE_STAGES = [
  { id: 'stage-input', code: 'INPUT / 01', title: '素材输入', state: 'BATCH READY', description: '整批接收单词、图片、发音与制作参数，统一命名并建立任务映射，避免素材在多个工具之间手工搬运。', metrics: [['07', '任务'], ['09', '本地素材'], ['100%', '归档']] },
  { id: 'stage-generate', code: 'I2V / 02', title: '图生视频', state: 'AUTO RUN', description: '把图生视频能力封装成可重复调用的工具：选择素材后自动套用镜头参数、生成任务并回收结果。', metrics: [['01', '点击启动'], ['07', '已有成片'], ['00', '动态合成']] },
  { id: 'stage-caption', code: 'VOICE / 03', title: '语音字幕', state: 'SYNCED', description: '将发音、英文词与中文释义绑定到同一条时间轴，统一字幕安全区，并保持不同单词之间的呈现规则一致。', metrics: [['EN', '英文'], ['ZH', '中文'], ['SYNC', '音画']] },
  { id: 'stage-qc', code: 'REVIEW / 04', title: '预览质检', state: 'CHECKING', description: '在目标设备比例中直接预览生成结果，检查主体裁切、文字可读性、黑边、音频和首尾帧问题。', metrics: [['1:1', '设备预览'], ['06', '检查项'], ['PASS', '状态']] },
  { id: 'stage-trim', code: 'TRIM / 05', title: '视频裁剪', state: 'DELIVERY CUT', description: '根据最终交付目标重新确定入点、出点与画面焦点，将横向素材裁切为适合电话手表观看的设备版本。', metrics: [['IN', '入点'], ['OUT', '出点'], ['SAFE', '安全区']] },
  { id: 'stage-export', code: 'OUTPUT / 06', title: '规格交付', state: 'READY', description: '统一编码、尺寸、文件名与目录结构，批量导出可直接进入设备或下游系统的最终文件。', metrics: [['MP4', '格式'], ['H.264', '编码'], ['07/07', '完成']] }
];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const state = {
  wordIndex: 0,
  stageIndex: 0,
  sound: false,
  paused: false
};

const wordList = $('[data-word-list]');
const stageList = $('[data-stage-list]');
const video = $('[data-screen-video]');
const image = $('[data-screen-image]');
const audio = $('[data-word-audio]');
const watchScreen = $('[data-watch-screen]');

function renderWordList() {
  wordList.innerHTML = WORDS.map((item, index) => `
    <button type="button" role="option" aria-selected="${index === state.wordIndex}" data-word-index="${index}" style="--word-tone:${item.tone}">
      <span>${String(index + 1).padStart(2, '0')}</span>
      <strong>${item.word}</strong>
      <small>${item.zh}</small>
      <i>${item.mode === 'video' ? 'MP4' : 'MOTION'}</i>
    </button>
  `).join('');
}

function renderStageList() {
  stageList.innerHTML = PIPELINE_STAGES.map((item, index) => `
    <button type="button" role="tab" aria-selected="${index === state.stageIndex}" data-stage-index="${index}">
      <span>${String(index + 1).padStart(2, '0')}</span><strong>${item.title}</strong><i></i>
    </button>
  `).join('');
}

function renderStageDetail() {
  const item = PIPELINE_STAGES[state.stageIndex];
  $('[data-stage-code]').textContent = item.code;
  $('[data-stage-state]').textContent = item.state;
  $('[data-stage-title]').textContent = item.title;
  $('[data-stage-description]').textContent = item.description;
  $('[data-stage-metrics]').innerHTML = item.metrics.map(([value, label]) => `<div><dt>${value}</dt><dd>${label}</dd></div>`).join('');
  $('[data-stage-detail]').style.setProperty('--stage-progress', `${((state.stageIndex + 1) / PIPELINE_STAGES.length) * 100}%`);
}

function stopMedia() {
  video.pause();
  video.removeAttribute('src');
  video.load();
  audio.pause();
  audio.removeAttribute('src');
  image.removeAttribute('src');
}

function updateMedia(item, shouldPlay = true) {
  stopMedia();
  watchScreen.dataset.mediaMode = item.mode;
  watchScreen.style.setProperty('--word-tone', item.tone);
  state.paused = false;
  $('[data-pause-indicator]').textContent = 'Ⅱ';

  if (item.video) {
    video.src = item.video;
    video.muted = !state.sound;
    video.loop = !item.trimEnd;
    video.hidden = false;
    image.hidden = true;
    if (shouldPlay) video.play().catch(() => {});
  } else {
    image.src = item.image;
    image.alt = `${item.word}：${item.zh}单词场景图`;
    image.hidden = false;
    video.hidden = true;
    if (item.audio) audio.src = item.audio;
    if (shouldPlay && state.sound && item.audio) audio.play().catch(() => {});
  }
}

function selectWord(index, options = {}) {
  state.wordIndex = (index + WORDS.length) % WORDS.length;
  const item = WORDS[state.wordIndex];
  $$('[data-word-index]').forEach((button, itemIndex) => {
    const active = itemIndex === state.wordIndex;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', String(active));
  });
  $('[data-screen-word]').textContent = item.word;
  $('[data-screen-phonetic]').textContent = item.phonetic;
  $('[data-screen-zh]').textContent = item.zh;
  $('[data-caption-word]').textContent = item.word.toUpperCase();
  $('[data-caption-zh]').textContent = item.zh;
  $('[data-screen-counter]').textContent = `${String(state.wordIndex + 1).padStart(2, '0')} / ${String(WORDS.length).padStart(2, '0')}`;
  $('[data-screen-status]').textContent = item.mode === 'video' ? 'VIDEO OUTPUT' : 'LIVE MOTION';
  watchScreen.classList.remove('is-switching');
  void watchScreen.offsetWidth;
  watchScreen.classList.add('is-switching');
  updateMedia(item, options.play !== false);
}

function selectStage(index) {
  state.stageIndex = (index + PIPELINE_STAGES.length) % PIPELINE_STAGES.length;
  $$('[data-stage-index]').forEach((button, itemIndex) => {
    const active = itemIndex === state.stageIndex;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', String(active));
  });
  $$('[data-pipeline-index]').forEach((node, itemIndex) => node.classList.toggle('is-active', itemIndex <= state.stageIndex));
  renderStageDetail();
}

function renderPipeline() {
  $('[data-pipeline-track]').innerHTML = PIPELINE_STAGES.map((item, index) => `
    <button type="button" data-pipeline-index="${index}" aria-label="查看${item.title}阶段">
      <span>${String(index + 1).padStart(2, '0')}</span><i></i><strong>${item.title}</strong><small>${item.code.split(' / ')[0]}</small>
    </button>
  `).join('');
}

function togglePlayback() {
  state.paused = !state.paused;
  const item = WORDS[state.wordIndex];
  if (item.video) {
    if (state.paused) video.pause();
    else video.play().catch(() => {});
  } else {
    image.classList.toggle('is-paused', state.paused);
    if (!state.paused && state.sound && item.audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }
  watchScreen.classList.toggle('is-paused', state.paused);
  $('[data-pause-indicator]').textContent = state.paused ? '▶' : 'Ⅱ';
}

function toggleSound() {
  state.sound = !state.sound;
  const button = $('[data-sound-toggle]');
  button.setAttribute('aria-pressed', String(state.sound));
  $('b', button).textContent = state.sound ? 'ON' : 'OFF';
  video.muted = !state.sound;
  const item = WORDS[state.wordIndex];
  if (state.sound && item.audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
}

function setScaleMode(mode) {
  document.documentElement.setAttribute('data-scale-mode', mode);
  $$('[data-scale-toggle]').forEach((button) => button.classList.toggle('is-active', button.dataset.scaleToggle === mode));
  $('[data-scale-note]').textContent = mode === 'physical'
    ? '约 1:1 实物尺寸 · 实际显示受屏幕 DPI 影响'
    : '演示放大模式 · 便于查看表盘内容';
}

function setupPointerGlow() {
  if (reducedMotion) return;
  $('[data-device-stage]').addEventListener('pointermove', (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
  });
}

function setupInteractions() {
  wordList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-word-index]');
    if (button) selectWord(Number(button.dataset.wordIndex));
  });
  stageList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-stage-index]');
    if (button) selectStage(Number(button.dataset.stageIndex));
  });
  $('[data-pipeline-track]').addEventListener('click', (event) => {
    const button = event.target.closest('[data-pipeline-index]');
    if (button) selectStage(Number(button.dataset.pipelineIndex));
  });
  $$('[data-scale-toggle]').forEach((button) => button.addEventListener('click', () => setScaleMode(button.dataset.scaleToggle)));
  $('[data-prev-word]').addEventListener('click', () => selectWord(state.wordIndex - 1));
  $('[data-next-word]').addEventListener('click', () => selectWord(state.wordIndex + 1));
  $('[data-sound-toggle]').addEventListener('click', toggleSound);
  watchScreen.addEventListener('click', togglePlayback);
  video.addEventListener('timeupdate', () => {
    const item = WORDS[state.wordIndex];
    if (!item?.trimEnd || !Number.isFinite(video.duration)) return;
    if (video.currentTime >= Math.max(0, video.duration - item.trimEnd)) {
      video.currentTime = 0;
      if (!state.paused) video.play().catch(() => {});
    }
  });
  video.addEventListener('ended', () => video.play().catch(() => {}));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') selectWord(state.wordIndex - 1);
    if (event.key === 'ArrowRight') selectWord(state.wordIndex + 1);
  });
}

function setupClock() {
  const render = () => {
    const now = new Date();
    $('[data-clock]').textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };
  render();
  window.setInterval(render, 30000);
}

renderWordList();
renderStageList();
renderPipeline();
setupInteractions();
setupPointerGlow();
setupClock();
selectWord(0, { play: !reducedMotion });
selectStage(0);
setScaleMode('presentation');
requestAnimationFrame(() => document.body.classList.add('is-ready'));
