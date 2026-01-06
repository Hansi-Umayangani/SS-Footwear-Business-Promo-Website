const API_BASE = "https://ss-footwear-business-website.vercel.app";

document.addEventListener("DOMContentLoaded", () => {
  /* ---------------- DOM ELEMENTS ---------------- */
  const loginForm = document.getElementById("loginForm");
  const errorMsg = document.getElementById("loginError");

  const userMenu = document.getElementById("userMenu");
  const userDropdown = document.getElementById("userDropdown");
  const loginOption = document.getElementById("loginOption");
  const logoutOption = document.getElementById("logoutOption");

  const navLinks = document.querySelectorAll(".nav-links a");
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");

  /* ---------------- HELPER ---------------- */
  const isAdminLoggedIn = () => !!localStorage.getItem("adminToken");

  /* ---------------- ACTIVE NAV LINK ---------------- */
  const currentPage = window.location.pathname.split("/").pop();

  navLinks.forEach((link) => {
    const linkPage = link.getAttribute("href")?.split("/").pop();
    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });

  /* ---------------- AUTH UI STATE ---------------- */
  function updateAuthUI() {
    if (!loginOption || !logoutOption) return;

    if (isAdminLoggedIn()) {
      loginOption.style.display = "none";
      logoutOption.style.display = "flex";
      userMenu && userMenu.classList.add("active");
    } else {
      loginOption.style.display = "flex";
      logoutOption.style.display = "none";
      userMenu && userMenu.classList.remove("active");
    }
  }

  updateAuthUI();

  /* ---------------- USER DROPDOWN ---------------- */
  if (userMenu && userDropdown) {
    userMenu.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("show");
    });

    document.addEventListener("click", () => {
      userDropdown.classList.remove("show");
    });
  }

  /* ---------------- LOGIN ---------------- */
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("adminEmail")?.value.trim();
      const password = document.getElementById("adminPassword")?.value.trim();

      if (!email || !password) {
        errorMsg.textContent = "Please enter email and password";
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/admin/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Login failed");
        }

        // Save JWT
        localStorage.setItem("adminToken", data.token);

        // Redirect to admin dashboard
        window.location.href = "product-management.html";

      } catch (err) {
        console.error("Login failed:", err);
        errorMsg.textContent = "Invalid email or password";
      }
    });
  }

  /* ---------------- LOGOUT ---------------- */
  if (logoutOption) {
    logoutOption.addEventListener("click", (e) => {
      e.preventDefault();

      localStorage.removeItem("adminToken");
      userDropdown && userDropdown.classList.remove("show");

      window.location.href = "login.html";
    });
  }

  /* ---------------- MOBILE MENU ---------------- */
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }
});
