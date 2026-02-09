// For syntax highlighting only
const html = String.raw;

class ThemeToggle extends HTMLElement {
  constructor() {
    super();
    this.STORAGE_KEY = 'user-color-scheme';
  }

  connectedCallback() {
    this.setAttribute('data-mode', this.getCurrentSetting());
    this.render();
  }

  getCurrentSetting() {
    return localStorage.getItem(this.STORAGE_KEY) ?? 'light';
  }

  applySetting(passedSetting) {
    let currentSetting = passedSetting || this.getCurrentSetting();

    if (currentSetting) {
      document.documentElement.setAttribute('data-user-color-scheme', currentSetting);
      this.setButtonLabelAndStatus(currentSetting);
    }
  }

  toggleSetting() {
    let currentSetting = this.getCurrentSetting();
    if (currentSetting === 'light') {
      currentSetting = 'dark';
    } else {
      currentSetting = 'light';
    }
    localStorage.setItem(this.STORAGE_KEY, currentSetting);
    return currentSetting;
  }

  setButtonLabelAndStatus(currentSetting) {
    const isDark = currentSetting === 'dark';
    this.modeToggleButton.setAttribute('aria-checked', String(isDark));
    this.modeStatusElement.innerText = `Color mode is now "${currentSetting}"`;
    this.setAttribute('data-mode', currentSetting);

    const icon = isDark
      ? '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>'
      : '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
    this.querySelector('.theme-switch-icon').innerHTML = icon;
  }

  render() {
    const isDark = this.getCurrentSetting() === 'dark';

    this.innerHTML = html`
      <style>
        theme-toggle {
          display: block;
        }

        .theme-switch {
          position: relative;
          display: flex;
          align-items: center;
          width: 44px;
          height: 24px;
          padding: 0;
          border: none;
          border-radius: 12px;
          background-color: #ccc;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        theme-toggle[data-mode='dark'] .theme-switch {
          background-color: #555;
        }

        .theme-switch-knob {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
          font-size: 12px;
          line-height: 1;
        }

        theme-toggle[data-mode='dark'] .theme-switch-knob {
          transform: translateX(20px);
          background-color: #222;
        }

        .theme-switch-icon {
          display: block;
          width: 14px;
          height: 14px;
        }
      </style>
      <div role="status" class="js-mode-status sr-only"></div>
      <button
        class="theme-switch js-mode-toggle"
        role="switch"
        aria-checked="${isDark}"
        aria-label="Dark theme"
      >
        <span class="theme-switch-knob">
          <svg class="theme-switch-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${isDark
              ? '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>'
              : '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>'
            }
          </svg>
        </span>
      </button>
    `;

    this.afterRender();
  }

  afterRender() {
    this.modeToggleButton = this.querySelector('.js-mode-toggle');
    this.modeStatusElement = this.querySelector('.js-mode-status');

    this.modeToggleButton.addEventListener('click', evt => {
      evt.preventDefault();
      this.applySetting(this.toggleSetting());
    });
  }
}

if ('customElements' in window) {
  customElements.define('theme-toggle', ThemeToggle);
}

export default ThemeToggle;
