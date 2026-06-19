(function () {
    window.initMoviePlayer = function (url) {
        var video = document.querySelector('[data-player-video]');
        var overlay = document.querySelector('.player-overlay');
        var errorBox = document.querySelector('.player-error');
        var attached = false;
        var hls = null;
        var wantsPlay = false;

        if (!video || !overlay || !url) {
            return;
        }

        function showError() {
            if (errorBox) {
                errorBox.hidden = false;
            }
        }

        function begin() {
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {});
            }
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (wantsPlay) {
                        begin();
                    }
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showError();
                    }
                });
                return;
            }

            video.src = url;
        }

        function play() {
            wantsPlay = true;
            overlay.classList.add('is-hidden');
            attach();
            begin();
        }

        overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
