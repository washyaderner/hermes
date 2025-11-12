// Content Script for Hermes Browser Extension
// Handles text selection and injection into web pages

let selectedText = '';
let floatingButton = null;

// Listen for text selection
document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('selectionchange', handleSelectionChange);

function handleTextSelection(e) {
  const selection = window.getSelection();
  const text = selection.toString().trim();

  if (text.length > 0) {
    selectedText = text;
    showFloatingButton(e.clientX, e.clientY);
  } else {
    hideFloatingButton();
  }
}

function handleSelectionChange() {
  const selection = window.getSelection();
  if (!selection.toString().trim()) {
    hideFloatingButton();
  }
}

// Show floating "Enhance with Hermes" button
function showFloatingButton(x, y) {
  hideFloatingButton();

  floatingButton = document.createElement('div');
  floatingButton.className = 'hermes-floating-button';
  floatingButton.innerHTML = `
    <button class="hermes-btn">
      ⚡ Enhance with Hermes
    </button>
  `;

  // Position near selection
  floatingButton.style.position = 'fixed';
  floatingButton.style.left = `${x + 10}px`;
  floatingButton.style.top = `${y + 10}px`;
  floatingButton.style.zIndex = '999999';

  document.body.appendChild(floatingButton);

  floatingButton.querySelector('.hermes-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({
      action: 'enhanceText',
      text: selectedText,
    });
    hideFloatingButton();
  });

  // Hide on click outside
  setTimeout(() => {
    document.addEventListener('click', hideFloatingButton, { once: true });
  }, 100);
}

function hideFloatingButton() {
  if (floatingButton) {
    floatingButton.remove();
    floatingButton = null;
  }
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectedText') {
    sendResponse({ text: selectedText });
  } else if (request.action === 'insertText') {
    insertTextIntoActiveElement(request.text);
  }
  return true;
});

// Insert enhanced text into active input/textarea
function insertTextIntoActiveElement(text) {
  const activeElement = document.activeElement;

  if (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT') {
    const start = activeElement.selectionStart;
    const end = activeElement.selectionEnd;
    const currentValue = activeElement.value;

    activeElement.value = currentValue.substring(0, start) + text + currentValue.substring(end);
    activeElement.selectionStart = activeElement.selectionEnd = start + text.length;
    activeElement.focus();
  } else if (activeElement.contentEditable === 'true') {
    document.execCommand('insertText', false, text);
  } else {
    // Copy to clipboard as fallback
    navigator.clipboard.writeText(text).then(() => {
      showNotification('Enhanced prompt copied to clipboard!');
    });
  }
}

// Show notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'hermes-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #6b46c1;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add keyframe animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);
