export default function Home() {
  return (
    <>
      <div className="bg" aria-hidden="true"></div>

      <header>
        <a className="brand" href="/" aria-label="nab home">
          <span className="logo" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="22" height="22">
              <circle cx="16" cy="16" r="14" className="logo-bg" />
              <path d="M16 8v12m-5-5l5 5l5-5" className="logo-fg" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="brand-name">nab</span>
          <span className="brand-tag" id="version-pill">v—</span>
        </a>
        <div className="header-actions">
          <button className="iconbtn" id="settings-btn" title="Settings" aria-label="Settings">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33a1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.08a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.08a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
          <button className="iconbtn" id="services-btn" title="Supported services" aria-label="Supported services">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>
            </svg>
          </button>
          <button className="iconbtn" id="theme-btn" title="Toggle theme" aria-label="Toggle theme">
            <svg id="ico-sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
            </svg>
            <svg id="ico-moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>
        </div>
      </header>

      <main>
        <section className="hero">
          <h1>save any video.</h1>
          <p className="sub">paste a link. choose a format. get a file. that&apos;s it.</p>
        </section>

        <form id="form" className="omnibox" autoComplete="off" noValidate>
          <span className="omnibox-icon" id="omnibox-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 15l6-6"/>
              <path d="M11 6l.46-.54a5 5 0 0 1 7.08 7.08l-.54.46"/>
              <path d="M13 18l-.4.54a5.07 5.07 0 0 1-7.13 0a4.97 4.97 0 0 1 0-7.07l.52-.46"/>
            </svg>
          </span>
          <input id="url" type="url" inputMode="url" placeholder="paste a link…" autoComplete="off" autoCapitalize="none" spellCheck={false} required />
          <button type="button" id="clear-btn" className="ghost-icon" aria-label="Clear" title="Clear" hidden>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          <button type="button" id="paste-btn" className="ghost">paste</button>
          <button type="submit" id="go-btn" className="primary">
            <span className="go-label">save</span>
            <span className="go-arrow">→</span>
            <span className="go-spin" hidden></span>
          </button>
        </form>

        <div className="controls">
          <div className="seg" role="tablist" aria-label="Download mode">
            <button className="seg-btn" data-mode="auto" aria-pressed="true" type="button">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="6 4 20 12 6 20 6 4"/>
              </svg>
              auto
            </button>
            <button className="seg-btn" data-mode="mute" aria-pressed="false" type="button">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
              </svg>
              muted video
            </button>
            <button className="seg-btn" data-mode="audio" aria-pressed="false" type="button">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
              audio
            </button>
          </div>

          <div className="meta-controls">
            <label className="select">
              <span>quality</span>
              <select id="quality">
                <option value="max">max</option>
                <option value="1080">1080p</option>
                <option value="720" defaultValue>720p</option>
                <option value="480">480p</option>
                <option value="360">360p</option>
              </select>
            </label>
            <label className="select">
              <span>audio</span>
              <select id="audio-format">
                <option value="mp3" defaultValue>mp3</option>
                <option value="opus">opus</option>
                <option value="ogg">ogg</option>
                <option value="wav">wav</option>
                <option value="best">best</option>
              </select>
            </label>
          </div>
        </div>

        <div id="status" className="status" hidden>
          <span className="status-dot"></span>
          <div className="status-body">
            <div className="status-title" id="status-title">working…</div>
            <div className="status-msg" id="status-msg"></div>
            <div className="status-progress" id="status-progress" hidden>
              <div className="bar"><div className="bar-fill" id="bar-fill"></div></div>
              <div className="bar-meta" id="bar-meta">0%</div>
            </div>
            <div className="status-actions" id="status-actions" hidden></div>
          </div>
          <button className="ghost-icon" id="status-close" aria-label="Dismiss" title="Dismiss">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <section className="recent" id="recent" hidden>
          <h2>recent</h2>
          <ol id="recent-list"></ol>
        </section>

        <section className="tips">
          <kbd>⌘/Ctrl</kbd> + <kbd>V</kbd> anywhere to paste &amp; save · <kbd>⌘/Ctrl</kbd> + <kbd>K</kbd> focus · <kbd>Esc</kbd> clear
        </section>
      </main>

      <footer>
        <div className="foot-left">
          <span className="pill subtle">no logs · no ads · no tracking</span>
        </div>
      </footer>

      <div id="toast" className="toast" hidden></div>

      <div id="settings-modal" className="modal" hidden>
        <div className="modal-backdrop" id="settings-close-backdrop"></div>
        <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="settings-title">
          <header className="modal-head">
            <h2 id="settings-title">settings</h2>
            <button className="ghost-icon" id="settings-close-btn" aria-label="Close settings" title="Close">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </header>
          <div className="modal-body">
            <label className="select setting-row">
              <span>default mode</span>
              <select id="setting-default-mode">
                <option value="auto">auto</option>
                <option value="mute">muted video</option>
                <option value="audio">audio</option>
              </select>
            </label>
            <label className="select setting-row">
              <span>default quality</span>
              <select id="setting-default-quality">
                <option value="max">max</option>
                <option value="1080">1080p</option>
                <option value="720">720p</option>
                <option value="480">480p</option>
                <option value="360">360p</option>
              </select>
            </label>
            <label className="select setting-row">
              <span>default audio</span>
              <select id="setting-default-audio">
                <option value="mp3">mp3</option>
                <option value="opus">opus</option>
                <option value="ogg">ogg</option>
                <option value="wav">wav</option>
                <option value="best">best</option>
              </select>
            </label>
            <label className="select setting-row">
              <span>cobalt instance</span>
              <select id="setting-instance">
                <option value="default">default (recommended)</option>
                <option value="https://api.cobalt.tools">api.cobalt.tools (official)</option>
                <option value="https://cobalt-api-production-f5b2.up.railway.app">railway instance</option>
                <option value="custom">custom…</option>
              </select>
            </label>
            <label className="setting-row" id="custom-instance-row" hidden>
              <span>custom instance url</span>
              <input
                type="url"
                id="setting-custom-instance"
                placeholder="https://your-cobalt-instance.com"
                className="setting-input"
              />
            </label>
            <label className="check-row">
              <input type="checkbox" id="setting-autopaste" />
              <span>auto-fill from clipboard on page load</span>
            </label>
            <label className="check-row">
              <input type="checkbox" id="setting-forced-tunnel" />
              <span>forced tunneling (privacy mode)</span>
            </label>
            <label className="check-row">
              <input type="checkbox" id="setting-auto-mute-twitter" />
              <span>auto-mute Twitter/X videos</span>
            </label>
          </div>
          <footer className="modal-foot">
            <button className="ghost" id="settings-reset-btn" type="button">reset defaults</button>
            <button className="primary" id="settings-save-btn" type="button">save settings</button>
          </footer>
        </section>
      </div>

      {/* Processing Modal - Cobalt style */}
      <div id="process-modal" className="modal" hidden>
        <div className="modal-backdrop process-backdrop"></div>
        <section className="modal-card process-card" role="dialog" aria-modal="true" aria-labelledby="process-title">
          <div className="process-body">
            <div className="process-icon">
              <div className="spinner-ring" id="process-spinner"></div>
              <div className="success-icon" id="process-success" hidden>✓</div>
            </div>
            <h2 id="process-title" className="process-title">processing</h2>
            <div className="process-info" id="process-info">
              <span className="process-location" id="process-location">processing on server</span>
            </div>
            <div className="process-steps">
              <div className="step" id="step-fetch">getting info</div>
              <div className="step" id="step-download">downloading</div>
              <div className="step" id="step-done">finishing up</div>
            </div>
            <div className="process-progress">
              <div className="bar"><div className="bar-fill" id="process-bar-fill"></div></div>
              <div className="bar-meta" id="process-bar-meta">0%</div>
            </div>
            <div className="process-status" id="process-status">starting…</div>
            <button className="ghost process-cancel" id="process-cancel-btn" type="button">cancel</button>
          </div>
        </section>
      </div>

      {/* Success Screen */}
      <div id="success-modal" className="modal" hidden>
        <div className="modal-backdrop success-backdrop"></div>
        <section className="modal-card success-card" role="dialog" aria-modal="true" aria-labelledby="success-title">
          <div className="success-body">
            <div className="success-check">✓</div>
            <h2 id="success-title" className="success-title">saved successfully</h2>
            <div className="success-filename" id="success-filename">file.mp4</div>
            <div className="success-actions">
              <button className="primary" id="success-open-btn" type="button">open file</button>
              <button className="ghost" id="success-again-btn" type="button">download another</button>
            </div>
          </div>
        </section>
      </div>

      {/* Services Modal */}
      <div id="services-modal" className="modal" hidden>
        <div className="modal-backdrop" id="services-close-backdrop"></div>
        <section className="modal-card services-card" role="dialog" aria-modal="true" aria-labelledby="services-title">
          <header className="modal-head">
            <h2 id="services-title">supported services</h2>
            <button className="ghost-icon" id="services-close-btn" aria-label="Close" title="Close">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </header>
          <div className="modal-body">
            <div id="services-loading" className="services-loading">loading services…</div>
            <div id="services-list" className="services-list"></div>
            <div id="services-error" className="services-error" hidden></div>
          </div>
        </section>
      </div>
    </>
  );
}
