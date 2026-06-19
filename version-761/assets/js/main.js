(function () {
  'use strict';

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initMobileMenu() {
    var toggle = qs('[data-mobile-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initImageFallbacks() {
    qsa('img[data-cover]').forEach(function (img) {
      if (img.complete && img.naturalWidth === 0) {
        img.classList.add('image-missing');
      }

      img.addEventListener('error', function () {
        img.classList.add('image-missing');
      });
    });
  }

  function initHeroCarousel() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
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
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.heroDot || 0));
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initListingFilters() {
    var grid = qs('.js-card-grid');
    if (!grid) {
      return;
    }

    var cards = qsa('.movie-card', grid);
    var search = qs('.js-filter-search');
    var year = qs('.js-filter-year');
    var type = qs('.js-filter-type');
    var sort = qs('.js-filter-sort');
    var count = qs('.js-result-count');

    function apply() {
      var keyword = search ? search.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : 'all';
      var typeValue = type ? type.value : 'all';
      var visible = [];

      cards.forEach(function (card) {
        var textMatch = !keyword || (card.dataset.text || '').indexOf(keyword) !== -1;
        var yearMatch = yearValue === 'all' || card.dataset.year === yearValue;
        var typeMatch = typeValue === 'all' || card.dataset.type === typeValue;
        var isVisible = textMatch && yearMatch && typeMatch;
        card.style.display = isVisible ? '' : 'none';
        if (isVisible) {
          visible.push(card);
        }
      });

      if (sort) {
        var sortValue = sort.value;
        visible.sort(function (a, b) {
          if (sortValue === 'oldest') {
            return Number(a.dataset.year) - Number(b.dataset.year);
          }
          if (sortValue === 'title') {
            return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-CN');
          }
          return Number(b.dataset.year) - Number(a.dataset.year);
        });
        visible.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (count) {
        count.textContent = String(visible.length);
      }
    }

    [search, year, type, sort].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  function movieCardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="cover-frame" href="' + escapeHtml(movie.url) + '">',
      '    <img class="cover-image" src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" data-cover>',
      '    <span class="cover-gradient"></span>',
      '    <span class="play-chip">播放</span>',
      '  </a>',
      '  <div class="movie-info">',
      '    <a class="movie-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
      '    <p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function initSearchPage() {
    var input = qs('#global-search-input');
    var results = qs('#search-results');
    var count = qs('#search-result-count');
    var empty = qs('#search-empty');

    if (!input || !results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    var dataPromise = window.MOVIE_DATA
      ? Promise.resolve(window.MOVIE_DATA)
      : fetch(results.dataset.json).then(function (response) {
        return response.json();
      });

    dataPromise
      .then(function (movies) {
        function render() {
          var keyword = input.value.trim().toLowerCase();
          if (!keyword) {
            results.innerHTML = '';
            if (count) {
              count.textContent = '输入关键词后显示匹配影片';
            }
            if (empty) {
              empty.style.display = '';
            }
            return;
          }

          var matched = movies.filter(function (movie) {
            return String(movie.searchText || '').toLowerCase().indexOf(keyword) !== -1;
          });
          var limited = matched.slice(0, 120);
          results.innerHTML = limited.map(movieCardTemplate).join('');
          initImageFallbacks();

          if (count) {
            count.textContent = '找到 ' + matched.length + ' 部影片，当前显示 ' + limited.length + ' 部';
          }
          if (empty) {
            empty.style.display = matched.length ? 'none' : '';
            empty.innerHTML = matched.length ? '' : '<p>没有找到匹配内容，请尝试更换关键词。</p>';
          }
        }

        input.addEventListener('input', render);
        render();
      })
      .catch(function () {
        if (count) {
          count.textContent = '搜索数据加载失败，请直接浏览分类片库。';
        }
      });
  }

  function initPlayer() {
    var shell = qs('[data-player]');
    if (!shell) {
      return;
    }

    var video = qs('video', shell);
    var status = qs('[data-player-status]', shell);
    var play = qs('[data-play-toggle]', shell);
    var mute = qs('[data-mute-toggle]', shell);
    var volume = qs('[data-volume-control]', shell);
    var full = qs('[data-fullscreen-toggle]', shell);
    var source = shell.dataset.videoUrl;
    var hls = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function loadSource() {
      if (!video || !source) {
        setStatus('未找到播放源');
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已就绪');
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus('网络加载异常，正在重试');
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus('媒体解码异常，正在恢复');
            hls.recoverMediaError();
          } else {
            setStatus('播放源暂时不可用');
            hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus('播放源已就绪');
      } else {
        setStatus('当前浏览器需要支持 HLS 才能播放');
      }
    }

    function updatePlayButton() {
      if (play && video) {
        play.textContent = video.paused ? '▶' : 'Ⅱ';
      }
    }

    if (play && video) {
      play.addEventListener('click', function () {
        if (video.paused) {
          video.play().catch(function () {
            setStatus('浏览器阻止自动播放，请再次点击播放');
          });
        } else {
          video.pause();
        }
      });

      video.addEventListener('click', function () {
        play.click();
      });
      video.addEventListener('play', function () {
        setStatus('正在播放');
        updatePlayButton();
      });
      video.addEventListener('pause', function () {
        setStatus('已暂停');
        updatePlayButton();
      });
      video.addEventListener('waiting', function () {
        setStatus('缓冲中');
      });
      video.addEventListener('playing', function () {
        setStatus('正在播放');
      });
    }

    if (mute && video) {
      mute.addEventListener('click', function () {
        video.muted = !video.muted;
        mute.textContent = video.muted ? '🔇' : '🔊';
      });
    }

    if (volume && video) {
      volume.addEventListener('input', function () {
        video.volume = Number(volume.value);
        if (video.volume === 0) {
          video.muted = true;
          if (mute) {
            mute.textContent = '🔇';
          }
        } else if (video.muted) {
          video.muted = false;
          if (mute) {
            mute.textContent = '🔊';
          }
        }
      });
    }

    if (full) {
      full.addEventListener('click', function () {
        if (shell.requestFullscreen) {
          shell.requestFullscreen();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });

    loadSource();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initImageFallbacks();
    initHeroCarousel();
    initListingFilters();
    initSearchPage();
    initPlayer();
  });
}());
