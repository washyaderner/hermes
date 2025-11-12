// Background Service Worker for Hermes Extension

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'enhanceWithHermes',
    title: 'Enhance with Hermes',
    contexts: ['selection'],
  });

  console.log('Hermes Extension installed successfully');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'enhanceWithHermes' && info.selectionText) {
    // Send selected text to popup
    chrome.storage.local.set({ selectedText: info.selectionText });

    // Open popup or send to enhance
    chrome.action.openPopup();
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'enhanceText') {
    // Store text and open popup
    chrome.storage.local.set({ selectedText: request.text });
    chrome.action.openPopup();
  } else if (request.action === 'getSelectedText') {
    // Return stored selected text
    chrome.storage.local.get(['selectedText'], (result) => {
      sendResponse({ text: result.selectedText || '' });
      // Clear after retrieval
      chrome.storage.local.remove('selectedText');
    });
    return true; // Keep channel open for async response
  }
});

// Handle cross-origin requests (proxy to main app)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'proxyRequest') {
    fetch(request.url, {
      method: request.method || 'GET',
      headers: request.headers || {},
      body: request.body ? JSON.stringify(request.body) : undefined,
    })
      .then(response => response.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));

    return true; // Keep channel open for async response
  }
});

// Sync state with main app (if needed)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.settings) {
    console.log('Settings updated:', changes.settings.newValue);
  }
});

// Handle browser action clicks (when extension icon is clicked)
chrome.action.onClicked.addListener((tab) => {
  // Open main app in new tab
  chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
});
