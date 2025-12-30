import { auth, db } from "./firebase-config.js"; 
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { collection, addDoc, serverTimestamp} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// ---------------------- DOM ELEMENTS ----------------------
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-links a");
  const userMenu = document.getElementById("userMenu");
  const userDropdown = document.getElementById("userDropdown");
  const loginOption = document.getElementById("loginOption");
  const logoutOption = document.getElementById("logoutOption");
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const customForm = document.getElementById("customRequestForm");

  const currentPage = window.location.pathname.split("/").pop();

// -------- Highlight nav link --------
  navLinks.forEach(link => {
    const linkPage = link.getAttribute("href").split("/").pop();
    if (linkPage === currentPage) link.classList.add("active");
  });

  if (currentPage === "admin-login.html") 
    userMenu.classList.add("active");

  if (userMenu && userDropdown) {
    userMenu.addEventListener("click", () => {
      userDropdown.style.display = userDropdown.style.display === "block" ? "none" : "block";
    });
    document.addEventListener("click", (e) => {
      if (!userMenu.contains(e.target)) userDropdown.style.display = "none";
    });
  }

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  // ---------------------- FIREBASE AUTH ----------------------
  if (auth) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        if (loginOption) loginOption.style.display = "none";
        if (logoutOption) logoutOption.style.display = "flex";
        if (userMenu) userMenu.classList.add("active");
      } else {
        if (loginOption) loginOption.style.display = "flex";
        if (logoutOption) logoutOption.style.display = "none";
        if (userMenu && currentPage !== "admin-login.html") userMenu.classList.remove("active");
      }
    });

    // ---------------------- LOGOUT ----------------------
    if (logoutOption) {
      logoutOption.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await signOut(auth);
          window.location.reload();
        } catch (err) {
          console.error("Logout failed:", err);
        }
      });
    }
  }
  
  // ---------------------- CUSTOMIZATION FORM SUBMISSION ----------------------
  if (customForm) {
    customForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Get form values
      const customerName = document.getElementById("customerName")?.value.trim() || "";
      const contactNumber = document.getElementById("contactNumber")?.value.trim() || "";
      const emailAddress = document.getElementById("emailAddress")?.value.trim() || "";
      const productType = document.getElementById("productType")?.value.trim() || "";
      const customDetails = document.getElementById("customDetails")?.value.trim() || "";
      const contactMethod = document.querySelector('input[name="contactMethod"]:checked')?.value || "";

      try {
        // Add a new document in the 'customRequests' collection
        await addDoc(collection(db, "customRequests"), {
          customerName,
          contactNumber,
          emailAddress,
          productType,
          customDetails,
          contactMethod,
          status: "Pending",
          timestamp: serverTimestamp()
        });

        alert("Your customization request has been submitted successfully!");
        customForm.reset();
      } catch (err) {
        console.error("Error submitting request:", err);
        alert("Failed to submit request. Please try again.");
      }
    });
  }
});