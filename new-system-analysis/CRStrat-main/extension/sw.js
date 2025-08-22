chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "truth-check-page",
    title: "Content Radar: Truth check this page",
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "truth-check-page" && tab?.url) {
    // Open popup to Truth tab (Chrome MV3 can't directly show popup programmatically;
    // instead, open an options-like page or notify user)
    chrome.action.openPopup();
  }
});