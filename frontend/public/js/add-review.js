const API_BASE = "https://ss-footwear-business-promo-website.vercel.app";

/* ---------------- DOM Ready ---------------- */
document.addEventListener("DOMContentLoaded", () => {

  /* -------- Header / Nav Logic -------- */
  const navLinks = document.querySelectorAll(".nav-links a");
  const userMenu = document.getElementById("userMenu");
  const loginOption = document.getElementById("loginOption");
  const logoutOption = document.getElementById("logoutOption");

  const currentPage = window.location.pathname.split("/").pop();

  navLinks.forEach(link => {
    const linkPage = (link.getAttribute("href") || "").split("/").pop();
    if (linkPage === currentPage) link.classList.add("active");
  });

  /* -------- SIMPLE AUTH UI (localStorage) -------- */
  /* -------- SIMPLE AUTH UI (SAFE VERSION) -------- */
const isLoggedIn = localStorage.getItem("userLoggedIn");

if (loginOption && logoutOption && userMenu) {
  if (isLoggedIn) {
    loginOption.style.display = "none";
    logoutOption.style.display = "flex";
    userMenu.classList.add("active");
  } else {
    loginOption.style.display = "flex";
    logoutOption.style.display = "none";
    userMenu.classList.remove("active");
  }
}

if (logoutOption) {
  logoutOption.addEventListener("click", () => {
    localStorage.removeItem("userLoggedIn");
    window.location.reload();
  });
}

  /* -------- Cloudinary Upload (SAFE VERSION) -------- */
  const uploadBox = document.getElementById("upload-box");
  const browseBtn = document.getElementById("browse-btn");
  const imagePreview = document.getElementById("image-preview");
  const previewImg = document.getElementById("preview-img");

  let uploadedImageURL = "";

  if (!window.cloudinary) {
    console.error("Cloudinary not loaded");
  }

  if (window.cloudinary && uploadBox && browseBtn) {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "dvcmr9ojz",
        uploadPreset: "unsigned_preset",
        multiple: false,
        folder: "reviews"
      },
      (error, result) => {
        if (error) {
          console.error("Upload error:", error);
          return;
        }

        if (result.event === "success") {
          uploadedImageURL = result.info.secure_url;
          previewImg.src = uploadedImageURL;
          imagePreview.style.display = "block";
        }
      }
    );

    uploadBox.addEventListener("click", (e) => {
      e.preventDefault();
      widget.open();
    });

    browseBtn.addEventListener("click", (e) => {
      e.preventDefault();
      widget.open();
    });
  }

  /* -------- Submit Review (Neon / PostgreSQL API) -------- */
  const reviewForm = document.querySelector(".review-form");

  if (reviewForm) {
  reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("customer-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const product = document.getElementById("product").value.trim();
    const rating = Number(document.getElementById("rating").value);
    const reviewText = document.getElementById("review-text").value.trim();

    if (!name || !email || !product || Number.isNaN(rating) || rating < 1 || rating > 5 || !reviewText) {
      alert("Please fill in all required fields correctly.");
      return;
    }

    const submitBtn = reviewForm.querySelector(".submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          product,
          rating,
          review: reviewText,
          image_url: uploadedImageURL || null
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to submit review");
        return;
      }

      alert("Review submitted successfully!");
      window.location.href = "/pages/customer/reviews.html";

    } catch (err) {
      console.error(err);
      alert("Server error. Please try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "ADD REVIEW";
    }
  });
  }
});
