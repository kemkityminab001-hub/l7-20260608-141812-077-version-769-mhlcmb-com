(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var toggle = document.querySelector('.mobile-toggle');
        var mobileNav = document.querySelector('.mobile-nav');
        if (toggle && mobileNav) {
            toggle.addEventListener('click', function () {
                var open = mobileNav.classList.toggle('open');
                toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        if (slides.length) {
            var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
            var current = 0;
            var timer = null;

            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, itemIndex) {
                    slide.classList.toggle('active', itemIndex === current);
                });
                dots.forEach(function (dot, itemIndex) {
                    dot.classList.toggle('active', itemIndex === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            var prev = document.querySelector('.hero-control.prev');
            var next = document.querySelector('.hero-control.next');
            if (prev) {
                prev.addEventListener('click', function () {
                    show(current - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    show(current + 1);
                    start();
                });
            }
            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    show(index);
                    start();
                });
            });
            start();
        }

        Array.prototype.slice.call(document.querySelectorAll('.js-filter-scope')).forEach(function (scope) {
            var search = scope.querySelector('.js-card-search');
            var region = scope.querySelector('.js-region-filter');
            var type = scope.querySelector('.js-type-filter');
            var year = scope.querySelector('.js-year-filter');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
            var empty = scope.querySelector('.no-results');

            function valueOf(control) {
                return control ? control.value.trim() : '';
            }

            function run() {
                var query = valueOf(search).toLowerCase();
                var regionValue = valueOf(region);
                var typeValue = valueOf(type);
                var yearValue = valueOf(year);
                var shown = 0;

                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-text') || '').toLowerCase();
                    var matchQuery = !query || text.indexOf(query) !== -1;
                    var matchRegion = !regionValue || card.getAttribute('data-region') === regionValue;
                    var matchType = !typeValue || card.getAttribute('data-type') === typeValue;
                    var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
                    var matched = matchQuery && matchRegion && matchType && matchYear;
                    card.hidden = !matched;
                    if (matched) {
                        shown += 1;
                    }
                });

                if (empty) {
                    empty.hidden = shown !== 0;
                }
            }

            [search, region, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', run);
                    control.addEventListener('change', run);
                }
            });
            run();
        });
    });
})();
