import { H as Hls } from "./hls.js";

const fallbackStreams = [
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e398cb38b257828eeedbcaa0ae2856da/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/77ae15566dde5cfb920bae4712a38399/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/41cb67b47a3668efaea014219666e659/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/31227358d3c181b7168e28ad248cfb4e/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/d0af4221b8947fda8c23f4955947cb58/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e70b98acb53eb889d108057988609efb/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/86ea18f9954dbaf22eff5e16c41b4a25/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/2df81e778442675885257ce3e84c7173/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/af3d3f3b4940cee04efcd8ff2c9eef0a/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/60b4ddb3d166e1239abfc7adf611a6a3/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/a27121d514ff0079e1e81a6678f14e0c/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/f0d38b8679a1231eff816a8e04cc1a0c/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/c66b5309b3b64d15ed856810d6cc0b72/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/c99d86ece73a935b77e57d322461ddb5/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/fe0c41d994d01211debb24e84e3384a9/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/929fdb8e536c1fc43a83b32d1a838547/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/fbc04ae173a0e633458658e80ee78c2a/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/0ba4f146b0e6ea192526706f495d460f/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/1e53f0e1aef7ec2fb5f30ef5d309d69c/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/1116997bf50b78f22bbfaced8975a021/manifest/video.m3u8"
];

function getRoot() {
  return document.body.dataset.root || "";
}

function initMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-nav-panel]");
  if (!toggle || !panel) {
    return;
  }
  toggle.addEventListener("click", () => {
    panel.classList.toggle("open");
  });
}

function initHero() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  if (slides.length === 0) {
    return;
  }

  let index = 0;
  let timer = null;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === index);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(() => show(index + 1), 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => {
      show(dotIndex);
      start();
    });
  });

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  show(0);
  start();
}

function initPageFilter() {
  const filterWrap = document.querySelector("[data-page-filter]");
  const list = document.querySelector("[data-filter-list]");
  if (!filterWrap || !list) {
    return;
  }

  const input = filterWrap.querySelector("input");
  const cards = Array.from(list.querySelectorAll(".movie-card"));
  if (!input) {
    return;
  }

  input.addEventListener("input", () => {
    const keyword = input.value.trim().toLowerCase();
    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      card.classList.toggle("is-hidden-by-filter", keyword.length > 0 && !text.includes(keyword));
    });
  });
}

function initPlayers() {
  const players = Array.from(document.querySelectorAll("[data-player]"));
  players.forEach((player) => {
    const video = player.querySelector("video");
    const button = player.querySelector("[data-play-button]");
    const message = player.querySelector("[data-player-message]");
    if (!video || !button) {
      return;
    }

    let hls = null;
    const index = Number.parseInt(player.dataset.streamIndex || "0", 10);
    const stream = player.dataset.stream || fallbackStreams[index % fallbackStreams.length];

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function playVideo() {
      if (!stream) {
        setMessage("当前条目没有可用播放源。");
        return;
      }

      player.classList.add("is-playing");
      video.setAttribute("controls", "controls");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.play().catch(() => setMessage("浏览器阻止自动播放，请再次点击播放器播放。"));
        setMessage("已加载播放源。");
        return;
      }

      if (Hls.isSupported()) {
        if (hls) {
          hls.destroy();
        }
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => setMessage("播放源已加载，请点击视频控件播放。"));
          setMessage("HLS 播放器已初始化。");
        });
        hls.on(Hls.Events.ERROR, (eventName, data) => {
          if (data && data.fatal) {
            setMessage("播放源加载失败，可更换播放源或稍后重试。");
          }
        });
        return;
      }

      setMessage("当前浏览器不支持 HLS 播放。");
    }

    button.addEventListener("click", playVideo, { once: false });
  });
}

function cardTemplate(movie) {
  const root = getRoot();
  const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  return `
    <article class="movie-card">
      <a class="movie-poster-link" href="${root}movies/${movie.filename}" aria-label="观看 ${escapeHtml(movie.title)}">
        <div class="poster-frame" data-title="${escapeHtml(movie.title)}">
          <img src="${root}${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy" onerror="this.parentElement.classList.add('image-missing'); this.remove();">
        </div>
      </a>
      <div class="movie-card-body">
        <div class="movie-meta-row">
          <span>${escapeHtml(movie.year_text)}</span>
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(movie.type)}</span>
        </div>
        <h3><a href="${root}movies/${movie.filename}">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(movie.one_line || movie.summary || "")}</p>
        <div class="tag-list">${tags}</div>
        <a class="text-link" href="${root}categories/${movie.category_slug}.html">${escapeHtml(movie.category_name)}</a>
      </div>
    </article>`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function initSearchPage() {
  const page = document.querySelector("[data-search-page]");
  if (!page) {
    return;
  }

  const form = page.querySelector("form");
  const input = page.querySelector("input[name='q']");
  const status = page.querySelector("[data-search-status]");
  const results = page.querySelector("[data-search-results]");
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";
  let movies = [];

  if (input) {
    input.value = initialQuery;
  }

  try {
    const response = await fetch(`${getRoot()}data/search-index.json`);
    movies = await response.json();
  } catch (error) {
    if (status) {
      status.textContent = "搜索索引加载失败。";
    }
    return;
  }

  function runSearch(query) {
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      if (status) {
        status.textContent = `共 ${movies.length} 部内容，可输入关键词筛选。`;
      }
      if (results) {
        results.innerHTML = movies.slice(0, 36).map(cardTemplate).join("");
      }
      return;
    }

    const matched = movies.filter((movie) => movie.search_text.includes(keyword));
    if (status) {
      status.textContent = `找到 ${matched.length} 条与“${query}”相关的内容。`;
    }
    if (results) {
      results.innerHTML = matched.slice(0, 120).map(cardTemplate).join("");
    }
  }

  if (form && input) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = input.value.trim();
      const url = new URL(window.location.href);
      if (query) {
        url.searchParams.set("q", query);
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState(null, "", url.toString());
      runSearch(query);
    });

    input.addEventListener("input", () => runSearch(input.value));
  }

  runSearch(initialQuery);
}

document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initHero();
  initPageFilter();
  initPlayers();
  initSearchPage();
});
