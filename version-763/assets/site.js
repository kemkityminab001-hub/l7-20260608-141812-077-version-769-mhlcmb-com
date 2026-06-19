(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')));
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    Array.prototype.forEach.call(document.images, function (img) {
        img.addEventListener('error', function () {
            img.classList.add('is-missing');
        });
    });

    var searchInput = document.querySelector('[data-card-search]');
    var regionSelect = document.querySelector('[data-card-select="region"]');
    var typeSelect = document.querySelector('[data-card-select="type"]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);

    if (searchInput && params.get('q')) {
        searchInput.value = params.get('q');
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        var query = normalize(searchInput && searchInput.value);
        var region = normalize(regionSelect && regionSelect.value);
        var type = normalize(typeSelect && typeSelect.value);

        cards.forEach(function (card) {
            var title = normalize(card.getAttribute('data-title'));
            var cardRegion = normalize(card.getAttribute('data-region'));
            var cardType = normalize(card.getAttribute('data-type'));
            var tags = normalize(card.getAttribute('data-tags'));
            var fullText = [title, cardRegion, cardType, tags].join(' ');
            var matchedQuery = !query || fullText.indexOf(query) !== -1;
            var matchedRegion = !region || cardRegion === region;
            var matchedType = !type || cardType === type;

            card.classList.toggle('is-hidden', !(matchedQuery && matchedRegion && matchedType));
        });
    }

    [searchInput, regionSelect, typeSelect].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        }
    });

    if (searchInput || regionSelect || typeSelect) {
        applyFilters();
    }

    function initPlayer(box) {
        var video = box.querySelector('video');
        var button = box.querySelector('[data-play-button]');

        if (!video) {
            return;
        }

        var stream = video.getAttribute('data-stream');
        var hlsInstance = null;
        var ready = false;

        function attach() {
            if (ready || !stream) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                ready = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                ready = true;
            } else {
                video.src = stream;
                ready = true;
            }
        }

        function play() {
            attach();

            if (button) {
                button.classList.add('is-hidden');
            }

            var playRequest = video.play();

            if (playRequest && typeof playRequest.catch === 'function') {
                playRequest.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (button && video.currentTime === 0) {
                button.classList.remove('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    Array.prototype.forEach.call(document.querySelectorAll('[data-player]'), initPlayer);
})();
