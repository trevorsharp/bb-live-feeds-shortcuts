var script = document.createElement('script');
script.src = chrome.runtime.getURL('contentscript.js');
document.head.appendChild(script);
script.remove();

document.title = 'Big Brother Live Feeds';
