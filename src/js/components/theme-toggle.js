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

  getButtonLabel() {
    let currentSetting = this.getCurrentSetting();
    if (currentSetting === 'light') {
      return 'Dark theme';
    } else {
      return 'Light theme';
    }
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
    this.modeToggleButton.innerText = `${currentSetting === 'dark' ? 'Light' : 'Dark'} theme`;
    this.modeStatusElement.innerText = `Color mode is now "${currentSetting}"`;
    this.setAttribute('data-mode', currentSetting);
  }

  render() {
    this.innerHTML = html`
      <style>
        theme-toggle {
          display: block;
          background-color: black;
          color: #f9f8f6;
        }

        theme-toggle[data-mode='dark'] {
          background-color: #f9f8f6;
          color: black;
        }
      </style>
      <div class="py-2 px-3">
        <div role="status" class="js-mode-status sr-only"></div>
        <button class="js-mode-toggle">
          ${this.getButtonLabel()}
        </button>
      </div>
    `;

    this.afterRender();
  }

  afterRender() {
    this.modeToggleButton = document.querySelector('.js-mode-toggle');
    this.modeStatusElement = document.querySelector('.js-mode-status');

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
