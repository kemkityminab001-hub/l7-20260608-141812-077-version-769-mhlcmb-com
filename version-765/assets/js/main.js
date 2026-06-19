document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var previous = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    var showSlide = function (nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    var start = function () {
      stop();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    };

    var stop = function () {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        start();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        showSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        start();
      });
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    showSlide(0);
    start();
  }

  var filterBars = Array.prototype.slice.call(document.querySelectorAll(".filter-bar"));

  filterBars.forEach(function (bar) {
    var parent = bar.parentElement;
    var scope = parent ? parent.querySelector(".js-filter-scope") : null;
    var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll(".js-movie-card")) : [];
    var searchInput = bar.querySelector(".js-page-search");
    var yearSelect = bar.querySelector(".js-year-filter");
    var typeSelect = bar.querySelector(".js-type-filter");

    var applyFilter = function () {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-text") || "").toLowerCase();
        var title = (card.getAttribute("data-title") || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var keywordMatch = !keyword || text.indexOf(keyword) !== -1 || title.indexOf(keyword) !== -1;
        var yearMatch = !year || cardYear === year;
        var typeMatch = !type || cardType === type;

        card.classList.toggle("is-hidden", !(keywordMatch && yearMatch && typeMatch));
      });
    };

    if (searchInput) {
      searchInput.addEventListener("input", applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilter);
    }

    if (typeSelect) {
      typeSelect.addEventListener("change", applyFilter);
    }
  });

  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (player) {
    var video = player.querySelector("video");
    var overlay = player.querySelector(".video-overlay");
    var source = video ? video.getAttribute("data-src") : "";
    var prepared = false;
    var hls = null;

    var prepare = function () {
      if (!video || !source || prepared) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }

      prepared = true;
    };

    var play = function () {
      prepare();
      player.classList.add("is-ready");

      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          player.classList.remove("is-ready");
        });
      }
    };

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });

      video.addEventListener("play", function () {
        player.classList.add("is-ready");
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
});
