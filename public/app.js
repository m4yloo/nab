/* nab — frontend logic
   - Direct Cobalt API integration
   - Theme toggle
   - Settings persistence
*/

console.log('app.js loaded');

const COBALT_API = '/api/cobalt';

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
addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if ((e.metaKey || e.ctrlKey) && k === 'k') { e.preventDefault(); urlInput.focus(); urlInput.select(); }
  if (k === 'escape' && document.activeElement === urlInput) { urlInput.value = ''; clearBtn.hidden = true; }
});

// Fake download shortcut: Shift + F + G (for testing without spending credits)
let shiftFPressed = false;
addEventListener('keydown', e => {
  if (e.shiftKey && e.key.toLowerCase() === 'f') {
    shiftFPressed = true;
    setTimeout(() => shiftFPressed = false, 1000);
  }
  if (shiftFPressed && e.key.toLowerCase() === 'g') {
    e.preventDefault();
    triggerFakeDownload();
  }
});

function triggerFakeDownload() {
  const url = urlInput.value.trim() || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

  setButtonProcessing(true);
  showProcessModal();

  let progress = 0;
  const steps = [
    { step: 'step-fetch', percent: 10, msg: 'getting download link…', delay: 800 },
    { step: 'step-download', percent: 30, msg: 'downloading file…', delay: 600 },
    { step: 'step-download', percent: 55, msg: 'downloading… 2.4 MB / 4.2 MB', delay: 800 },
    { step: 'step-download', percent: 80, msg: 'downloading… 3.8 MB / 4.2 MB', delay: 600 },
    { step: 'step-done', percent: 95, msg: 'saving…', delay: 400 },
  ];

  let stepIndex = 0;
  function runStep() {
    if (stepIndex >= steps.length) {
      // Complete
      const ext = mode === 'audio' ? 'mp3' : 'mp4';
      const filename = `demo_video_720p_h264.${ext}`;
      const fakeBlob = new Blob(['fake'], { type: mode === 'audio' ? 'audio/mp3' : 'video/mp4' });
      showProcessComplete(filename, fakeBlob);
      setButtonProcessing(false);
      return;
    }

    const s = steps[stepIndex];
    updateProcessStep(s.step, s.percent, s.msg);
    stepIndex++;
    setTimeout(runStep, s.delay);
  }

  runStep();
}
addEventListener('paste', e => {
  if (document.activeElement === urlInput) return;
  const t = (e.clipboardData || window.clipboardData).getData('text');
  if (/^https?:\/\//i.test(t)) {
    urlInput.value = t.trim();
    clearBtn.hidden = false;
    handleSave();
  }
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

// Error message mapping
function getDetailedError(error) {
  const errorMap = {
    'error.api.youtube.disabled': {
      title: 'YouTube disabled',
      message: 'This cobalt instance has YouTube downloads disabled. Try switching to a different instance in settings.',
    },
    'error.api.rate_limit': {
      title: 'Rate limited',
      message: 'You\'ve made too many requests. Please wait a moment before trying again.',
    },
    'error.api.invalid_url': {
      title: 'Invalid URL',
      message: 'The URL you provided is not supported. Please check the link and try again.',
    },
    'error.api.service_not_supported': {
      title: 'Service not supported',
      message: 'This service is not supported by the current cobalt instance. Check the services modal for supported platforms.',
    },
    'error.api.content_unavailable': {
      title: 'Content unavailable',
      message: 'The content could not be retrieved. It may be private, deleted, or region-locked.',
    },
    'error.api.too_long': {
      title: 'Content too long',
      message: 'This video is too long to process. Try a shorter video or check if there\'s a duration limit.',
    },
    'error.api.could_not_fetch': {
      title: 'Fetch failed',
      message: 'Could not fetch the content. The link might be broken or the service might be temporarily unavailable.',
    },
  };

  // Check if error is a cobalt error code
  if (error.code && errorMap[error.code]) {
    return errorMap[error.code];
  }

  // Check for common error patterns in message
  const msg = (error.message || String(error)).toLowerCase();
  if (msg.includes('youtube') && msg.includes('disabled')) {
    return errorMap['error.api.youtube.disabled'];
  }
  if (msg.includes('rate') || msg.includes('limit')) {
    return errorMap['error.api.rate_limit'];
  }
  if (msg.includes('invalid') && msg.includes('url')) {
    return errorMap['error.api.invalid_url'];
  }
  if (msg.includes('not supported') || msg.includes('unsupported')) {
    return errorMap['error.api.service_not_supported'];
  }

  // Default error
  return {
    title: 'Download failed',
    message: error.message || 'An unknown error occurred. Please try again.',
  };
}

function showError(error) {
  const detailed = getDetailedError(error);
  hideProcessModal();
  alert(`${detailed.title}: ${detailed.message}`);
}

// ---------------- Cobalt-style Processing Modal ----------------
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
  status.textContent = 'getting info from cobalt…';
  spinner.hidden = false;
  successIcon.hidden = true;
  cancelBtn.textContent = 'cancel';

  // Set processing location based on forced tunneling setting
  if (SETTINGS.forcedTunnel) {
    location.textContent = 'processing on server (tunnel mode)';
  } else {
    location.textContent = 'processing on server';
  }

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
    const el = $('#' + s);
    if (i < stepIndex) {
      el.classList.remove('active');
      el.classList.add('done');
    } else if (i === stepIndex) {
      el.classList.add('active');
      el.classList.remove('done');
    } else {
      el.classList.remove('active', 'done');
    }
  });

  // Update progress
  barFill.style.width = percent + '%';
  barMeta.textContent = Math.round(percent) + '%';
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

  // Show success checkmark, hide spinner
  spinner.hidden = true;
  successIcon.hidden = false;

  // Update all steps as done
  $$('.step').forEach(s => {
    s.classList.remove('active');
    s.classList.add('done');
  });

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

  // Create blob URL for opening
  const blobUrl = URL.createObjectURL(blob);

  openBtn.onclick = () => {
    window.open(blobUrl, '_blank');
  };

  againBtn.onclick = () => {
    URL.revokeObjectURL(blobUrl);
    hideSuccessScreen();
    urlInput.value = '';
    clearBtn.hidden = true;
    urlInput.focus();
  };

  // Also close on backdrop click
  $('.success-backdrop', modal).onclick = () => {
    URL.revokeObjectURL(blobUrl);
    hideSuccessScreen();
  };
}

