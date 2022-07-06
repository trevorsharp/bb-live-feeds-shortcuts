const injectCode = () => {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('contentscript.js');
  document.body.appendChild(script);

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.type = 'text/css';
  style.href = chrome.runtime.getURL('style.css');
  document.head.appendChild(style);

  document.title = 'Big Brother Live Feeds';
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status == 'complete') {
    if (tab.url !== 'https://www.paramountplus.com/shows/big_brother/live_feed/stream/') return;

    chrome.scripting.executeScript({
      target: { tabId },
      function: injectCode,
    });
  }
});
