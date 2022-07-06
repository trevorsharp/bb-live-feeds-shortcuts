const MAX_SPEED = 5;
const MIN_SPEED = 0.25;

const MAX_VOLUME = 10;
const MIN_VOLUME = 0.2;

var audioContex = null;
var audioNode = {};
var volumeLevel = 1;

var currentSpeed = 1;

const getVideoElement = () => document.querySelector('video');
const getVideoPlayer = () => window.$B.videoPlayer;

const keyboardShortcuts = [
  [['1'], () => setCamera(1), () => 'Camera 1'],
  [['2'], () => setCamera(2), () => 'Camera 2'],
  [['3'], () => setCamera(3), () => 'Camera 3'],
  [['4'], () => setCamera(4), () => 'Camera 4'],
  [['5'], () => setCamera(5), () => 'Quad View'],
  [['q'], () => setCamera(5), () => 'Quad View'],
  [['f'], () => toggleFullscreen(), () => undefined],
  [['t'], () => toggleLargeVideo(), () => undefined],
  [['p'], () => launchPictureInPicture(), () => undefined],
  [['m'], () => toggleMute(), () => `${getVideoElement().muted ? 'Mute' : 'Unmute'}`],
  [['['], () => setAudioChannel('left'), () => 'Top Audio'],
  [[']'], () => setAudioChannel('right'), () => 'Bottom Audio'],
  [['\\'], () => setAudioChannel('stereo'), () => 'Stereo Audio'],
  [[' ', 'k'], () => playPause(), () => `${getVideoElement().paused ? 'Pause' : 'Play'}`],
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
  [['d'], () => showDubugMenu(), () => undefined],
];

document.onkeydown = (event) => {
  const matchingShortcut = keyboardShortcuts.find((shortcut) => shortcut[0].includes(event.key));
  if (matchingShortcut) {
    event.preventDefault();

    if (audioContex === null) {
      audioContex = new window.AudioContext();
      setUpAudio();
    }

    matchingShortcut[1]();
    showAlert(matchingShortcut[2]());
  }
};

const changeSpeed = (amount) => {
  currentSpeed += amount;
  currentSpeed = currentSpeed > MAX_SPEED ? MAX_SPEED : currentSpeed;
  currentSpeed = currentSpeed < MIN_SPEED ? MIN_SPEED : currentSpeed;
  setSpeed(currentSpeed);
};

const setSpeed = (speed) => {
  currentSpeed = speed;
  getVideoPlayer().playerInstance.CVI_Mgr.RPM.currRP.facade.player.setPlaybackRate(speed);
};

const setCamera = (index) => {
  getVideoPlayer().switchCamera(index);
  getVideoPlayer().highlightCamera(index);
};

const goLive = () => document.querySelector('.btn-go-live').click();

const seek = (secs) => {
  if (document.querySelector('.btn-go-live.disabled')) document.querySelector('.btn-rewind').click();

  var date = new Date(getVideoPlayer().playerApi.bblfJsPlayer.absoluteDateTime);
  date.setTime(date.getTime() + 1000 * secs);

  var currentDate = new Date(Date.now());

  if (date > currentDate) goLive();
  else getVideoPlayer().playerApi.bblfJsPlayer.rewind(-1 * secs);
};

const seekDays = (days) => {
  var date = new Date(getVideoPlayer().playerApi.bblfJsPlayer.absoluteDateTime);
  date.setDate(date.getDate() + days);

  var currentDate = new Date(Date.now());

  var camera = getVideoPlayer().getSavedCameraAngle();

  if (date > currentDate) goLive();
  else
    getVideoPlayer().updateStream({
      camera,
      datetime: date,
      type: 'Flashback',
    });
};

const toggleFullscreen = () => document.getElementsByClassName('btn-full-screen')[0].click();

const toggleLargeVideo = () => {
  document.getElementById('cbsi-player-embed').classList.toggle('largeVideo');
  document.body.classList.toggle('largeVideo');
};

const launchPictureInPicture = () => getVideoElement().requestPictureInPicture();

const playPause = () => (getVideoElement().paused ? getVideoElement().play() : getVideoElement().pause());

const showDubugMenu = () => (document.getElementById('diagnostic_BBLF_SKIN_UVPJS_CONTAINER').style = 'display: block;');

const toggleMute = () => (getVideoElement().muted = !getVideoElement().muted);

const setVolume = (level) => (audioNode.gainNode.gain.value = level);

const changeVolume = (amount) => {
  getVideoElement().muted = false;
  volumeLevel += amount;
  volumeLevel = volumeLevel > MAX_VOLUME ? MAX_VOLUME : volumeLevel;
  volumeLevel = volumeLevel < MIN_VOLUME ? MIN_VOLUME : volumeLevel;
  setVolume(volumeLevel);
};

const setAudioChannel = (audioChannel) => {
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
  } catch (_) {}
};

const setUpAudio = () => {
  if (!audioNode.source) {
    audioNode.source = audioContex.createMediaElementSource(getVideoElement());
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
  }
};

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

var alert = document.createElement('div');
var alertText = document.createElement('p');
alert.appendChild(alertText);

alert.id = 'shortcutAlert';
alertText.id = 'shortcutAlertText';
alert.className = 'hidden';
alertText.innerHTML = '';

var alertTimeout = setTimeout(() => {}, 10);

const showAlert = (message) => {
  if (message) {
    alert.className = 'hidden';
    alertText.innerHTML = message;
    alert.className = 'visible';
    clearTimeout(alertTimeout);
    alertTimeout = setTimeout(() => (alert.className = 'hidden'), 500);
  }
};

var startupInterval;
startupInterval = setInterval(() => {
  try {
    document.getElementById('content_BBLF_SKIN_UVPJS_CONTAINER').prepend(alert);
    setCamera(5);
    document.querySelector('#bbl-tab-flashbacks>a').click();
    toggleLargeVideo();
    clearInterval(startupInterval);
  } catch (_) {}
}, 1000);
