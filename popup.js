const keyboardShortcuts = [
  ['1', 'Switch to Camera 1'],
  ['2', 'Switch to Camera 2'],
  ['3', 'Switch to Camera 3'],
  ['4', 'Switch to Camera 4'],
  ['5', 'Switch to Quad View'],
  ['Q', 'Switch to Quad View'],
  ['blank', 'blank'],
  ['F', 'Toggle Fullscreen'],
  ['T', 'Toggle Theater Mode'],
  ['blank', 'blank'],
  ['Space', 'Play / Pause'],
  ['&larr;', 'Skip Back 30 Sec'],
  ['&rarr;', 'Skip Forward 30 Sec'],
  ['blank', 'blank'],
  ['&uarr;', 'Volume Up'],
  ['&darr;', 'Volume Down'],
  ['M', 'Mute / Unmute'],
  ['[', 'Audio from Top'],
  [']', 'Audio from Bottom'],
  ['\\', 'Stereo Audio'],
  ['blank', 'blank'],
  ['G', 'Skip Back 1 Day'],
  ['H', 'Skip Back 1 Hour'],
  ['J', 'Skip Back 5 Min'],
  ['K', 'Play / Pause'],
  ['L', 'Skip Forward 5 Min'],
  [';', 'Skip Forward 1 Hour'],
  ["'", 'Skip Forward 1 Day'],
  ['blank', 'blank'],
  ['<', 'Decrease Playback Speed'],
  ['>', 'Increase Playback Speed'],
  ['/', 'Set Playback Speed to 1x'],
];

const list = document.getElementById('shortcutList');

keyboardShortcuts.forEach(shortcut => {
  if (shortcut.includes('blank')) {
    var lineBreak = document.createElement('span');
    lineBreak.classList.add('lineBreak');
    list.appendChild(lineBreak);
  } else {
    var listItem = document.createElement('li');
    var label = document.createElement('span');
    var key = document.createElement('span');
    key.classList.add('code');

    listItem.appendChild(label);
    listItem.appendChild(key);

    label.innerHTML = shortcut[1];
    key.innerHTML = shortcut[0];

    list.appendChild(listItem);
  }
});
