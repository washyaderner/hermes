// Popup JavaScript for Hermes Browser Extension

const promptInput = document.getElementById('promptInput');
const platformSelect = document.getElementById('platformSelect');
const enhanceBtn = document.getElementById('enhanceBtn');
const openAppBtn = document.getElementById('openAppBtn');
const resultSection = document.getElementById('resultSection');
const resultText = document.getElementById('resultText');
const copyBtn = document.getElementById('copyBtn');
const insertBtn = document.getElementById('insertBtn');

let enhancedPrompt = '';

// Load selected text from content script
chrome.runtime.sendMessage({ action: 'getSelectedText' }, (response) => {
  if (response && response.text) {
    promptInput.value = response.text;
  }
});

// Load saved platform preference
chrome.storage.local.get(['lastPlatform'], (result) => {
  if (result.lastPlatform) {
    platformSelect.value = result.lastPlatform;
  }
});

// Enhance button click
enhanceBtn.addEventListener('click', async () => {
  const prompt = promptInput.value.trim();
  const platform = platformSelect.value;

  if (!prompt) {
    alert('Please enter a prompt to enhance');
    return;
  }

  // Save platform preference
  chrome.storage.local.set({ lastPlatform: platform });

  // Disable button and show loading
  enhanceBtn.disabled = true;
  enhanceBtn.textContent = '⏳ Enhancing...';

  try {
    // Send to background script or main app
    const response = await fetch('http://localhost:3000/api/enhance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        platformId: platform,
        tone: 'professional',
        fewShotCount: 0,
      }),
    });

    const data = await response.json();

    if (data.success && data.enhancedPrompts && data.enhancedPrompts.length > 0) {
      enhancedPrompt = data.enhancedPrompts[0].enhanced;
      resultText.textContent = enhancedPrompt;
      resultSection.classList.add('show');
    } else {
      // Fallback to simple enhancement
      enhancedPrompt = enhanceFallback(prompt, platform);
      resultText.textContent = enhancedPrompt;
      resultSection.classList.add('show');
    }
  } catch (error) {
    console.error('Enhancement error:', error);
    // Use fallback enhancement
    enhancedPrompt = enhanceFallback(prompt, platform);
    resultText.textContent = enhancedPrompt;
    resultSection.classList.add('show');
  } finally {
    enhanceBtn.disabled = false;
    enhanceBtn.textContent = '✨ Enhance';
  }
});

// Simple fallback enhancement
function enhanceFallback(prompt, platform) {
  const platformInstructions = {
    'gpt-4': 'For ChatGPT: Please provide a detailed, well-structured response to the following:',
    'claude': 'For Claude: I need a comprehensive and thoughtful response to:',
    'gemini': 'For Google Gemini: Please analyze and respond thoroughly to:',
    'midjourney': 'Create a detailed image with the following characteristics:',
    'stable-diffusion': 'Generate an image using these detailed specifications:',
  };

  const instruction = platformInstructions[platform] || 'Enhanced prompt:';
  return `${instruction}\n\n${prompt}\n\nPlease be specific, detailed, and accurate in your response.`;
}

// Copy button
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(enhancedPrompt).then(() => {
    copyBtn.textContent = '✓ Copied!';
    setTimeout(() => {
      copyBtn.textContent = '📋 Copy';
    }, 2000);
  });
});

// Insert button - inject into active tab
insertBtn.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'insertText',
      text: enhancedPrompt,
    });
    window.close();
  });
});

// Open full app button
openAppBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
});
