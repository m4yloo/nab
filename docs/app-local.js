/* nab — frontend logic with local video processing
   - Local FFmpeg processing via API
   - Theme toggle
   - Settings persistence
*/

console.log('app-local.js loaded');

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

// ---------------- theme ----------------
const root = document.documentElement;
function applyTheme(t) {
  root.dataset.theme = t;
  localStorage.setItem('nab.theme', t);
}

// Initialize theme on load
const savedTheme = localStorage.getItem('nab.theme');
const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

$('#theme-btn').onclick = () => {
  const t = root.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(t);
};

// header scroll glass
addEventListener('scroll', () => {
  document.querySelector('header').classList.toggle('scrolled', scrollY > 4);
}, { passive: true });

// ---------------- toast ----------------
const toast = $('#toast');
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  requestAnimationFrame(() => toast.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.hidden = true, 250);
  }, 1800);
}

// ---------------- elements ----------------
const form     = $('#form');
const urlInput = $('#url');
const clearBtn = $('#clear-btn');
const pasteBtn = $('#paste-btn');
const goBtn    = $('#go-btn');
const goLabel  = $('.go-label', goBtn);
const versionPill  = $('#version-pill');
const settingsBtn = $('#settings-btn');
const settingsModal = $('#settings-modal');
const settingsCloseBackdrop = $('#settings-close-backdrop');
const settingsCloseBtn = $('#settings-close-btn');
const settingsSaveBtn = $('#settings-save-btn');
const settingsResetBtn = $('#settings-reset-btn');
const settingDefaultMode = $('#setting-default-mode');
const settingDefaultQuality = $('#setting-default-quality');
const settingDefaultAudio = $('#setting-default-audio');
const settingInstance = $('#setting-instance');
const settingCustomInstance = $('#setting-custom-instance');
const customInstanceRow = $('#custom-instance-row');
const settingAutopaste = $('#setting-autopaste');
const settingForcedTunnel = $('#setting-forced-tunnel');
const settingAutoMuteTwitter = $('#setting-auto-mute-twitter');

// ---------------- state ----------------
let mode = 'auto';
let isProcessing = false;

// segmented mode
$$('.seg-btn').forEach(b => b.onclick = () => {
  if (isProcessing) return;
  $$('.seg-btn').forEach(x => x.setAttribute('aria-pressed','false'));
  b.setAttribute('aria-pressed','true');
  mode = b.dataset.mode;
});
function setMode(nextMode) {
  const selected = ['auto', 'mute', 'audio'].includes(nextMode) ? nextMode : 'auto';
  mode = selected;
  $$('.seg-btn').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.mode === selected)));
}

urlInput.addEventListener('input', () => {
  clearBtn.hidden = !urlInput.value;
});
clearBtn.onclick = () => { urlInput.value = ''; clearBtn.hidden = true; urlInput.focus(); };
pasteBtn.onclick = async () => {
  try {
    const t = (await navigator.clipboard.readText()).trim();
    if (t) { urlInput.value = t; clearBtn.hidden = false; urlInput.focus(); }
  } catch { showToast('clipboard blocked — paste manually'); }
};

// keyboard shortcuts
urlInput.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    urlInput.value = '';
    clearBtn.hidden = true;
  }
});
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'v' && document.activeElement !== urlInput) {
      e.preventDefault();
      pasteBtn.onclick();
    }
    if (e.key === 'k') {
      e.preventDefault();
      urlInput.focus();
    }
  }
  if (k === 'escape' && document.activeElement === urlInput) { urlInput.value = ''; clearBtn.hidden = true; }
});

// ---------------- API Integration ----------------
function setButtonProcessing(processing) {
  isProcessing = processing;
  goBtn.disabled = processing;
  goBtn.classList.toggle('loading', processing);
  $('.go-spin', goBtn).hidden = !processing;
  form.classList.toggle('busy', processing);
  if (processing) {
    goLabel.textContent = 'processing...';
  } else {
    goLabel.textContent = 'save';
  }
}

function getDetailedError(error) {
  const errorMap = {
    'FFMPEG_NOT_AVAILABLE': {
      title: 'FFmpeg not available',
      message: 'FFmpeg is not installed on the server. Please install FFmpeg to enable video processing.',
    },
    'PROCESSING_FAILED': {
      title: 'Processing failed',
      message: 'The video could not be processed. Please try again with a different video or settings.',
    },
    'NO_VIDEO_FILE': {
      title: 'No video file',
      message: 'No video file was provided for processing.',
    },
  };

  // Check if error is a known error code
  if (error.code && errorMap[error.code]) {
    return errorMap[error.code];
  }

  // Default error
  return {
    title: 'Processing failed',
    message: error.message || 'An unknown error occurred. Please try again.',
  };
}

