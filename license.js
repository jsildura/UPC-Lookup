try {
  self.addEventListener?.('error', (event) => {
    const { message, filename, lineno, colno } = event;
    const stack = event.error && event.error.stack ? event.error.stack : '(no stack)';
    console.error('[GLOBAL ERROR][license]', { message, filename, lineno, colno, stack });
  });
  self.addEventListener?.('unhandledrejection', (event) => {
    const r = event.reason || {};
    console.error('[UNHANDLED REJECTION][license]', {
      message: r.message || String(r),
      stack: r.stack || '(no stack)',
      reason: r
    });
  });
} catch {}

const LICENSE_API_URL = "https://script.google.com/macros/s/AKfycbwqLpMHwfF23x5CK6riy3qs4nY3bbPrMgmXxxPiesHQXAur61n58O6JMcKQgeeI2tjE1Q/exec";

try {
  const root = document.documentElement;
  if (!root.getAttribute('data-theme')) {
    root.setAttribute('data-theme', 'light');
  }
} catch {}

const LicenseManager = (() => {
  const STORAGE_KEYS = {
    status: "license_status", // 'active' | 'inactive'
    email: "license_email",
    userId: "license_user_id",
    license: "license_key",
    activatedAt: "license_activated_at",
    fingerprint: "license_fingerprint"
  };

  function showActivationMiniModal(message = 'Extension is now activated', durationMs = 3000) {
    try {
      const contentHost = document.querySelector('.license-modal-content');
      const modal = document.getElementById('licenseModal');
      const container = document.createElement('div');
      container.id = 'licenseActivationMiniModal';
      if (contentHost) {

        try {
          const cs = getComputedStyle(contentHost);
          if (!cs.position || cs.position === 'static') {
            contentHost.style.position = 'relative';
          }
        } catch {}
        // Centered over the main license modal content card
        Object.assign(container.style, {
          position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: '10001', pointerEvents: 'none', padding: '16px'
        });
      } else {
  
        Object.assign(container.style, {
          position: 'fixed', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: '10001', pointerEvents: 'none', padding: '16px'
        });
      }
      const box = document.createElement('div');
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-live', 'polite');
      box.setAttribute('aria-label', 'Activation status');
      Object.assign(box.style, {
        minWidth: '360px', maxWidth: '520px', width: 'auto', padding: '18px 20px', borderRadius: '14px',
        border: '1px solid rgba(52,199,89,0.35)', background: '#FFFFFF',
        color: '#111',
        boxShadow: '0 18px 40px rgba(0,0,0,0.18)', textAlign: 'center', fontSize: '14px',
        pointerEvents: 'auto'
      });
      // Header row
      const header = document.createElement('div');
      Object.assign(header.style, { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' });
      const icon = document.createElement('div');
      icon.textContent = '✓';
      Object.assign(icon.style, { width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(52,199,89,0.12)', color: '#1F8F44', borderRadius: '50%', fontWeight: '800' });
      const title = document.createElement('div');
      title.textContent = 'Activation Successful';
      Object.assign(title.style, { fontSize: '16px', fontWeight: '700', color: '#0F5132' });
      header.appendChild(icon);
      header.appendChild(title);

      // Message text
      const text = document.createElement('div');
      text.textContent = message;
      Object.assign(text.style, { lineHeight: '1.5', color: '#111', marginTop: '4px', textAlign: 'center' });

      box.appendChild(header);
      box.appendChild(text);
      container.appendChild(box);
      (contentHost || modal || document.body).appendChild(container);

      setTimeout(() => {
        try { container.remove(); } catch {}
        try { hideModal(); } catch {}
      }, Math.max(1000, durationMs | 0));
    } catch {}
  }

  function updateUIStatusBadge(active, email = '') {
    const badge = document.getElementById('licenseStatusBadge');
    const dot = document.getElementById('licenseStatusDot');
    const text = document.getElementById('licenseStatusText');
    if (!badge || !dot || !text) return;
    if (active) {
      dot.style.background = '#34C759';
      text.textContent = 'Activated';
      badge.style.borderColor = 'rgba(52,199,89,0.35)';
      badge.style.background = 'rgba(52,199,89,0.10)';
      badge.title = email ? `Activated • ${email}` : 'Activated';
    } else {
      dot.style.background = '#9E9E9E';
      text.textContent = 'Inactive';
      badge.style.borderColor = 'rgba(0,0,0,0.10)';
      badge.style.background = 'transparent';
      badge.title = 'Inactive';
    }
  }

  function uuid() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

  // ---- Device fingerprint helpers ----
  async function sha256Hex(s) {
    try {
      const enc = new TextEncoder().encode(s);
      const buf = await crypto.subtle.digest('SHA-256', enc);
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return 'no-sha256';
    }
  }

  function canvasHashPart() {
    try {
      const c = document.createElement('canvas');
      c.width = 220; c.height = 60;
      const ctx = c.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '16px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(0, 0, 220, 30);
      ctx.fillStyle = '#069';
      ctx.fillText('UPC Lookup Fingerprint', 2, 2);
      return c.toDataURL();
    } catch {
      return 'no-canvas';
    }
  }

  function webglInfoPart() {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!gl) return 'no-webgl';
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      const vendor = dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : '';
      const renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '';
      return `${vendor}|${renderer}`;
    } catch {
      return 'no-webgl';
    }
  }

  async function computeDeviceFingerprint() {
    const parts = [
      navigator.userAgent || '',
      (navigator.language || '') + '|' + ((navigator.languages || []).join(',') || ''),
      (Intl.DateTimeFormat && Intl.DateTimeFormat().resolvedOptions().timeZone) || '',
      `${screen.width || ''}x${screen.height || ''}x${screen.colorDepth || ''}`,
      String(navigator.hardwareConcurrency || ''),
      String(navigator.deviceMemory || ''),
      canvasHashPart(),
      webglInfoPart(),
      navigator.platform || ''
    ].join('||');
    return await sha256Hex(parts);
  }

  async function getLocal(keys) {
    return new Promise(resolve => chrome.storage.local.get(keys, resolve));
  }

  async function setLocal(obj) {
    return new Promise(resolve => chrome.storage.local.set(obj, resolve));
  }

  async function isActive() {
    const data = await getLocal([STORAGE_KEYS.status]);
    return data[STORAGE_KEYS.status] === "active";
  }

  function injectStylesOnce() {
    if (document.getElementById("licenseStyles")) return;
    const style = document.createElement("style");
    style.id = "licenseStyles";
    style.textContent = `
      /* Default light theme tokens when theme attribute is not set */
      html:not([data-theme]), html[data-theme="light"] {
        --text-secondary: #3A3A3A;
        --border-color: #e0e0e0;
        --info-color: #5AC8FA;
        --error-color: #FF3B30;
        --success-color: #34C759;
        color-scheme: light;
      }
      .license-gate { position: fixed; inset: 0; z-index: 9997; backdrop-filter: blur(2px); pointer-events: none; }
      body.license-locked .license-gate { pointer-events: auto; }
      .license-modal { position: fixed; inset: 0; display: none; z-index: 9999; }
      .license-modal-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(3px); }
      .license-modal-content { position: relative; width: 440px; max-width: calc(100% - 32px); margin: 8vh auto; padding: 20px 18px; border-radius: 12px; background: rgba(255,255,255,0.8); border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 10px 30px rgba(0,0,0,0.15); overflow: hidden; }
      html[data-theme="dark"] .license-modal-content { background: rgba(28,28,31,0.75); border-color: rgba(255,255,255,0.08); }
      .license-modal-glass { position: absolute; inset: 0; backdrop-filter: blur(18px) saturate(160%); -webkit-backdrop-filter: blur(18px) saturate(160%); pointer-events: none; }
      .license-modal-header { position: relative; z-index: 1; text-align: center; margin-bottom: 12px; }
      .license-modal-icon { font-size: 28px; margin-bottom: 6px; }
      .license-modal-sub { margin: 6px 0 0; color: var(--text-muted, #6E6E73); font-size: 12px; }
      .license-modal-close { position: absolute; top: 8px; right: 10px; border: 0; background: transparent; font-size: 20px; color: inherit; opacity: 0.7; cursor: not-allowed; }
      .license-form { position: relative; z-index: 1; display: grid; gap: 10px; }
      .license-field { display: grid; gap: 6px; text-align: left; }
      .license-field label { font-size: 12px; color: var(--text-secondary, #3A3A3A); }
      html[data-theme="dark"] .license-field label { color: #D2D2D7; }
      .license-field input { padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-color, #e0e0e0); background: rgba(255,255,255,0.9); color: inherit; }
      html[data-theme="dark"] .license-field input { background: rgba(37,37,41,0.8); border-color: rgba(255,255,255,0.12); color: #F5F5F7; }
      .license-btn { margin-top: 4px; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.06); background: linear-gradient(180deg, #4DA3FF, #1B6DDA); color: #fff; font-weight: 600; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.08); }
      .license-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      .license-message { min-height: 18px; font-size: 12px; margin-top: 2px; }
      .license-message.info { color: var(--info-color, #5AC8FA); }
      .license-message.error { color: var(--error-color, #FF3B30); }
      .license-message.success { color: var(--success-color, #34C759); }
    `;
    document.head.appendChild(style);
  }

  function ensureModal() {
    injectStylesOnce();
    let modal = document.getElementById("licenseModal");
    if (modal) return modal;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div id="licenseModal" class="license-modal" style="display:none;">
        <div class="license-modal-backdrop"></div>
        <div class="license-modal-content" role="dialog" aria-labelledby="licenseTitle" aria-modal="true">
          <div class="license-modal-glass"></div>
          <button class="license-modal-close" aria-label="Close" id="licenseCloseBtn">×</button>
          <div class="license-modal-header">
            <div class="license-modal-icon">🔒</div>
            <h2 id="licenseTitle">Activate UPC Lookup</h2>
            <p class="license-modal-sub">Enter your email and license to continue</p>
          </div>
          <form id="licenseForm" class="license-form">
            <div class="license-field">
              <label for="licenseEmail">Email</label>
              <input id="licenseEmail" type="email" placeholder="you@example.com" required />
            </div>
            <div class="license-field">
              <label for="licenseKey">License</label>
              <input id="licenseKey" type="text" placeholder="AAAAAA-XXXXXX-XXXXXX-XXXXXX" required />
            </div>
            <button id="licenseSubmit" type="submit" class="license-btn">Activate</button>
            <div id="licenseMessage" class="license-message" role="alert" aria-live="polite"></div>
          </form>
        </div>
      </div>
      <div id="licenseGate" class="license-gate" style="display:none;"></div>
    `;
    document.body.appendChild(wrapper);
    return document.getElementById("licenseModal");
  }

  function gate(enable) {
    const gateEl = document.getElementById("licenseGate");
    if (!gateEl) return;
    gateEl.style.display = enable ? "block" : "none";
    document.body.classList.toggle("license-locked", enable);
  }

  function showModal() {
    const modal = ensureModal();
    modal.style.display = "block";
    gate(true);
  }

  function hideModal() {
    const modal = document.getElementById("licenseModal");
    if (modal) modal.style.display = "none";
    gate(false);
  }

  function setMessage(text, type = "") {
    const msg = document.getElementById("licenseMessage");
    if (!msg) return;
    msg.textContent = text || "";
    msg.className = `license-message ${type}`.trim();
  }

  async function callApi(email, license, userId) {
    if (!LICENSE_API_URL) {
  
      throw new Error("License API URL is not configured. Set LICENSE_API_URL in license.js.");
    }

    console.group('[LICENSE] Activation request');
    console.log('[LICENSE] Endpoint:', LICENSE_API_URL);

    let { [STORAGE_KEYS.fingerprint]: fp } = await getLocal([STORAGE_KEYS.fingerprint]);
    if (!fp) {
      try {
        fp = await computeDeviceFingerprint();
        await setLocal({ [STORAGE_KEYS.fingerprint]: fp });
      } catch {}
    }
    const payload = { action: "activate", email, license, user_id: userId, fingerprint: fp };
    console.log('[LICENSE] Payload:', payload);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(LICENSE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      console.log('[LICENSE] Response status:', res.status);
      console.log('[LICENSE] Response ok:', res.ok);
      const text = await res.text();
      console.log('[LICENSE] Raw response text:', text);

      if (!res.ok) throw new Error(`Network error: ${res.status}`);

      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.warn('[LICENSE] JSON parse failed, returning raw text');
        data = { ok: false, message: 'Invalid JSON from server', raw: text };
      }
      console.groupEnd();
      return data; // expected: { ok: boolean, message?: string }
    } catch (err) {
      console.error('[LICENSE] Activation error:', err && err.stack ? err.stack : err);
      console.groupEnd();
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async function init() {
    try {
      const root = document.documentElement;
      if (!root.getAttribute('data-theme')) {
        root.setAttribute('data-theme', 'light');
      }
    } catch {}

    let { [STORAGE_KEYS.userId]: userId } = await getLocal([STORAGE_KEYS.userId]);
    if (!userId) {
      userId = uuid();
      await setLocal({ [STORAGE_KEYS.userId]: userId });
    }

    try {
      let { [STORAGE_KEYS.fingerprint]: fp } = await getLocal([STORAGE_KEYS.fingerprint]);
      if (!fp) {
        fp = await computeDeviceFingerprint();
        await setLocal({ [STORAGE_KEYS.fingerprint]: fp });
      }
    } catch {}

    const active = await isActive();
    ensureModal();
    try {
      const { [STORAGE_KEYS.email]: email } = await getLocal([STORAGE_KEYS.email]);
      updateUIStatusBadge(active, email || '');
    } catch {}

    const closeBtn = document.getElementById("licenseCloseBtn");
    if (closeBtn) closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      setMessage("Activation required to use this extension.", "warn");
    });

    const form = document.getElementById("licenseForm");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = (document.getElementById("licenseEmail").value || "").trim();
        const license = (document.getElementById("licenseKey").value || "").trim();
        if (!email || !license) {
          setMessage("Please enter both email and license.", "error");
          return;
        }
        setMessage("Verifying license...", "info");
        console.log('[LICENSE] Verifying license for', { email: email.replace(/(.).+(@.*)/, '$1***$2'), userId });
        const btn = document.getElementById("licenseSubmit");
        const originalBtnText = btn ? btn.textContent : '';
        if (btn) {
          btn.disabled = true;
          btn.setAttribute('aria-busy', 'true');
          btn.textContent = 'Activating…';
        }
        try {
          const result = await callApi(email, license, userId);
          if (result && result.ok) {
            await setLocal({
              [STORAGE_KEYS.status]: "active",
              [STORAGE_KEYS.email]: email,
              [STORAGE_KEYS.license]: license,
              [STORAGE_KEYS.activatedAt]: Date.now()
            });
            setMessage("License activated!", "success");
            // Show small modal for ~3s, then close both modals and continue
            showActivationMiniModal('Extension is now activated', 3000);
            // Update badge immediately
            try { updateUIStatusBadge(true, email); } catch {}
          } else {
            setMessage(result?.message || "Invalid license.", "error");
          }
        } catch (err) {
          setMessage(err.message || "Activation failed.", "error");
        } finally {
          if (btn) {
            btn.disabled = false;
            btn.removeAttribute('aria-busy');
            btn.textContent = originalBtnText || 'Activate';
          }
        }
      });
    }

    if (!active) {
      showModal();
    } else {
      hideModal();
    }
  }

  return { init };
})();

// Initialize
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => LicenseManager.init());
} else {
  LicenseManager.init();
}
