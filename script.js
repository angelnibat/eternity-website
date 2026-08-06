
const FALLBACK_CONFIG_URL = "./site-config.json";

function getYouTubeId(url) {
  if (!url) return "";
  const value = url.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1];
  }
  return /^[\w-]{11}$/.test(value) ? value : "";
}

async function loadConfig() {
  let fallback = {};
  try {
    fallback = await fetch(FALLBACK_CONFIG_URL, { cache: "no-store" }).then((response) => response.json());
  } catch (error) {
    console.warn("Could not load fallback configuration.", error);
  }

  try {
    const live = await fetch("/api/config", { cache: "no-store" });
    if (live.ok) {
      return { ...fallback, ...(await live.json()) };
    }
  } catch (error) {
    console.info("Dashboard API is not configured yet; using site-config.json.");
  }

  return fallback;
}

function applyConfig(config) {
  document.querySelectorAll("[data-config]").forEach((element) => {
    const key = element.dataset.config;
    if (Object.prototype.hasOwnProperty.call(config, key)) {
      element.textContent = config[key] ?? "";
    }
  });

  document.querySelectorAll("[data-link]").forEach((element) => {
    const key = element.dataset.link;
    if (config[key]) {
      element.href = config[key];
      element.target = "_blank";
      element.rel = "noopener noreferrer";
    }
  });

  document.querySelectorAll("[data-image]").forEach((element) => {
    const key = element.dataset.image;
    if (config[key]) element.src = config[key];
  });

  document.querySelectorAll("[data-video-source]").forEach((source) => {
    const key = source.dataset.videoSource;
    if (config[key]) source.src = config[key];
  });

  document.querySelectorAll("video").forEach((video) => video.load());

  const videoSection = document.querySelector(".latest-video");
  if (videoSection) {
    videoSection.hidden = config.videoVisible === false;
  }

  const aboutSection = document.querySelector(".about-panel");
  if (aboutSection) {
    aboutSection.hidden = config.aboutVisible === false;
  }

  const videoId = getYouTubeId(config.youtubeVideoUrl);
  const iframe = document.querySelector("#latest-video-frame");
  if (iframe && videoId) {
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();

  const config = await loadConfig();
  applyConfig(config);
});


function setupSectionReveals() {
  const sections = document.querySelectorAll(".reveal-section");
  if (!sections.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    sections.forEach((section) => section.classList.add("is-visible"));
    return;
  }

  document.documentElement.classList.add("js-reveal-ready");

  const observer = new IntersectionObserver(
    (entries, revealObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  sections.forEach((section) => observer.observe(section));
}

window.addEventListener("load", setupSectionReveals);
