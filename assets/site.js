(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupNavigation() {
        var toggle = document.querySelector('.nav-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = panel.hasAttribute('hidden');
            if (open) {
                panel.removeAttribute('hidden');
                toggle.setAttribute('aria-expanded', 'true');
                toggle.textContent = '×';
            } else {
                panel.setAttribute('hidden', '');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.textContent = '☰';
            }
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero-slider]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
        var thumbs = Array.prototype.slice.call(root.querySelectorAll('.hero-thumb'));
        var prev = root.querySelector('.hero-prev');
        var next = root.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            thumbs.forEach(function (thumb, i) {
                thumb.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        thumbs.forEach(function (thumb, i) {
            thumb.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        start();
    }

    function setupLocalFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
        if (!cards.length) {
            return;
        }
        var searchInput = document.querySelector('.local-search');
        var typeFilter = document.querySelector('.local-type-filter');
        var regionFilter = document.querySelector('.local-region-filter');
        var empty = document.querySelector('.empty-state');
        var status = document.querySelector('.search-status');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (searchInput && query) {
            searchInput.value = query;
        }

        function filter() {
            var keyword = normalize(searchInput && searchInput.value);
            var kind = normalize(typeFilter && typeFilter.value);
            var region = normalize(regionFilter && regionFilter.value);
            var matched = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' '));
                var typeValue = normalize(card.dataset.type);
                var regionValue = normalize(card.dataset.region);
                var visible = (!keyword || haystack.indexOf(keyword) !== -1) &&
                    (!kind || typeValue === kind) &&
                    (!region || regionValue === region);
                card.hidden = !visible;
                if (visible) {
                    matched += 1;
                }
            });
            if (empty) {
                empty.hidden = matched !== 0;
            }
            if (status) {
                status.textContent = keyword || kind || region ? '已匹配 ' + matched + ' 部影片' : '输入关键词查找影片';
            }
        }

        [searchInput, typeFilter, regionFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', filter);
                control.addEventListener('change', filter);
            }
        });
        filter();
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupLocalFilters();
    });
})();

function setupMoviePlayer(source) {
    var video = document.getElementById('movieVideo');
    var overlay = document.getElementById('playerOverlay');
    if (!video || !source) {
        return;
    }
    var hlsInstance = null;

    function attach() {
        if (hlsInstance || video.getAttribute('src')) {
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function play() {
        attach();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var action = video.play();
        if (action && typeof action.catch === 'function') {
            action.catch(function () {});
        }
    }

    attach();
    if (overlay) {
        overlay.addEventListener('click', play);
    }
    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });
    video.addEventListener('pause', function () {
        if (overlay && video.currentTime === 0) {
            overlay.classList.remove('is-hidden');
        }
    });
    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