function hideSuccessScreen() {
  $('#success-modal').hidden = true;
}

async function handleSave() {
  const url = urlInput.value.trim();

  if (!url) {
    urlInput.focus();
    return;
  }
  if (!/^https?:\/\//i.test(url)) {
    alert('Please enter a valid URL');
    urlInput.focus();
    return;
  }

  // Auto-mute Twitter/X videos if enabled
  let effectiveMode = mode;
  if (SETTINGS.autoMuteTwitter && (url.includes('twitter.com') || url.includes('x.com'))) {
    effectiveMode = 'mute';
    // Update UI to reflect the auto-change
    setMode('mute');
  }

  // Build payload - simple and clean
  const payload = {
    url: url,
    videoQuality: '720',
    downloadMode: effectiveMode === 'audio' ? 'audio' : effectiveMode === 'mute' ? 'mute' : 'auto',
  };

  // Only add codec for video modes
  if (effectiveMode !== 'audio' && payload.downloadMode !== 'audio') {
    payload.youtubeVideoCodec = 'h264';
  }

  setButtonProcessing(true);
  showProcessModal();

  const abortController = new AbortController();
  currentDownload = {
    abort: () => abortController.abort(),
    signal: abortController.signal,
  };

  try {
    // Step 1: Fetch from Cobalt
    updateProcessStep('step-fetch', 10, 'getting download link…');

    const response = await fetch(COBALT_API + '/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`server error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'error') {
      throw new Error(data.error?.msg || 'download failed');
    }

    if (data.status !== 'tunnel' && data.status !== 'redirect') {
      throw new Error('unexpected response');
    }

    // Step 2: Download the file
    updateProcessStep('step-download', 25, 'downloading file…');

    const fileResponse = await fetch(data.url, {
      signal: abortController.signal,
    });

    if (!fileResponse.ok) {
      throw new Error(`download error: ${fileResponse.status}`);
    }

    // Stream download with progress
    const contentLength = parseInt(fileResponse.headers.get('content-length') || '0');
    const reader = fileResponse.body.getReader();
    const chunks = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      received += value.length;

      if (contentLength > 0) {
        const percent = 25 + (received / contentLength) * 70;
        updateProcessStep('step-download', percent, `downloading… ${formatSize(received)} / ${formatSize(contentLength)}`);
      }
    }

    // Step 3: Save file
    updateProcessStep('step-done', 95, 'saving…');

    const blob = new Blob(chunks);
    const ext = mode === 'audio' ? 'mp3' : 'mp4';
    const filename = data.filename || `download.${ext}`;

    // Trigger download
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    showProcessComplete(filename, blob);
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

// ---------------- recent ----------------
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

  // Update COBALT_API based on instance setting
  if (s.instance === 'custom' && s.customInstance) {
    COBALT_API = s.customInstance;
  } else if (s.instance === 'https://api.cobalt.tools') {
    COBALT_API = 'https://api.cobalt.tools';
  } else if (s.instance === 'https://cobalt-api-production-f5b2.up.railway.app') {
    COBALT_API = 'https://cobalt-api-production-f5b2.up.railway.app';
  } else {
    COBALT_API = 'https://cobalt-api-production-f5b2.up.railway.app';
  }
}
let SETTINGS = loadSettings();
applySettings(SETTINGS);
function loadRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
  catch { return []; }
}
function saveRecent(list) { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 6))); }
function pushRecent(entry) {
  const list = loadRecent().filter(e => e.url !== entry.url);
  list.unshift(entry);
  saveRecent(list);
  renderRecent();
}
function renderRecent() {
  const list = loadRecent();
  const wrap = $('#recent');
  const ol   = $('#recent-list');
  ol.innerHTML = '';
  if (!list.length) { wrap.hidden = true; return; }
  wrap.hidden = false;
  for (const item of list) {
    const li = document.createElement('li');
    const left = document.createElement('div');
    left.style.minWidth = '0';
    left.style.flex = '1';
    const u = document.createElement('div');
    u.className = 'url';
    u.textContent = item.filename || item.url;
    const m = document.createElement('div');
    m.className = 'meta';
    m.textContent = `${item.mode} · ${item.quality} · ${new Date(item.ts).toLocaleTimeString()}`;
    left.append(u, m);
    const again = document.createElement('button');
    again.textContent = '↻ again';
    again.title = 'Run again';
    again.onclick = () => { urlInput.value = item.url; clearBtn.hidden = false; handleSave(); };
    const x = document.createElement('button');
    x.textContent = '✕';
    x.title = 'Remove';
    x.onclick = () => { saveRecent(loadRecent().filter(e => e.url !== item.url)); renderRecent(); };
    li.append(left, again, x);
    ol.appendChild(li);
  }
}
renderRecent();

