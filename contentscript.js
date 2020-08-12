const keyboardShortcuts = [
  ["1", () => setSpeed(1.0)],
  ["2", () => setSpeed(1.25)],
  ["3", () => setSpeed(1.5)],
  ["4", () => setSpeed(1.75)],
  ["5", () => setSpeed(2.0)],
  ["6", () => setSpeed(2.25)],
  ["7", () => setSpeed(2.5)],
  ["8", () => setSpeed(3.0)],
  ["9", () => setSpeed(5.0)],
  ["0", () => setSpeed(10)],
  ["a", () => setQuality(-1)],
  ["s", () => setQuality(5)],
  ["z", () => setQuality(3)],
  ["x", () => setQuality(1)],
  ["q", () => setCamera(5)],
  ["w", () => setCamera(1)],
  ["e", () => setCamera(2)],
  ["r", () => setCamera(3)],
  ["t", () => setCamera(4)],
  ["f", () => toggleFullscreen()],
  ["m", () => toggleMute()],
  [",", () => setAudioChannel("left")],
  [".", () => setAudioChannel("right")],
  ["/", () => setAudioChannel("stereo")],
  [" ", () => playPause()],
  ["ArrowUp", () => volumeUp()],
  ["ArrowDown", () => volumeDown()],
  ["ArrowLeft", () => seek(-30)],
  ["ArrowRight", () => seek(30)],
];

document.onkeydown = (event) => {
  const matchingShortcut = keyboardShortcuts.find(
    (shortcut) => shortcut[0] === event.key
  );
  if (matchingShortcut) {
    event.preventDefault();
    matchingShortcut[1]();
  }
};

const setSpeed = (speed) => {
  $(function () {
    const player = $B.videoPlayer;
    const backend = player.playerInstance.CVI_Mgr.RPM.currRP.facade.player;
    backend.setPlaybackRate(speed);
  });
};

const setQuality = (index) => {
  $(function () {
    const player = $B.videoPlayer;
    const backend = player.playerInstance.CVI_Mgr.RPM.currRP.facade.player;
    const primaryPlayer = player.playerApi.bblfJsPlayer.primaryPlayer;
    primaryPlayer.useDynamicSwitching(index === -1);
    backend.setAutoSwitchQualityFor("video", index === -1);
    backend.setQualityFor("video", index);
  });
};

const setCamera = (index) => {
  $(function () {
    const player = $B.videoPlayer;
    player.switchCamera(index);
    player.highlightCamera(index);
  });
};

const seek = (secs) => {
  $(function () {
    const player = $B.videoPlayer;
    const liveFeedPlayer = player.playerApi.bblfJsPlayer;
    liveFeedPlayer.rewind(-1 * secs);
  });
};

const toggleFullscreen = () => {
  document.getElementsByClassName("btn-full-screen")[0].click();
};

const playPause = () => {
  const video = document.querySelector("video");
  video.paused ? video.play() : video.pause();
};

var audioNodes = [];
var volumeLevel = 1;
var isMuted = false;

const setVolume = (volume) => {
  audioNodes.forEach((audioNode) => (audioNode.gainNode.gain.value = volume));
};

const toggleMute = () => {
  isMuted = !isMuted;
  setVolume(isMuted ? 0 : volumeLevel);
};

const volumeUp = () => {
  isMuted = false;
  volumeLevel += volumeLevel < 4 ? 0.2 : 0;
  setVolume(volumeLevel);
};

const volumeDown = () => {
  isMuted = false;
  volumeLevel -= volumeLevel > 0 ? 0.2 : 0;
  setVolume(volumeLevel);
};

const setAudioChannel = (audioChannel) =>
  audioNodes.forEach((audioNode) => {
    try {
      if (audioChannel === "left" || audioChannel === "right") {
        audioNode.gainLeft.gain.value = audioChannel === "right" ? 0 : 1;
        audioNode.gainRight.gain.value = audioChannel === "left" ? 0 : 1;
        audioNode.gainNode.connect(audioNode.splitter, 0, 0);
        audioNode.gainNode.disconnect(audioNode.destination, 0);
      } else {
        audioNode.gainNode.connect(audioNode.destination, 0);
        audioNode.gainNode.disconnect(audioNode.splitter, 0, 0);
      }
    } catch (error) {}
  });

var audioContex = new AudioContext();
var alreadySetUpNodes = [];

setInterval(
  () =>
    document.querySelectorAll("video,audio").forEach((node) => {
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
