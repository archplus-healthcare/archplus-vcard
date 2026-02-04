document.addEventListener("DOMContentLoaded", () => {
  document.body.style.opacity = "0";
  document.body.style.transition = "opacity 0.8s ease";

  setTimeout(() => {
    document.body.style.opacity = "1";
  }, 120);
});
