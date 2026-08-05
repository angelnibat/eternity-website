const year = document.querySelector("#year");
year.textContent = new Date().getFullYear();

const video = document.querySelector(".background-video");
video.addEventListener("error", () => {
  video.style.display = "none";
});

const playButton = document.querySelector(".play-button");
const playIcon = playButton.querySelector(".play-icon");
let isPlaying = false;

playButton.addEventListener("click", () => {
  isPlaying = !isPlaying;
  playIcon.textContent = isPlaying ? "❚❚" : "▶";
  playButton.setAttribute("aria-label", isPlaying ? "Pause preview" : "Play preview");
});

document.querySelectorAll("[data-edit-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (link.getAttribute("href") === "#") {
      event.preventDefault();
      alert("Replace this # with your real link inside index.html.");
    }
  });
});
