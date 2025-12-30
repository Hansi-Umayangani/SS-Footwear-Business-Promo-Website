document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-links a");

  // Safety check
  if (!menuToggle || !navMenu) {
    console.warn("Menu toggle or nav menu not found");
    return;
  }

  /* -------- MOBILE MENU TOGGLE -------- */
  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });

  /* -------- ACTIVE NAV LINK -------- */
  const currentPath = window.location.pathname;

  navLinks.forEach((link) => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    }
  });

  /* -------- AUTO CLOSE MENU ON MOBILE -------- */
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active");
    });
  });
});
