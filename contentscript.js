var audioContex = new AudioContext();
var alreadySetUpNodes = [];
var audioNodes = [];

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
    if (backend) {
      if (index === -1) {
        $B.videoPlayer.playerApi.bblfJsPlayer.primaryPlayer.useDynamicSwitching(
          true
        );
        backend.setAutoSwitchQualityFor("video", true);
      } else {
        $B.videoPlayer.playerApi.bblfJsPlayer.primaryPlayer.useDynamicSwitching(
          false
        );
        backend.setAutoSwitchQualityFor("video", false);
      }
    }
    backend.setQualityFor("video", index);
  });
};

const setCamera = (index) => {
  $(function () {
    const player = $B.videoPlayer;
    player.switchCamera(index);
    player.highlightCamera(index);
    player.currentCameraAngle = index;
  });
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

const setAudio = (audioChannel) =>
  audioNodes.forEach((node) => adjustChannel(node, audioChannel));

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
  } else if (event.keyCode === 81) {
    setCamera(5);
  } else if (event.keyCode === 32) {
    playPause();
  } else if (event.keyCode === 190) {
    seek(30);
  } else if (event.keyCode === 188) {
    seek(-30);
  } else if (event.keyCode === 191) {
    seek(120);
  } else if (event.keyCode === 77) {
    seek(-120);
  } else if (event.keyCode === 37) {
    event.preventDefault();
    setAudio("left");
  } else if (event.keyCode === 39) {
    event.preventDefault();
    setAudio("right");
  } else if (event.keyCode === 40) {
    event.preventDefault();
    setAudio("stereo");
  } else if (event.keyCode === 38) {
    event.preventDefault();
    setAudio("mono");
  }
};

const setUpNode = (node) => {
  alreadySetUpNodes.push(node);
  audioNode = {};
  audioNode.source = audioContex.createMediaElementSource(node);
  audioNode.source.connect(audioContex.destination, 0);
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
      audioNode.source.disconnect(audioContex.destination, 0);
      audioNode.source.connect(audioNode.splitter, 0, 0);
    } else {
      audioNode.source.disconnect(audioNode.splitter, 0, 0);
      audioNode.source.connect(audioContex.destination, 0);
    }
  } catch (error) {}
};

setInterval(
  () =>
    document
      .querySelectorAll("video,audio")
      .forEach((node) => !alreadySetUpNodes.includes(node) && setUpNode(node)),
  1000
);
