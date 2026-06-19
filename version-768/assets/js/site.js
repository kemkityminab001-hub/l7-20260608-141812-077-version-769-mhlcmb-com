(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var searchForms = document.querySelectorAll('[data-search-form]');
  searchForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var keyword = input ? input.value.trim() : '';
      if (keyword) {
        window.location.href = 'search.html?q=' + encodeURIComponent(keyword);
      } else {
        window.location.href = 'search.html';
      }
    });
  });

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function activate(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
      });
    });

    window.setInterval(function () {
      activate(index + 1);
    }, 5200);
  }

  var localInput = document.querySelector('[data-local-filter]');
  var regionFilter = document.querySelector('[data-region-filter]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var filterList = document.querySelector('[data-filter-list]');

  if (filterList && (localInput || regionFilter || yearFilter)) {
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-movie-card]'));

    function applyFilters() {
      var keyword = localInput ? localInput.value.trim().toLowerCase() : '';
      var region = regionFilter ? regionFilter.value : '';
      var year = yearFilter ? yearFilter.value : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var terms = card.getAttribute('data-search-terms') || '';
        var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var matched = true;

        if (keyword && terms.indexOf(keyword) === -1) {
          matched = false;
        }
        if (region && cardRegion !== region) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visibleCount += 1;
        }
      });

      var emptyState = filterList.querySelector('[data-empty-state]');
      if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.setAttribute('data-empty-state', '');
        emptyState.textContent = '没有找到匹配影片，请换一个关键词。';
        filterList.appendChild(emptyState);
      }
      emptyState.classList.toggle('is-hidden', visibleCount !== 0);
    }

    [localInput, regionFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  }

  var searchResults = document.querySelector('[data-search-results]');
  if (searchResults && window.MOVIE_SEARCH_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get('q') || '').trim().toLowerCase();
    var title = document.querySelector('[data-search-title]');
    var caption = document.querySelector('[data-search-caption]');

    if (keyword) {
      var matches = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        return movie.terms.indexOf(keyword) !== -1;
      }).slice(0, 96);

      if (title) {
        title.textContent = '“' + keyword + '” 搜索结果';
      }
      if (caption) {
        caption.textContent = matches.length ? '点击卡片进入对应影片详情页。' : '没有找到匹配影片，请换一个关键词。';
      }

      if (matches.length) {
        searchResults.innerHTML = matches.map(function (movie) {
          return [
            '<article class="movie-card">',
            '<a href="' + movie.file + '" class="poster-link" aria-label="观看 ' + escapeHtml(movie.title) + '">',
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="poster-shade"></span>',
            '<span class="play-chip">播放</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<h3><a href="' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="meta-row"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + movie.year + '</span></div>',
            '<div class="tag-row"><span>' + escapeHtml(movie.category) + '</span></div>',
            '</div>',
            '</article>'
          ].join('');
        }).join('');
      } else {
        searchResults.innerHTML = '<div class="empty-state">没有找到匹配影片，请换一个关键词。</div>';
      }
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }
})();
