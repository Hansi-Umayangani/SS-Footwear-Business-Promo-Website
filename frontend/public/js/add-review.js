import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } 
  from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

/* ---------------- DOM Ready ---------------- */
document.addEventListener("DOMContentLoaded", () => {

  /* -------- Header / Nav Logic -------- */
  const navLinks = document.querySelectorAll(".nav-links a");
  const userMenu = document.getElementById("userMenu");
  const userDropdown = document.getElementById("userDropdown");
  const loginOption = document.getElementById("loginOption");
  const logoutOption = document.getElementById("logoutOption");
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");

  const currentPage = window.location.pathname.split("/").pop();

  navLinks.forEach(link => {
    const linkPage = (link.getAttribute("href") || "").split("/").pop();
    if (linkPage === currentPage) link.classList.add("active");
  });

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  /* -------- Firebase Auth (ONLY UI state) -------- */
  if (auth && onAuthStateChanged) {
    onAuthStateChanged(auth, (user) => {
      if (!loginOption || !logoutOption || !userMenu) return;

      if (user) {
        loginOption.style.display = "none";
        logoutOption.style.display = "flex";
        userMenu.classList.add("active");
      } else {
        loginOption.style.display = "flex";
        logoutOption.style.display = "none";
        userMenu.classList.remove("active");
      }
    });

    if (logoutOption) {
      logoutOption.addEventListener("click", async (e) => {
        e.preventDefault();
        await signOut(auth);
        window.location.reload();
      });
    }
  }

  /* -------- Cloudinary Upload -------- */
  const uploadBox = document.getElementById("upload-box");
  const browseBtn = document.getElementById("browse-btn");
  const imagePreview = document.getElementById("image-preview");
  const previewImg = document.getElementById("preview-img");

  let uploadedImageURL = "";

  if (window.cloudinary && uploadBox) {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "dvcmr9ojz",
        uploadPreset: "unsigned_preset",
        multiple: false,
        folder: "reviews"
      },
      (err, result) => {
        if (result?.event === "success") {
          uploadedImageURL = result.info.secure_url;
          previewImg.src = uploadedImageURL;
          imagePreview.style.display = "block";
        }
      }
    );

    uploadBox.addEventListener("click", () => widget.open());
    if (browseBtn) browseBtn.addEventListener("click", () => widget.open());
  }

  /* -------- Submit Review (MongoDB API) -------- */
  const reviewForm = document.querySelector(".review-form");

  if (reviewForm) {
    reviewForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("customer-name").value.trim();
      const email = document.getElementById("email").value.trim();
      const product = document.getElementById("product").value.trim();
      const rating = Number(document.getElementById("rating").value);
      const reviewText = document.getElementById("review-text").value.trim();

      if (!name || !email || !product || !rating || !reviewText) {
        alert("⚠️ Please fill in all required fields.");
        return;
      }

      if (rating < 1 || rating > 5) {
        alert("⚠️ Rating must be between 1 and 5.");
        return;
      }

      const submitBtn = reviewForm.querySelector(".submit-btn");
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";

      try {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            product,
            rating,
            reviewText,
            image: uploadedImageURL
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        alert("✅ Review submitted successfully!");
        window.location.href = "/pages/customer/reviews.html";

      } catch (err) {
        console.error(err);
        alert("❌ Failed to submit review.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "ADD REVIEW";
      }
    });
  }
});
