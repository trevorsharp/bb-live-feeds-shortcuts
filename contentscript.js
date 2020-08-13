const MAX_SPEED = 5;
const MIN_SPEED = 0.25;

const MAX_VOLUME = 4;
const MIN_VOLUME = 0.2;

var audioContex = new AudioContext();
var alreadySetUpNodes = [];
var audioNodes = [];
var volumeLevel = 1;
var isMuted = false;

var currentSpeed = 1;

const keyboardShortcuts = [
  [['1'], () => setCamera(1), () => 'Camera 1'],
  [['2'], () => setCamera(2), () => 'Camera 2'],
  [['3'], () => setCamera(3), () => 'Camera 3'],
  [['4'], () => setCamera(4), () => 'Camera 4'],
  [['5'], () => setCamera(5), () => 'Quad View'],
  [['q'], () => setCamera(5), () => 'Quad View'],
  [['f'], () => toggleFullscreen(), () => undefined],
  [['t'], () => toggleLargeVideo(), () => undefined],
  [['m'], () => toggleMute(), () => `${isMuted ? 'Mute' : 'Unmute'}`],
  [['['], () => setAudioChannel('left'), () => 'Left Audio'],
  [[']'], () => setAudioChannel('right'), () => 'Right Audio'],
  [['\\'], () => setAudioChannel('stereo'), () => 'Stereo Audio'],
  [[' ', 'k'], () => playPause(), () => `${getIsPaused() ? 'Pause' : 'Play'}`],
  [['h'], () => seek(-3600), () => '- 1 Hour'],
  [[';'], () => seek(3600), () => '+ 1 Hour'],
  [['j'], () => seek(-300), () => '- 5 Min'],
  [['l'], () => seek(300), () => '+ 5 Min'],
  [['g'], () => seekDays(-1), () => '- 1 Day'],
  [["'"], () => seekDays(1), () => '+ 1 Day'],
  [['ArrowLeft'], () => seek(-30), () => '- 30s'],
  [['ArrowRight'], () => seek(30), () => '+ 30s'],
  [['ArrowDown'], () => changeVolume(-0.2), () => `Volume ${volumeLevel.toFixed(1)}`],
  [['ArrowUp'], () => changeVolume(0.2), () => `Volume ${volumeLevel.toFixed(1)}`],
  [[',', '<'], () => changeSpeed(-0.25), () => `Speed ${currentSpeed.toFixed(2)}x`],
  [['.', '>'], () => changeSpeed(0.25), () => `Speed ${currentSpeed.toFixed(2)}x`],
  [['/', '?'], () => setSpeed(1), () => `Speed ${currentSpeed.toFixed(2)}x`],
];

document.onkeydown = event => {
  const matchingShortcut = keyboardShortcuts.find(shortcut => shortcut[0].includes(event.key));
  if (matchingShortcut) {
    event.preventDefault();
    matchingShortcut[1]();
    showAlert(matchingShortcut[2]());
  }
};

const changeSpeed = amount => {
  currentSpeed += amount;
  currentSpeed = currentSpeed > MAX_SPEED ? MAX_SPEED : currentSpeed;
  currentSpeed = currentSpeed < MIN_SPEED ? MIN_SPEED : currentSpeed;
  setSpeed(currentSpeed);
};

const setSpeed = speed => {
  currentSpeed = speed;
  $(function () {
    const videoPlayer = $B.videoPlayer;
    const player = videoPlayer.playerInstance.CVI_Mgr.RPM.currRP.facade.player;
    player.setPlaybackRate(speed);
  });
};

const setCamera = index => {
  $(function () {
    const videoPlayer = $B.videoPlayer;
    videoPlayer.switchCamera(index);
    videoPlayer.highlightCamera(index);
  });
};

const seek = secs => {
  $(function () {
    const videoPlayer = $B.videoPlayer;
    const bblfJsPlayer = videoPlayer.playerApi.bblfJsPlayer;
    bblfJsPlayer.rewind(-1 * secs);
  });
};

const seekDays = days => {
  $(function () {
    const videoPlayer = $B.videoPlayer;
    const bblfJsPlayer = videoPlayer.playerApi.bblfJsPlayer;

    var date = new Date(bblfJsPlayer.absoluteDateTime);
    date.setDate(date.getDate() + days);

    var currentDate = new Date(Date.now());
    currentDate.setHours(0, 0, 0, 0);

    const cameraNumber = videoPlayer.getSavedCameraAngle();

    if (date > currentDate) {
      setCamera(cameraNumber); // Go to live
    } else {
      player.updateStream({ camera: cameraNumber, datetime: date, type: 'Flashback' });
    }
  });
};

const toggleFullscreen = () => {
  document.getElementsByClassName('btn-full-screen')[0].click();
};