// ---------------- settings UI ----------------
function openSettings() {
  console.log('Opening settings');
  settingDefaultMode.value = SETTINGS.defaultMode;
  settingDefaultQuality.value = SETTINGS.defaultQuality;
  settingDefaultAudio.value = SETTINGS.defaultAudio;
  settingInstance.value = SETTINGS.instance;
  settingCustomInstance.value = SETTINGS.customInstance || '';
  settingAutopaste.checked = SETTINGS.autoPasteOnLoad;
  settingForcedTunnel.checked = SETTINGS.forcedTunnel;
  settingAutoMuteTwitter.checked = SETTINGS.autoMuteTwitter;

  // Show/hide custom instance input
  customInstanceRow.hidden = settingInstance.value !== 'custom';

  settingsModal.hidden = false;
}

// Handle instance selector change
settingInstance.onchange = () => {
  customInstanceRow.hidden = settingInstance.value !== 'custom';
  if (settingInstance.value === 'custom') {
    settingCustomInstance.focus();
  }
};
function closeSettings() {
  settingsModal.hidden = true;
}
console.log('Attaching settings button listeners');
console.log('settingsBtn:', settingsBtn);
console.log('settingsModal:', settingsModal);
console.log('SETTINGS:', SETTINGS);

try {
  settingsBtn.onclick = openSettings;
  settingsCloseBtn.onclick = closeSettings;
  settingsCloseBackdrop.onclick = closeSettings;
  console.log('Settings listeners attached successfully');
} catch (e) {
  console.error('Error attaching settings listeners:', e);
}
settingsSaveBtn.onclick = () => {
  SETTINGS = {
    ...SETTINGS,
    defaultMode: settingDefaultMode.value,
    defaultQuality: settingDefaultQuality.value,
    defaultAudio: settingDefaultAudio.value,
    instance: settingInstance.value,
    customInstance: settingCustomInstance.value.trim(),
    autoPasteOnLoad: Boolean(settingAutopaste.checked),
    forcedTunnel: Boolean(settingForcedTunnel.checked),
    autoMuteTwitter: Boolean(settingAutoMuteTwitter.checked),
  };
  saveSettings(SETTINGS);
  applySettings(SETTINGS);
  closeSettings();
  showToast('settings saved');
};
settingsResetBtn.onclick = () => {
  SETTINGS = { ...DEFAULT_SETTINGS };
  saveSettings(SETTINGS);
  applySettings(SETTINGS);
  openSettings();
  showToast('defaults restored');
};