function showError(error) {
  const detailed = getDetailedError(error);
  hideProcessModal();
  alert(`${detailed.title}: ${detailed.message}`);
}

// ---------------- Processing Modal ----------------
let currentDownload = null;

function showProcessModal() {
  const modal = $('#process-modal');
  const barFill = $('#process-bar-fill');
  const barMeta = $('#process-bar-meta');
  const status = $('#process-status');
  const title = $('#process-title');
  const spinner = $('#process-spinner');
  const successIcon = $('#process-success');
  const cancelBtn = $('#process-cancel-btn');
  const location = $('#process-location');

  // Reset steps
  $$('.step').forEach(s => s.classList.remove('active', 'done'));
  $('#step-fetch').classList.add('active');

  // Reset UI state
  modal.hidden = false;
  title.textContent = 'processing';
  barFill.style.width = '0%';
  barMeta.textContent = '0%';
  status.textContent = 'getting download link…';
  spinner.hidden = false;
  successIcon.hidden = true;
  cancelBtn.textContent = 'cancel';

  // Set processing location
  location.textContent = 'processing locally';

  // Cancel button
  cancelBtn.onclick = () => {
    if (currentDownload) {
      currentDownload.abort();
    }
    hideProcessModal();
    setButtonProcessing(false);
  };
}

function updateProcessStep(step, percent, statusText) {
  const barFill = $('#process-bar-fill');
  const barMeta = $('#process-bar-meta');
  const status = $('#process-status');

  // Update step indicators
  const steps = ['step-fetch', 'step-download', 'step-done'];
  const stepIndex = steps.indexOf(step);

  steps.forEach((s, i) => {
    const stepEl = $(`#${s}`);
    stepEl.classList.remove('active', 'done');
    if (i < stepIndex) stepEl.classList.add('done');
    if (i === stepIndex) stepEl.classList.add('active');
  });

  if (percent !== undefined) {
    barFill.style.width = `${percent}%`;
    barMeta.textContent = `${Math.round(percent)}%`;
  }
  if (statusText) status.textContent = statusText;
}

function hideProcessModal() {
  $('#process-modal').hidden = true;
}

function showProcessComplete(filename, blob) {
  const title = $('#process-title');
  const status = $('#process-status');
  const barFill = $('#process-bar-fill');
  const barMeta = $('#process-bar-meta');
  const spinner = $('#process-spinner');
  const successIcon = $('#process-success');

  title.textContent = 'done';
  status.textContent = filename;
  barFill.style.width = '100%';
  barMeta.textContent = '100%';
  spinner.hidden = true;
  successIcon.hidden = false;

  // Mark all steps as done
  $$('.step').forEach(s => s.classList.remove('active', 'done'));
  $('#step-done').classList.add('done');

  // Change cancel to continue
  const cancelBtn = $('#process-cancel-btn');
  cancelBtn.textContent = 'continue';
  cancelBtn.onclick = () => {
    hideProcessModal();
    showSuccessScreen(filename, blob);
  };

  // Auto-show success screen after 1.5 seconds
  setTimeout(() => {
    if (!$('#process-modal').hidden) {
      hideProcessModal();
      showSuccessScreen(filename, blob);
    }
  }, 1500);
}

function showSuccessScreen(filename, blob) {
  const modal = $('#success-modal');
  const filenameEl = $('#success-filename');
  const openBtn = $('#success-open-btn');
  const againBtn = $('#success-again-btn');

  filenameEl.textContent = filename;
  modal.hidden = false;

  openBtn.onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    hideSuccessScreen();
  };

  againBtn.onclick = () => {
    hideSuccessScreen();
    urlInput.focus();
  };
}

function hideSuccessScreen() {
  $('#success-modal').hidden = true;
}

