// KapleCSS landing: install-method tabs and copy-to-clipboard buttons.

const COPIED_MS = 1600;
const status = document.querySelector('[data-copy-status]');

function announce(message) {
  if (status) status.textContent = message;
}

function markCopied(button) {
  const isIcon = button.classList.contains('lp-icon-btn');
  const idleText = button.dataset.idleText ?? button.textContent;
  const idleLabel = button.dataset.idleLabel ?? button.getAttribute('aria-label');
  button.dataset.idleText = idleText;
  if (idleLabel) button.dataset.idleLabel = idleLabel;

  if (isIcon) {
    button.classList.add('is-copied');
    button.setAttribute('aria-label', 'Copied');
  } else {
    button.textContent = 'Copied';
  }
  announce('Copied to clipboard');

  clearTimeout(button._copyTimer);
  button._copyTimer = setTimeout(() => {
    if (isIcon) {
      button.classList.remove('is-copied');
      button.setAttribute('aria-label', button.dataset.idleLabel);
    } else {
      button.textContent = button.dataset.idleText;
    }
    announce('');
  }, COPIED_MS);
}

document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', () => {
    const text = button.dataset.copy;
    if (!navigator.clipboard) {
      announce('Copy is not available in this browser');
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => markCopied(button),
      () => announce('Could not copy to clipboard')
    );
  });
});

// Tabs follow the WAI-ARIA tabs pattern: arrows, Home and End move and select.
const tablist = document.querySelector('[role="tablist"]');

if (tablist) {
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];

  const select = (tab) => {
    tabs.forEach((other) => {
      const selected = other === tab;
      other.setAttribute('aria-selected', String(selected));
      other.tabIndex = selected ? 0 : -1;
      document.getElementById(other.getAttribute('aria-controls')).hidden = !selected;
    });
  };

  tabs.forEach((tab) => tab.addEventListener('click', () => select(tab)));

  tablist.addEventListener('keydown', (event) => {
    const current = tabs.indexOf(document.activeElement);
    if (current === -1) return;
    const last = tabs.length - 1;
    const next = {
      ArrowRight: current === last ? 0 : current + 1,
      ArrowLeft: current === 0 ? last : current - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(tabs[next]);
    tabs[next].focus();
  });
}
