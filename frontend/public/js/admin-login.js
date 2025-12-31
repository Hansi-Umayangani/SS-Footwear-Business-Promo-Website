// ---------------- DOM ELEMENTS ----------------
const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("loginError");

// User dropdown elements
const userMenu = document.getElementById("userMenu");
const userDropdown = document.getElementById("userDropdown");
const loginOption = document.getElementById("loginOption");
const logoutOption = document.getElementById("logoutOption");

// Nav links
const navLinks = document.querySelectorAll(".nav-links a");

// Mobile menu
const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");


// ---------------- PAGE HIGHLIGHT ----------------
const currentPage = window.location.pathname.split("/").pop();

navLinks.forEach(link => {
  const linkPage = link.getAttribute("href")?.split("/").pop();
  if (linkPage === currentPage) {
    link.classList.add("active");
  }
});

if (currentPage === "login.html" && userMenu) {
  userMenu.classList.add("active");
}


// ---------------- USER DROPDOWN ----------------
if (userMenu && userDropdown) {
  userMenu.addEventListener("click", (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle("show");
  });

  userDropdown.addEventListener("click", (e) => {
    e.stopPropagation(); // allow clicks inside dropdown
  });

  document.addEventListener("click", () => {
    userDropdown.classList.remove("show");
  });
}


// ---------------- ADMIN AUTH STATE (JWT) ----------------
function checkAdminAuth() {
  const token = localStorage.getItem("adminToken");

  if (!loginOption || !logoutOption) return;

  if (token) {
    loginOption.style.display = "none";
    logoutOption.style.display = "flex";
  } else {
    loginOption.style.display = "flex";
    logoutOption.style.display = "none";
  }
}

checkAdminAuth();


// ---------------- HANDLE LOGIN ----------------
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("adminEmail")?.value;
    const password = document.getElementById("adminPassword")?.value;

    if (!email || !password) {
      errorMsg.textContent = "Please enter email and password";
      return;
    }

    try {
      const res = await fetch("/api/admin/login", {
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

      // Redirect
      window.location.href = "product-management.html";

    } catch (err) {
      console.error("Login failed:", err.message);
      errorMsg.textContent = "Invalid email or password";
    }
  });
}


// ---------------- HANDLE LOGOUT ----------------
if (logoutOption) {
  logoutOption.addEventListener("click", (e) => {
    e.preventDefault();

    localStorage.removeItem("adminToken");

    // Optional: close dropdown
    if (userDropdown) {
      userDropdown.classList.remove("show");
    }

    window.location.href = "login.html";
  });
}


// ---------------- MOBILE MENU ----------------
if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });
}
