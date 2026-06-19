(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            var frame = image.closest('.poster-frame');
            if (frame) {
                frame.classList.add('is-empty');
            }
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot')) || 0;
                showSlide(index);
            });
        });

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5600);
    }

    var queryParams = new URLSearchParams(window.location.search);
    var initialQuery = queryParams.get('q') || queryParams.get('year') || '';

    document.querySelectorAll('[data-search-box]').forEach(function (input) {
        var targetId = input.getAttribute('data-search-target');
        var target = targetId ? document.getElementById(targetId) : document;
        var cards = Array.prototype.slice.call((target || document).querySelectorAll('.movie-card'));

        var applyFilter = function () {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                card.classList.toggle('is-hidden', query !== '' && text.indexOf(query) === -1);
            });
        };

        if (initialQuery) {
            input.value = initialQuery;
        }

        input.addEventListener('input', applyFilter);
        applyFilter();
    });

    document.querySelectorAll('[data-player]').forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.player-start');
        var hlsInstance = null;
        var ready = false;

        var setup = function () {
            if (!video || ready) {
                return;
            }

            var stream = video.getAttribute('data-stream');
            if (!stream) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            }

            ready = true;
        };

        var playVideo = function () {
            setup();
            if (!video) {
                return;
            }
            shell.classList.add('is-playing');
            var playRequest = video.play();
            if (playRequest && typeof playRequest.catch === 'function') {
                playRequest.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        };

        if (button) {
            button.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    shell.classList.remove('is-playing');
                }
            });
            video.addEventListener('emptied', function () {
                if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                    hlsInstance.destroy();
                }
            });
        }
    });
})();