const toggleLargeVideo = () => {
  document.getElementById('cbsi-player-embed').classList.toggle('largeVideo');
  document.body.classList.toggle('largeVideo');
};

const getIsPaused = () => document.querySelector('video').paused;

const playPause = () => {
  const video = document.querySelector('video');
  video.paused ? video.play() : video.pause();
};

const setVolume = volume => {
  audioNodes.forEach(audioNode => (audioNode.gainNode.gain.value = volume));
};

const toggleMute = () => {
  isMuted = !isMuted;
  setVolume(isMuted ? 0 : volumeLevel);
};

const changeVolume = amount => {
  isMuted = false;
  volumeLevel += amount;
  volumeLevel = volumeLevel > MAX_VOLUME ? MAX_VOLUME : volumeLevel;
  volumeLevel = volumeLevel < MIN_VOLUME ? MIN_VOLUME : volumeLevel;
  setVolume(volumeLevel);
};

const setAudioChannel = audioChannel =>
  audioNodes.forEach(audioNode => {
    try {
      if (audioChannel === 'left' || audioChannel === 'right') {
        audioNode.gainLeft.gain.value = audioChannel === 'right' ? 0 : 1;
        audioNode.gainRight.gain.value = audioChannel === 'left' ? 0 : 1;
        audioNode.gainNode.connect(audioNode.splitter, 0, 0);
        audioNode.gainNode.disconnect(audioNode.destination, 0);
      } else {
        audioNode.gainNode.connect(audioNode.destination, 0);
        audioNode.gainNode.disconnect(audioNode.splitter, 0, 0);
      }
    } catch (error) {}
  });

setInterval(
  () =>
    document.querySelectorAll('video,audio').forEach(node => {
      if (!alreadySetUpNodes.includes(node)) {
        alreadySetUpNodes.push(node);
        audioNode = {};
        audioNode.source = audioContex.createMediaElementSource(node);
        audioNode.destination = audioContex.destination;
        audioNode.gainNode = audioContex.createGain();
        audioNode.gainNode.gain.value = volumeLevel;
        audioNode.source.connect(audioNode.gainNode, 0);
        audioNode.gainNode.connect(audioNode.destination, 0);
        audioNode.splitter = audioContex.createChannelSplitter(2);
        audioNode.gainLeft = audioContex.createGain();
        audioNode.gainRight = audioContex.createGain();
        audioNode.splitter.connect(audioNode.gainLeft, 0);
        audioNode.splitter.connect(audioNode.gainRight, 1);
        audioNode.gainLeft.connect(audioNode.destination, 0);
        audioNode.gainRight.connect(audioNode.destination, 0);
        audioNodes.push(audioNode);
      }
    }),
  1000
);

//      Audio Flow Diagram
//
//                                    Optionally bypass splitter
// +----------+    +------------+      for regular stereo audio        +---------------+
// |  source  |--->|  gainNode  |------------------------------------->|  destination  |
// +----------+    +-----+------+                                      +-------+-------+
//                       |                          +------------+             ^
//                       |             +----------->|  gainLeft  |----+        |
//                       |             |            +------------+    |        |
//                       |       +-----+------+                       |        |
//                       +------>|  splitter  |                       |--------+
//                               +-----+------+                       |
//                                     |            +-------------+   |
//                                     +----------->|  gainRight  |---+
//                                                  +-------------+
//                            Selectively adjust
//                               L/R balance

//
//       UI Shortuct Alerts
//

var alert = document.createElement('div');
var alertText = document.createElement('p');
alert.appendChild(alertText);

alert.id = 'shortcutAlert';
alertText.id = 'shortcutAlertText';
alert.className = 'hidden';
alertText.innerHTML = '';

var alertTimeout = setTimeout(() => {}, 10);

const showAlert = message => {
  if (message) {
    alert.className = 'hidden';
    alertText.innerHTML = message;
    alert.className = 'visible';
    clearTimeout(alertTimeout);
    alertTimeout = setTimeout(() => (alert.className = 'hidden'), 500);
  }
};

var alertInterval;
alertInterval = setInterval(() => {
  try {
    document.getElementById('content_BBLF_SKIN_UVPJS_CONTAINER').prepend(alert);
    clearInterval(alertInterval);
  } catch (error) {}
}, 1000);

var fullscreenClickHandlerInterval;
fullscreenClickHandlerInterval = setInterval(() => {
  try {
    document.getElementsByClassName('btn-full-screen')[0].addEventListener('click', () => {
      document.getElementById('cbsi-player-embed').classList.remove('largeVideo');
      document.body.classList.remove('largeVideo');
    });
    clearInterval(fullscreenClickHandlerInterval);
  } catch (error) {}
}, 1000);
