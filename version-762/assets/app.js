(function () {
  var body = document.body;
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      body.classList.toggle('menu-open', mobileNav.classList.contains('is-open'));
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function move(step) {
      show(current + step);
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        move(-1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        move(1);
        restart();
      });
    }

    restart();
  }

  var input = document.querySelector('[data-filter-input]');
  var select = document.querySelector('[data-sort-select]');
  var list = document.querySelector('[data-card-list]');
  var empty = document.querySelector('[data-empty-state]');

  if (input && list) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query) {
      input.value = query;
    }
  }

  function filterCards() {
    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var keyword = input ? input.value.trim().toLowerCase() : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-text') || '').toLowerCase();
      var title = (card.getAttribute('data-title') || '').toLowerCase();
      var ok = !keyword || text.indexOf(keyword) !== -1 || title.indexOf(keyword) !== -1;
      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  function sortCards() {
    if (!list || !select) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var type = select.value;

    cards.sort(function (a, b) {
      if (type === 'title') {
        return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-CN');
      }

      if (type === 'rating') {
        return parseFloat(b.getAttribute('data-rating') || '0') - parseFloat(a.getAttribute('data-rating') || '0');
      }

      return parseInt(b.getAttribute('data-year') || '0', 10) - parseInt(a.getAttribute('data-year') || '0', 10);
    });

    cards.forEach(function (card) {
      list.appendChild(card);
    });
  }

  if (input && list) {
    input.addEventListener('input', filterCards);
    filterCards();
  }

  if (select && list) {
    select.addEventListener('change', function () {
      sortCards();
      filterCards();
    });
    sortCards();
  }

  document.querySelectorAll('.player-shell').forEach(function (shell) {
    var video = shell.querySelector('.video-player');
    var overlay = shell.querySelector('.player-overlay');
    var toggle = shell.querySelector('.player-toggle');
    var mute = shell.querySelector('.player-mute');
    var fullscreen = shell.querySelector('.player-fullscreen');

    if (!video) {
      return;
    }

    var url = video.getAttribute('data-play');
    var loaded = false;

    function load() {
      if (loaded || !url) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function play() {
      load();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    function togglePlay() {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', togglePlay);
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      if (toggle) {
        toggle.textContent = 'Ⅱ';
      }
    });
    video.addEventListener('pause', function () {
      if (toggle) {
        toggle.textContent = '▶';
      }
    });

    if (toggle) {
      toggle.addEventListener('click', togglePlay);
    }

    if (mute) {
      mute.addEventListener('click', function () {
        video.muted = !video.muted;
        mute.textContent = video.muted ? '静音' : '音量';
      });
    }

    if (fullscreen) {
      fullscreen.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (video.requestFullscreen) {
          video.requestFullscreen();
        }
      });
    }
  });
})();
