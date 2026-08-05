const year = document.querySelector("#year");
if (year) {
  year.textContent = new Date().getFullYear();
}

const video = document.querySelector(".background-video");
if (video) {
  video.addEventListener("error", () => {
    video.style.display = "none";
  });
}
