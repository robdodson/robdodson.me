// For syntax highlighting only
const html = String.raw;

class ThemeToggle extends HTMLElement {
  constructor() {
    super();

    this.STORAGE_KEY = 'user-color-scheme';
  }

  connectedCallback() {
    this.render();
  }

  applySetting(passedSetting) {
    let currentSetting = passedSetting || localStorage.getItem(this.STORAGE_KEY);

    if (currentSetting) {
      document.documentElement.setAttribute('data-user-color-scheme', currentSetting);
      this.setButtonLabelAndStatus(currentSetting);
    }
  }

  toggleSetting() {
    let currentSetting = localStorage.getItem(this.STORAGE_KEY);
    if (!currentSetting) {
      return;
    }

    if (currentSetting === 'light') {
      currentSetting = 'dark';
    } else {
      currentSetting = 'light';
    }

    localStorage.setItem(this.STORAGE_KEY, currentSetting);
    return currentSetting;
  }

  getButtonLabel() {
    let currentSetting = localStorage.getItem(this.STORAGE_KEY);
    if (!currentSetting) {
      return;
    }

    if (currentSetting === 'light') {
      return 'Dark theme';
    } else {
      return 'Light theme';
    }
  }

  setButtonLabelAndStatus(currentSetting) {
    this.modeToggleButton.innerText = `${
      currentSetting === 'dark' ? 'Light' : 'Dark'
    } theme`;
    this.modeStatusElement.innerText = `Color mode is now "${currentSetting}"`;
  }

  render() {
    this.innerHTML = html`
      <div class="[ theme-toggle ] [ md:ta-right gap-top-500 ]">
        <div role="status" class="[ visually-hidden ][ js-mode-status ]"></div>
        <button class="[ button ] [ font-base text-base weight-bold ] [ js-mode-toggle ]">
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