// ---------------- Main Processing Function ----------------
async function handleSave() {
  const url = urlInput.value.trim();
  if (!url) {
    showToast('please paste a link');
    return;
  }

  const effectiveMode = mode;
  const quality = $('#quality').value;
  const audioFormat = $('#audio-format').value;

  setButtonProcessing(true);
  showProcessModal();

  const abortController = new AbortController();
  currentDownload = {
    abort: () => abortController.abort(),
    signal: abortController.signal,
  };

  try {
    // Step 1: Fetch from Cobalt API
    updateProcessStep('step-fetch', 10, 'getting download link…');

    const cobaltResponse = await fetch('https://cobalt-api-production-f5b2.up.railway.app/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        videoQuality: quality,
        downloadMode: effectiveMode === 'audio' ? 'audio' : effectiveMode === 'mute' ? 'mute' : 'auto',
        youtubeVideoCodec: 'h264',
      }),
      signal: abortController.signal,
    });

    if (!cobaltResponse.ok) {
      throw new Error(`API error: ${cobaltResponse.status}`);
    }

    const cobaltData = await cobaltResponse.json();

    if (cobaltData.status === 'error') {
      throw new Error(cobaltData.error?.msg || 'download failed');
    }

    if (cobaltData.status !== 'tunnel' && cobaltData.status !== 'redirect') {
      throw new Error('unexpected response');
    }

    // Step 2: Download the raw video
    updateProcessStep('step-download', 25, 'downloading raw video…');

    const videoResponse = await fetch(cobaltData.url, {
      signal: abortController.signal,
    });

    if (!videoResponse.ok) {
      throw new Error(`download error: ${videoResponse.status}`);
    }

    // Stream download with progress
    const contentLength = parseInt(videoResponse.headers.get('content-length') || '0');
    const reader = videoResponse.body.getReader();
    const chunks = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      received += value.length;

      if (contentLength > 0) {
        const percent = 25 + (received / contentLength) * 35;
        updateProcessStep('step-download', percent, `downloading… ${formatSize(received)} / ${formatSize(contentLength)}`);
      }
    }

    // Step 3: Process the video locally
    updateProcessStep('step-done', 65, 'processing video…');

    const videoBlob = new Blob(chunks, { type: 'video/mp4' });
    const formData = new FormData();
    formData.append('video', videoBlob, 'raw_video.mp4');
    formData.append('quality', quality);
    formData.append('mode', effectiveMode);
    formData.append('audioFormat', audioFormat);

    const processResponse = await fetch('/api/process', {
      method: 'POST',
      body: formData,
      signal: abortController.signal,
    });

    if (!processResponse.ok) {
      const errorData = await processResponse.json();
      throw new Error(errorData.error || 'Processing failed');
    }

    updateProcessStep('step-done', 95, 'finalizing…');

    // Get the processed video
    const processedBlob = await processResponse.blob();
    const ext = effectiveMode === 'audio' ? audioFormat : 'mp4';
    const filename = cobaltData.filename || `processed_video.${ext}`;

    // Trigger download
    const a = document.createElement('a');
    a.href = URL.createObjectURL(processedBlob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    showProcessComplete(filename, processedBlob);
    showToast('saved: ' + filename);

    // Cleanup blob URL after a minute
    setTimeout(() => URL.revokeObjectURL(a.href), 60000);

  } catch (error) {
    if (error.name === 'AbortError') {
      showToast('cancelled');
    } else {
      showError(error);
      console.error(error);
    }
  } finally {
    setButtonProcessing(false);
    currentDownload = null;
  }
}

function formatSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
}

// Form submission
form.addEventListener('submit', e => {
  e.preventDefault();
  handleSave();
});

// ---------------- Settings ----------------
const RECENT_KEY = 'nab.recent';
const SETTINGS_KEY = 'nab.settings';
const DEFAULT_SETTINGS = {
  defaultMode: 'auto',
  defaultQuality: '720',
  defaultAudio: 'mp3',
  instance: 'default',
  customInstance: '',
  autoPasteOnLoad: false,
  forcedTunnel: false,
  autoMuteTwitter: false,
};

function loadSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return { ...DEFAULT_SETTINGS, ...raw };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

function applySettings(s) {
  setMode(s.defaultMode);
  $('#quality').value = s.defaultQuality;
  $('#audio-format').value = s.defaultAudio;
}

// Settings modal
settingsBtn.onclick = () => settingsModal.hidden = false;
settingsCloseBtn.onclick = () => settingsModal.hidden = true;
settingsCloseBackdrop.onclick = () => settingsModal.hidden = true;

settingsSaveBtn.onclick = () => {
  const newSettings = {
    defaultMode: settingDefaultMode.value,
    defaultQuality: settingDefaultQuality.value,
    defaultAudio: settingDefaultAudio.value,
    instance: settingInstance.value,
    customInstance: settingCustomInstance.value,
    autoPasteOnLoad: settingAutopaste.checked,
    forcedTunnel: settingForcedTunnel.checked,
    autoMuteTwitter: settingAutoMuteTwitter.checked,
  };
  saveSettings(newSettings);
  applySettings(newSettings);
  settingsModal.hidden = true;
  showToast('settings saved');
};

settingsResetBtn.onclick = () => {
  saveSettings(DEFAULT_SETTINGS);
  applySettings(DEFAULT_SETTINGS);
  settingsModal.hidden = true;
  showToast('settings reset');
};

// Initialize settings on load
const SETTINGS = loadSettings();
applySettings(SETTINGS);

// Auto-paste on load
if (SETTINGS.autoPasteOnLoad) {
  pasteBtn.onclick();
}
