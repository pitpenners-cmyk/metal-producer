const lanes = [
  { key: 'kick', label: 'Kick' },
  { key: 'snare', label: 'Snare' },
  { key: 'hat', label: 'Hi-Hat' },
  { key: 'bass', label: 'Bass' },
  { key: 'lead', label: 'Lead' },
];

const stepCount = 16;
const genrePatterns = {
  'nu-metal': {
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    bass: [1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1],
    lead: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
  },
  metalcore: {
    kick: [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    bass: [1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1],
    lead: [0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0],
  },
  'rap-rock': {
    kick: [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0],
    bass: [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1],
    lead: [0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0],
  },
  industrial: {
    kick: [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    hat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    bass: [1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1],
    lead: [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0],
  },
};

const state = {
  tempo: 140,
  volume: 0.82,
  drive: 0.68,
  activeGenre: 'nu-metal',
  playing: false,
  currentStep: 0,
  intervalId: null,
  audioContext: null,
  masterGain: null,
};

const elements = {
  tempoSlider: document.getElementById('tempo-slider'),
  tempoValue: document.getElementById('tempo-value'),
  volumeSlider: document.getElementById('volume-slider'),
  volumeValue: document.getElementById('volume-value'),
  driveSlider: document.getElementById('drive-slider'),
  driveValue: document.getElementById('drive-value'),
  playBtn: document.getElementById('play-btn'),
  stopBtn: document.getElementById('stop-btn'),
  randomizeBtn: document.getElementById('randomize-btn'),
  sequencer: document.getElementById('sequencer'),
  genreButtons: [...document.querySelectorAll('.genre')],
};

function getPattern() {
  return genrePatterns[state.activeGenre];
}

function initPatternState() {
  const pattern = getPattern();
  Object.keys(pattern).forEach((laneKey) => {
    pattern[laneKey] = [...pattern[laneKey]];
  });
}

function renderSequencer() {
  const pattern = getPattern();
  const rowLabels = lanes.map((lane) => 
    `<div class="step-label">${lane.label}</div>`
  ).join('');

  const headers = Array.from({ length: stepCount }, (_, index) => 
    `<div class="step-header">${index + 1}</div>`
  ).join('');

  const rows = lanes.map((lane) => {
    const cells = pattern[lane.key].map((value, stepIndex) => {
      const active = value ? 'active' : '';
      const playhead = stepIndex === state.currentStep && state.playing ? 'playhead' : '';
      return `<button class="step ${active} ${playhead}" data-lane="${lane.key}" data-step="${stepIndex}" aria-label="${lane.label} step ${stepIndex + 1}"></button>`;
    }).join('');
    return `${rowLabelsOnly(lane.label)}${cells}`;
  }).join('');

  elements.sequencer.innerHTML = `${rowLabels}${headers}${rows}`;
  attachStepEvents();
}

function rowLabelsOnly(label) {
  return `<div class="step-label">${label}</div>`;
}

function attachStepEvents() {
  document.querySelectorAll('.step').forEach((button) => {
    button.addEventListener('click', () => {
      const lane = button.dataset.lane;
      const step = Number(button.dataset.step);
      const pattern = getPattern();
      pattern[lane][step] = pattern[lane][step] ? 0 : 1;
      button.classList.toggle('active', !!pattern[lane][step]);
    });
  });
}

function updateLabels() {
  elements.tempoValue.textContent = `${state.tempo} BPM`;
  elements.volumeValue.textContent = `${state.volume * 100 | 0}%`;
  elements.driveValue.textContent = `${state.drive * 100 | 0}%`;
}

function getAudioContext() {
  if (!state.audioContext) {
    state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    state.masterGain = state.audioContext.createGain();
    state.masterGain.gain.value = state.volume;
    state.masterGain.connect(state.audioContext.destination);
  }
  return state.audioContext;
}

function sleepTime(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function triggerKick(context, time) {
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(55, time);
  osc.frequency.exponentialRampToValueAtTime(28, time + 0.12);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.8 * state.volume, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
  osc.connect(gain);
  gain.connect(state.masterGain);
  osc.start(time);
  osc.stop(time + 0.16);
}

function triggerSnare(context, time) {
  const noiseBuffer = context.createBuffer(1, context.sampleRate * 0.18, context.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * 0.7;
  }

  const noise = context.createBufferSource();
  noise.buffer = noiseBuffer;

  const filter = context.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1800;

  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.35 * state.volume, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(state.masterGain);
  noise.start(time);
  noise.stop(time + 0.15);
}

function triggerHat(context, time) {
  const noiseBuffer = context.createBuffer(1, context.sampleRate * 0.08, context.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * 0.35;
  }

  const noise = context.createBufferSource();
  noise.buffer = noiseBuffer;

  const filter = context.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 7000;

  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.18 * state.volume, time + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(state.masterGain);
  noise.start(time);
  noise.stop(time + 0.05);
}

function triggerBass(context, time) {
  const note = 55;
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = 'sawtooth';
  osc.frequency.value = note;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.38 * state.volume, time + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);

  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 260 + state.drive * 300;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(state.masterGain);
  osc.start(time);
  osc.stop(time + 0.2);
}

function triggerLead(context, time) {
  const frequencies = [220, 277, 330, 392];
  const osc = context.createOscillator();
  const gain = context.createGain();
  const index = Math.floor(Math.random() * frequencies.length);
  osc.type = 'square';
  osc.frequency.value = frequencies[index];
  osc.detune.value = (Math.random() - 0.5) * 12;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.18 * state.volume, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.24);

  const filter = context.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1150 + state.drive * 1000;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(state.masterGain);
  osc.start(time);
  osc.stop(time + 0.25);
}

function fireStep() {
  const context = getAudioContext();
  const time = context.currentTime + 0.02;
  const pattern = getPattern();

  if (pattern.kick[state.currentStep]) triggerKick(context, time);
  if (pattern.snare[state.currentStep]) triggerSnare(context, time);
  if (pattern.hat[state.currentStep]) triggerHat(context, time);
  if (pattern.bass[state.currentStep]) triggerBass(context, time);
  if (pattern.lead[state.currentStep]) triggerLead(context, time);

  state.currentStep = (state.currentStep + 1) % stepCount;
  renderSequencer();
}

function startPlayback() {
  const context = getAudioContext();
  if (context.state === 'suspended') {
    context.resume();
  }

  state.playing = true;
  if (state.intervalId) {
    clearInterval(state.intervalId);
  }

  const intervalMs = (60 / state.tempo) * 1000 / 4;
  state.intervalId = setInterval(fireStep, intervalMs);
  elements.playBtn.textContent = 'Playing';
  renderSequencer();
}

function stopPlayback() {
  state.playing = false;
  clearInterval(state.intervalId);
  state.intervalId = null;
  elements.playBtn.textContent = 'Play';
  state.currentStep = 0;
  renderSequencer();
}

function randomizePattern() {
  const pattern = getPattern();
  Object.keys(pattern).forEach((laneKey) => {
    pattern[laneKey] = Array.from({ length: stepCount }, () => Math.random() > 0.68 ? 1 : 0);
  });
  renderSequencer();
}

function bindControls() {
  elements.tempoSlider.addEventListener('input', (event) => {
    state.tempo = Number(event.target.value);
    updateLabels();
    if (state.playing) {
      startPlayback();
    }
  });

  elements.volumeSlider.addEventListener('input', (event) => {
    state.volume = Number(event.target.value) / 100;
    if (state.masterGain) {
      state.masterGain.gain.value = state.volume;
    }
    updateLabels();
  });

  elements.driveSlider.addEventListener('input', (event) => {
    state.drive = Number(event.target.value) / 100;
    updateLabels();
  });

  elements.playBtn.addEventListener('click', startPlayback);
  elements.stopBtn.addEventListener('click', stopPlayback);
  elements.randomizeBtn.addEventListener('click', randomizePattern);

  elements.genreButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.activeGenre = button.dataset.genre;
      elements.genreButtons.forEach((btn) => btn.classList.toggle('selected', btn === button));
      initPatternState();
      renderSequencer();
    });
  });
}

function bootstrap() {
  initPatternState();
  updateLabels();
  renderSequencer();
  bindControls();
}

bootstrap();
