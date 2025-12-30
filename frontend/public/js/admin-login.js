import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("loginError");

// Dropdown elements
const userMenu = document.getElementById("userMenu");
const userDropdown = document.getElementById("userDropdown");
const loginOption = document.getElementById("loginOption");
const logoutOption = document.getElementById("logoutOption");

// Nav links
const navLinks = document.querySelectorAll('.nav-links a');

// --- Highlight current page on user icon ---
const currentPage = window.location.pathname.split("/").pop();

// Highlight nav links
navLinks.forEach(link => {
    const linkPage = link.getAttribute('href').split("/").pop();
    if (linkPage === currentPage) {
        link.classList.add('active');
    }
});

// Highlight user icon on admin login page
if (currentPage === 'login.html') {
    userMenu.classList.add('active');
}

// Toggle dropdown on user icon click
userMenu.addEventListener("click", () => {
  userDropdown.style.display = userDropdown.style.display === "block" ? "none" : "block";
});

// Monitor login state
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginOption.style.display = "none";
    logoutOption.style.display = "flex";
  } else {
    loginOption.style.display = "flex";
    logoutOption.style.display = "none";
  }
});

// Handle login form
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Admin logged in:", userCredential.user);

    // Redirect to product management
    window.location.href = "product-management.html";
  } catch (error) {
    console.error("Login failed:", error.message);
    errorMsg.textContent = "Invalid email or password.";
  }
});

// Handle logout click
logoutOption.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signOut(auth);
    console.log("Admin logged out");
    window.location.reload(); // reload page after logout
  } catch (error) {
    console.error("Logout failed:", error.message);
  }
});

// Close dropdown if clicked outside
document.addEventListener("click", (e) => {
  if (!userMenu.contains(e.target)) {
    userDropdown.style.display = "none";
  }
});

// Mobile menu toggle
const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");

menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});
