document.onkeydown = (event) => {
  if (event.keyCode === 49) {
    setSpeed(1.0);
  } else if (event.keyCode === 50) {
    setSpeed(1.25);
  } else if (event.keyCode === 51) {
    setSpeed(1.5);
  } else if (event.keyCode === 52) {
    setSpeed(1.75);
  } else if (event.keyCode === 53) {
    setSpeed(2.0);
  } else if (event.keyCode === 54) {
    setSpeed(2.25);
  } else if (event.keyCode === 55) {
    setSpeed(2.5);
  } else if (event.keyCode === 56) {
    setSpeed(3.0);
  } else if (event.keyCode === 57) {
    setSpeed(5.0);
  } else if (event.keyCode === 48) {
    setSpeed(10.0);
  } else if (event.keyCode === 65) {
    setQuality(-1);
  } else if (event.keyCode === 83) {
    setQuality(5);
  } else if (event.keyCode === 90) {
    setQuality(3);
  } else if (event.keyCode === 88) {
    setQuality(1);
  } else if (event.keyCode === 81) {
    setCamera(5);
  } else if (event.keyCode === 87) {
    setCamera(1);
  } else if (event.keyCode === 69) {
    setCamera(2);
  } else if (event.keyCode === 82) {
    setCamera(3);
  } else if (event.keyCode === 84) {
    setCamera(4);
  } else if (event.keyCode === 70) {
    toggleFullscreen();
  } else if (event.keyCode === 32) {
    playPause();
  } else if (event.keyCode === 190) {
    setAudioChannel("right");
  } else if (event.keyCode === 188) {
    setAudioChannel("left");
  } else if (event.keyCode === 191) {
    setAudioChannel("stereo");
  } else if (event.keyCode === 77) {
    toggleMute();
  } else if (event.keyCode === 38) {
    event.preventDefault();
    volumeUp();
  } else if (event.keyCode === 40) {
    event.preventDefault();
    volumeDown();
  } else if (event.keyCode === 37) {
    event.preventDefault();
    seek(-30);
  } else if (event.keyCode === 39) {
    event.preventDefault();
    seek(30);
  }
};

const setSpeed = (speed) => {
  $(function () {
    $B.videoPlayer.playerInstance.CVI_Mgr.RPM.currRP.facade.player.setPlaybackRate(
      speed
    );
  });
};

const setQuality = (index) => {
  $(function () {
    const backend =
      $B.videoPlayer.playerInstance.CVI_Mgr.RPM.currRP.facade.player;
    $B.videoPlayer.playerApi.bblfJsPlayer.primaryPlayer.useDynamicSwitching(
      index === -1
    );
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

const toggleFullscreen = () => {
  document.getElementsByClassName("btn-full-screen")[0].click();
};

const playPause = () => {
  const video = document.querySelector("video");
  video.paused ? video.play() : video.pause();
};

const seek = (secs) => {
  $(function () {
    $B.videoPlayer.playerApi.bblfJsPlayer.rewind(-1 * secs);
  });
};

var audioContex = new AudioContext();
var alreadySetUpNodes = [];
var audioNodes = [];
var volumeLevel = 1;
var isMuted = false;

const setAudioChannel = (audioChannel) =>
  audioNodes.forEach((node) => adjustChannel(node, audioChannel));

const toggleMute = () => {
  isMuted = !isMuted;
  audioNodes.forEach((node) => setVolume(node, isMuted ? 0 : volumeLevel));
};

const volumeUp = () => {
  isMuted = false;
  volumeLevel += volumeLevel < 4 ? 0.1 : 0;
  audioNodes.forEach((node) => setVolume(node, volumeLevel));
};

const volumeDown = () => {
  isMuted = false;
  volumeLevel -= volumeLevel > 0 ? 0.1 : 0;
  audioNodes.forEach((node) => setVolume(node, volumeLevel));
};

const setUpNode = (node) => {
  alreadySetUpNodes.push(node);
  audioNode = {};
  audioNode.source = audioContex.createMediaElementSource(node);
  audioNode.gainNode = audioContex.createGain();
  audioNode.gainNode.gain.value = volumeLevel;
  audioNode.source.connect(audioNode.gainNode, 0);
  audioNode.gainNode.connect(audioContex.destination, 0);
  audioNode.splitter = audioContex.createChannelSplitter(2);
  audioNode.gainLeft = audioContex.createGain();
  audioNode.gainRight = audioContex.createGain();
  audioNode.splitter.connect(audioNode.gainLeft, 0);
  audioNode.splitter.connect(audioNode.gainRight, 1);
  audioNode.gainLeft.connect(audioContex.destination, 0);
  audioNode.gainRight.connect(audioContex.destination, 0);
  audioNodes.push(audioNode);
};

const adjustChannel = (audioNode, output) => {
  try {
    if (output === "left" || output === "right" || output == "mono") {
      audioNode.gainLeft.gain.value = output === "right" ? 0 : 1;
      audioNode.gainRight.gain.value = output === "left" ? 0 : 1;
      audioNode.gainNode.disconnect(audioContex.destination, 0);
      audioNode.gainNode.connect(audioNode.splitter, 0, 0);
    } else {
      audioNode.gainNode.disconnect(audioNode.splitter, 0, 0);
      audioNode.gainNode.connect(audioContex.destination, 0);
    }
  } catch (error) {}
};

const setVolume = (audioNode, value) => (audioNode.gainNode.gain.value = value);

setInterval(
  () =>
    document
      .querySelectorAll("video,audio")
      .forEach((node) => !alreadySetUpNodes.includes(node) && setUpNode(node)),
  1000
);
