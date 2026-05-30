const runtime = globalThis.browser || globalThis.chrome;
const toggleMessage = { type: "universal-pip:toggle-best-video" };

async function sendToggle(tabId) {
  try {
    const result = runtime.tabs.sendMessage(tabId, toggleMessage);
    if (result && typeof result.then === "function") {
      await result;
    }
  } catch (_error) {
    // The content script may be unavailable on restricted Safari pages.
  }
}

runtime.action.onClicked.addListener((tab) => {
  if (!tab || !tab.id) return;
  sendToggle(tab.id);
});
