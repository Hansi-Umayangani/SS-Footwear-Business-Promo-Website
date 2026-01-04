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
  if (currentPage === "admin-login.html" && userMenu) {
    userMenu.classList.add("active");
  }

  // -------- Dropdown toggle --------
  if (userMenu && userDropdown) {
    userMenu.addEventListener("click", () => {
      userDropdown.style.display =
        userDropdown.style.display === "block" ? "none" : "block";
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

  // -------- Token-based Auth (NO Firebase) --------
  const adminToken = localStorage.getItem("adminToken");

  if (adminToken) {
    if (loginOption) loginOption.style.display = "none";
    if (logoutOption) logoutOption.style.display = "flex";
    if (userMenu) userMenu.classList.add("active");
  } else {
    if (loginOption) loginOption.style.display = "flex";
    if (logoutOption) logoutOption.style.display = "none";
    if (userMenu && currentPage !== "admin-login.html") {
      userMenu.classList.remove("active");
    }
  }

  if (logoutOption) {
    logoutOption.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("adminToken");
      window.location.href = "/admin-login.html";
    });
  }

  // -------- WhatsApp Contact Form --------
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
        `New Contact Form Submission\n` +
        `Name: ${firstName} ${lastName}\n` +
        `Email: ${email}\n` +
        `Phone: ${phone}\n` +
        `Subject: ${subject}\n` +
        `Message: ${message}`;

      const encodedMessage = encodeURIComponent(whatsappMessage);
      const businessNumber = "94753755005";

      const url = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent)
        ? `https://wa.me/${businessNumber}?text=${encodedMessage}`
        : `https://web.whatsapp.com/send?phone=${businessNumber}&text=${encodedMessage}`;

      window.open(url, "_blank");
      contactForm.reset();
    });
  }
});