// services button - show modal with supported services
const servicesBtn = $('#services-btn');
const servicesModal = $('#services-modal');
const servicesCloseBackdrop = $('#services-close-backdrop');
const servicesCloseBtn = $('#services-close-btn');
const servicesList = $('#services-list');
const servicesLoading = $('#services-loading');
const servicesError = $('#services-error');

// Service icons mapping
const SERVICE_ICONS = {
  'youtube': '▶',
  'tiktok': '♪',
  'twitter': '𝕏',
  'instagram': '📷',
  'reddit': '🔴',
  'soundcloud': '☁',
  'vimeo': 'v',
  'facebook': 'f',
  'twitch': '📺',
  'vk': 'vk',
  'bilibili': 'b',
  'douyin': 'd',
  'default': '🎬'
};

function getServiceIcon(service) {
  const name = (service || '').toLowerCase();
  for (const [key, icon] of Object.entries(SERVICE_ICONS)) {
    if (name.includes(key)) return icon;
  }
  return SERVICE_ICONS.default;
}

async function loadServices() {
  servicesLoading.hidden = false;
  servicesList.hidden = true;
  servicesError.hidden = true;

  try {
    const response = await fetch('/api/config');
    const data = await response.json();

    if (data.services && Array.isArray(data.services)) {
      renderServices(data.services);
    } else {
      // Fallback to default services if API doesn't return them
      renderDefaultServices();
    }
  } catch (error) {
    console.error('Failed to load services:', error);
    servicesError.textContent = 'could not load services. using default list.';
    servicesError.hidden = false;
    renderDefaultServices();
  } finally {
    servicesLoading.hidden = true;
  }
}

function renderServices(services) {
  servicesList.innerHTML = '';
  servicesList.hidden = false;

  services.forEach(service => {
    const item = document.createElement('div');
    item.className = 'service-item';

    const icon = document.createElement('div');
    icon.className = 'service-icon';
    icon.textContent = getServiceIcon(service);

    const name = document.createElement('div');
    name.className = 'service-name';
    name.textContent = service;

    const status = document.createElement('div');
    status.className = 'service-status enabled';
    status.innerHTML = '<span class="service-status-dot"></span>available';

    item.appendChild(icon);
    item.appendChild(name);
    item.appendChild(status);
    servicesList.appendChild(item);
  });
}

function renderDefaultServices() {
  const defaultServices = [
    'YouTube', 'TikTok', 'Twitter/X', 'Instagram',
    'Reddit', 'SoundCloud', 'Vimeo', 'Facebook',
    'Twitch', 'VK', 'Bilibili', 'Douyin'
  ];
  renderServices(defaultServices);
}

function openServicesModal() {
  servicesModal.hidden = false;
  loadServices();
}

function closeServicesModal() {
  servicesModal.hidden = true;
}

console.log('Attaching services button listeners');
console.log('servicesBtn:', servicesBtn);
console.log('servicesModal:', servicesModal);

try {
  servicesBtn.onclick = openServicesModal;
  servicesCloseBtn.onclick = closeServicesModal;
  servicesCloseBackdrop.onclick = closeServicesModal;
  console.log('Services listeners attached successfully');
} catch (e) {
  console.error('Error attaching services listeners:', e);
}

// Auto-paste on load
if (SETTINGS.autoPasteOnLoad && navigator.clipboard?.readText) {
  navigator.clipboard.readText().then((t) => {
    const candidate = (t || '').trim();
    if (/^https?:\/\//i.test(candidate) && !urlInput.value) {
      urlInput.value = candidate;
      clearBtn.hidden = false;
    }
  }).catch(() => {});
}

// Focus input on load
urlInput.focus();
