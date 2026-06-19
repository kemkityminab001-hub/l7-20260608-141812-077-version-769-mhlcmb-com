(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
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

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        stop();
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(text) {
    return (text || '').toString().toLowerCase().trim();
  }

  function setupLibrarySearch() {
    var form = document.querySelector('[data-library-search]');
    var grid = document.querySelector('[data-library-grid]');
    if (!form || !grid) {
      return;
    }
    var input = form.querySelector('input[name="q"]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var resultText = document.querySelector('[data-result-text]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }

    function filter() {
      var query = normalize(input ? input.value : '');
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.textContent
        ].join(' '));
        var matched = !query || haystack.indexOf(query) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (resultText) {
        resultText.textContent = query ? '搜索结果：' + visible + ' 部影片' : '片库内容';
      }
    }

    if (input) {
      input.addEventListener('input', filter);
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      filter();
      if (input) {
        var query = input.value.trim();
        var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
        window.history.replaceState(null, '', url);
      }
    });
    filter();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video[data-src]');
      var button = shell.querySelector('.player-play');
      var status = shell.querySelector('[data-player-status]');
      if (!video) {
        return;
      }
      var source = video.getAttribute('data-src');
      var hlsInstance = null;

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function attachSource() {
        if (video.getAttribute('data-ready') === 'true') {
          return;
        }
        if (!source) {
          setStatus('播放线路暂不可用');
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.setAttribute('data-ready', 'true');
          setStatus('高清线路已就绪');
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('高清线路已就绪');
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放线路切换中');
              hlsInstance.destroy();
              video.src = source;
            }
          });
          video.setAttribute('data-ready', 'true');
          return;
        }
        video.src = source;
        video.setAttribute('data-ready', 'true');
        setStatus('使用浏览器播放');
      }

      function play() {
        attachSource();
        var attempt = video.play();
        shell.classList.add('is-playing');
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {
            shell.classList.remove('is-playing');
            setStatus('点击播放器继续播放');
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
      });
      video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupLibrarySearch();
    setupPlayers();
  });
})();
