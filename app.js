const $ = (selector) => document.querySelector(selector);

const ui = {
  timer: $("#timer"), digits: $("#digits"), progress: $("#progress"), statusText: $("#statusText"),
  durationValue: $("#durationValue"), minus: $("#minus"), plus: $("#plus"), start: $("#start"),
  startText: $("#startText"), reset: $("#reset"), sound: $("#soundToggle"), light: $("#lightToggle"),
  soundState: $("#soundState"), lightState: $("#lightState"), timesUp: $("#timesUp"), again: $("#again")
};

const state = {
  duration: Number(localStorage.getItem("set30-duration")) || 30,
  remaining: 30,
  running: false,
  endAt: 0,
  raf: 0,
  lastShown: null,
  nextBeepAt: 0,
  sound: localStorage.getItem("set30-sound") !== "false",
  light: localStorage.getItem("set30-light") !== "false",
  audio: null,
  wakeLock: null
};
state.duration = Math.min(300, Math.max(5, state.duration));
state.remaining = state.duration;

function phaseFor(seconds) {
  if (seconds <= 5) return "red";
  if (seconds <= 10) return "yellow";
  if (seconds <= 15) return "green";
  return "active";
}

function beepRate(seconds) {
  if (seconds <= 5) return 250;
  if (seconds <= 10) return 500;
  return 1000;
}

function ensureAudio() {
  if (!state.sound) return;
  state.audio ||= new (window.AudioContext || window.webkitAudioContext)();
  if (state.audio.state === "suspended") state.audio.resume();
}

function beep(long = false) {
  if (!state.sound || !state.audio) return;
  const now = state.audio.currentTime;
  const oscillator = state.audio.createOscillator();
  const gain = state.audio.createGain();
  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(long ? 880 : 720, now);
  if (long) oscillator.frequency.exponentialRampToValueAtTime(440, now + .5);
  gain.gain.setValueAtTime(.0001, now);
  gain.gain.exponentialRampToValueAtTime(.12, now + .008);
  gain.gain.exponentialRampToValueAtTime(.0001, now + (long ? .65 : .075));
  oscillator.connect(gain).connect(state.audio.destination);
  oscillator.start(now);
  oscillator.stop(now + (long ? .7 : .09));
}

async function requestWakeLock() {
  try { if ("wakeLock" in navigator) state.wakeLock = await navigator.wakeLock.request("screen"); } catch (_) {}
}

function releaseWakeLock() {
  state.wakeLock?.release().catch(() => {});
  state.wakeLock = null;
}

function paintFlash(now, seconds) {
  if (!state.light || seconds > 15) {
    ui.timer.classList.remove("is-flash");
    return;
  }
  const rate = beepRate(seconds);
  ui.timer.classList.toggle("is-flash", now % rate < Math.min(160, rate * .35));
}

function render(seconds = state.remaining) {
  const shown = Math.max(0, Math.ceil(seconds));
  const phase = state.running ? phaseFor(shown) : "idle";
  ui.digits.value = String(shown).padStart(shown < 10 ? 2 : 1, "0");
  ui.digits.setAttribute("aria-label", `${shown} detik`);
  ui.progress.style.transform = `scaleY(${Math.max(0, seconds / state.duration)})`;
  ui.timer.dataset.phase = phase;
  ui.timer.classList.toggle("is-running", state.running);
  ui.timer.classList.toggle("alert-on", state.light);
  ui.statusText.textContent = state.running ? (shown <= 5 ? "FINISH" : shown <= 15 ? "PUSH" : "BERJALAN") : "SIAP";
  ui.startText.textContent = state.running ? "JEDA" : seconds < state.duration && seconds > 0 ? "LANJUT" : "MULAI";
  ui.durationValue.textContent = state.duration;
  ui.minus.disabled = state.running;
  ui.plus.disabled = state.running;
}

function tick(now) {
  if (!state.running) return;
  state.remaining = Math.max(0, (state.endAt - performance.now()) / 1000);
  const shown = Math.ceil(state.remaining);
  render(state.remaining);
  paintFlash(now, shown);

  if (shown <= 15 && state.remaining > 0 && now >= state.nextBeepAt) {
    beep();
    state.nextBeepAt = now + beepRate(shown);
  }
  if (state.remaining <= 0) return finish();
  state.raf = requestAnimationFrame(tick);
}

function start() {
  ensureAudio();
  state.running = true;
  state.endAt = performance.now() + state.remaining * 1000;
  state.nextBeepAt = performance.now();
  requestWakeLock();
  render();
  state.raf = requestAnimationFrame(tick);
}

function pause() {
  state.running = false;
  cancelAnimationFrame(state.raf);
  releaseWakeLock();
  ui.timer.classList.remove("is-flash");
  render();
}

function reset() {
  pause();
  state.remaining = state.duration;
  state.lastShown = null;
  if (ui.timesUp.classList.contains("is-visible")) ui.start.focus();
  ui.timesUp.classList.remove("is-visible");
  ui.timesUp.hidden = true;
  render();
}

function finish() {
  state.running = false;
  releaseWakeLock();
  beep(true);
  if ("vibrate" in navigator) navigator.vibrate([180, 100, 500]);
  ui.timer.classList.remove("is-flash", "is-running");
  ui.timesUp.hidden = false;
  ui.timesUp.classList.add("is-visible");
  ui.again.focus();
}

function changeDuration(amount) {
  state.duration = Math.min(300, Math.max(5, state.duration + amount));
  state.remaining = state.duration;
  localStorage.setItem("set30-duration", state.duration);
  render();
}

function updateToggle(button, label, key, enabled) {
  button.classList.toggle("is-on", enabled);
  button.setAttribute("aria-pressed", String(enabled));
  label.textContent = enabled ? "NYALA" : "MATI";
  localStorage.setItem(key, String(enabled));
}

ui.start.addEventListener("click", () => state.running ? pause() : start());
ui.reset.addEventListener("click", reset);
ui.minus.addEventListener("click", () => changeDuration(-5));
ui.plus.addEventListener("click", () => changeDuration(5));
ui.again.addEventListener("click", reset);
ui.sound.addEventListener("click", () => {
  state.sound = !state.sound;
  if (state.sound) { ensureAudio(); beep(); }
  updateToggle(ui.sound, ui.soundState, "set30-sound", state.sound);
});
ui.light.addEventListener("click", () => {
  state.light = !state.light;
  ui.timer.classList.toggle("alert-on", state.light);
  if (!state.light) ui.timer.classList.remove("is-flash");
  updateToggle(ui.light, ui.lightState, "set30-light", state.light);
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && state.running) requestWakeLock();
});

updateToggle(ui.sound, ui.soundState, "set30-sound", state.sound);
updateToggle(ui.light, ui.lightState, "set30-light", state.light);
render();
