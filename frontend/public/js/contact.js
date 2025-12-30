import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-links a");
  const userMenu = document.getElementById("userMenu");
  const userDropdown = document.getElementById("userDropdown");
  const loginOption = document.getElementById("loginOption");
  const logoutOption = document.getElementById("logoutOption");
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const contactForm = document.querySelector(".review-form");

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
  if (userMenu) {
    userMenu.addEventListener("click", () => {
      userDropdown.style.display = userDropdown.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (!userMenu.contains(e.target)) {
        userDropdown.style.display = "none";
      }
    });
  }

  // -------- Mobile menu toggle --------
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }  
  // -------- Firebase Auth --------
  if (typeof auth !== "undefined") {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        if (loginOption) loginOption.style.display = "none";
        if (logoutOption) logoutOption.style.display = "flex";
        if (userMenu) userMenu.classList.add("active");
      } else {
        if (loginOption) loginOption.style.display = "flex";
        if (logoutOption) logoutOption.style.display = "none";
        if(currentPage !== "admin-login.html" && userMenu) {
          userMenu.classList.remove("active");
        }
      }
    });

    if (logoutOption) {
      logoutOption.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await signOut(auth);
          window.location.reload();
        } catch (error) {
          console.error(error);
        }
      });
    }
  }

  // -------- WhatsApp Contact Form Submission --------
 if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const firstName = document.getElementById("first-name").value.trim();
      const lastName = document.getElementById("last-name").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const subject = document.getElementById("subject").value;
      const message = document.getElementById("message").value.trim();

      const whatsappMessage = 
  "New Contact Form Submission%0A" +
  "Name: " + firstName + " " + lastName + "%0A" +
  "Email: " + email + "%0A" +
  "Phone: " + phone + "%0A" +
  "Subject: " + subject + "%0A" +
  "Message: " + message;

      const encodedMessage = encodeURIComponent(whatsappMessage);

      const businessNumber = "94753755005";

      if (/Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent)) {
      
        window.open(`https://wa.me/94753755005?text=${whatsappMessage}`, "_blank");
      } else {

        window.open(`https://web.whatsapp.com/send?phone=94753755005&text=${whatsappMessage}`, "_blank");
      }

      window.open(whatsappURL, "_blank");

      contactForm.reset();
    });
  }
});