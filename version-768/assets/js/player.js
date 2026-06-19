(function () {
  function bindMoviePlayer(videoUrl) {
    var video = document.querySelector('[data-player-video]');
    var button = document.querySelector('[data-player-action]');
    var shell = document.querySelector('[data-player-shell]');
    var isReady = false;
    var hlsInstance = null;

    if (!video || !videoUrl) {
      return;
    }

    function attachVideo() {
      if (isReady) {
        return;
      }

      isReady = true;

      if (shell) {
        shell.classList.add('is-playing');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = videoUrl;
      }
    }

    function playVideo() {
      attachVideo();
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        playVideo();
      });
    }

    if (shell) {
      shell.addEventListener('click', function (event) {
        if (!isReady && (event.target === shell || event.target === video)) {
          playVideo();
        }
      });
    }

    video.addEventListener('play', function () {
      if (shell) {
        shell.classList.add('is-playing');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  }

  window.initMoviePlayer = bindMoviePlayer;
})();
