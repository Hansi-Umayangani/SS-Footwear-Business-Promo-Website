import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { db } from "./firebase-config.js";
import { collection, query, orderBy, onSnapshot, limit } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";


// -------- Header / Nav Highlight Logic --------
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-links a");
  const userMenu = document.getElementById("userMenu");
  const userDropdown = document.getElementById("userDropdown");
  const loginOption = document.getElementById("loginOption");
  const logoutOption = document.getElementById("logoutOption");
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const featuredContainer = document.querySelector(".product-list");

  if (!featuredContainer) return;

  // Current page filename
  const productsCollection = collection(db, "products");

  // -------- Highlight nav link --------
  const currentPage = window.location.pathname.split("/").pop();
  navLinks.forEach(link => {
    const linkPage = link.getAttribute("href").split("/").pop();
    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });

  // -------- Highlight user icon --------
  if (currentPage === "admin-login.html") {
    userMenu.classList.add("active");
  }

  // -------- Dropdown toggle --------
  if (userMenu && userDropdown) {
  userMenu.addEventListener("click", () => {
    userDropdown.style.display = userDropdown.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (e) => {
    if (!userMenu.contains(e.target)) 
      userDropdown.style.display = "none";
  });
}

  // -------- Mobile menu toggle --------
  if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => { navMenu.classList.toggle("active")});
  }

  // -------- Featured Products Logic --------
  function loadFeaturedProducts() {
    const q = query(productsCollection, orderBy("createdAt", "desc"), limit(6));

    onSnapshot(q, (snapshot) => {
      console.log("Snapshot received:", snapshot.size);

      if (snapshot.empty) {
        console.warn("No products found in Firestore.");
        featuredContainer.innerHTML = "<p>No featured products found.</p>";
        return;
      }

      featuredContainer.innerHTML = "";

      snapshot.docs.forEach(docSnap => {
        const product = docSnap.data();
        console.log("Product fetched:", product);

        const card = document.createElement("div");
        card.classList.add("product-card");

        card.innerHTML = `
          <img src="${product.imageURL}" alt="${product.name}" />
          <h4>${product.name}</h4>
          <p>${product.description}</p>
        `;

        featuredContainer.appendChild(card);
      });
    }, (error) => {
      console.error("Firestore fetch error:", error);
      featuredContainer.innerHTML = "<p>Failed to load featured products.</p>";
    });
  }

  loadFeaturedProducts();


  // -------- Firebase Auth (optional if login/logout is needed) --------
  if (typeof auth !== "undefined") {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        if (loginOption) loginOption.style.display = "none";
        if (logoutOption) logoutOption.style.display = "flex";
        if (userMenu) userMenu.classList.add("active");
      } else {
        if (loginOption) loginOption.style.display = "flex";
        if (logoutOption) logoutOption.style.display = "none";
        if(currentPage !== "admin-login.html") {
          userMenu.classList.remove("active");
        }
      }
    });
  }
});
