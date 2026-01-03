document.addEventListener("DOMContentLoaded", () => {
  /* ---------------- ELEMENTS ---------------- */
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-links a");

  const loginOption = document.getElementById("loginOption");
  const logoutOption = document.getElementById("logoutOption");
  const userMenu = document.getElementById("userMenu");
  const userDropdown = document.getElementById("userDropdown");

  /* ---------------- AUTH CHECK ---------------- */
  const isAdminLoggedIn = () => !!localStorage.getItem("adminToken");
  const loggedIn = isAdminLoggedIn();

  /* ---------------- SHOW / HIDE AUTH UI ---------------- */
  if (loggedIn) {
    loginOption && (loginOption.style.display = "none");
    logoutOption && (logoutOption.style.display = "flex");
    userMenu && userMenu.classList.add("active");
  } else {
    loginOption && (loginOption.style.display = "flex");
    logoutOption && (logoutOption.style.display = "none");
    userMenu && userMenu.classList.remove("active");
  }

  /* ---------------- LOGOUT ---------------- */
  if (logoutOption) {
    logoutOption.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("adminToken");
      window.location.href = "/pages/admin/login.html";
    });
  }

  /* ---------------- DROPDOWN ---------------- */
  if (userMenu && userDropdown) {
    userMenu.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("show");
    });

    document.addEventListener("click", () => {
      userDropdown.classList.remove("show");
    });
  }

  /* ---------------- MOBILE MENU ---------------- */
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  /* ---------------- ACTIVE NAV LINK ---------------- */
  const currentPage = window.location.pathname.split("/").pop();

  navLinks.forEach((link) => {
    const linkPage = link.getAttribute("href")?.split("/").pop();
    if (linkPage === currentPage) {
      link.classList.add("active");
    }

    // Auto-close menu on mobile
    link.addEventListener("click", () => {
      navMenu && navMenu.classList.remove("active");
    });
  });
});
