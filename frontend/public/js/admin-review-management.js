const API_BASE = "";

// ====================== ADMIN NAV HIGHLIGHT ======================
document.addEventListener("DOMContentLoaded", () => {
  const btnProducts = document.getElementById("btnProducts");
  const btnReviews = document.getElementById("btnReviews");
  const btnCustomization = document.getElementById("btnCustomization");

  const url = window.location.href;
  if (url.includes("product-management.html")) btnProducts?.classList.add("active");
  else if (url.includes("review-management.html")) btnReviews?.classList.add("active");
  else if (url.includes("customization-management.html")) btnCustomization?.classList.add("active");

  loadReviews();
});

// ====================== FORM ELEMENTS ======================
const reviewForm = document.querySelector(".review-form");
const reviewerNameInput = document.getElementById("reviewer-name");
const productInput = document.getElementById("product-name");
const ratingInput = document.getElementById("rating");
const reviewTextInput = document.getElementById("review-text");

const uploadBox = document.getElementById("upload-box");
const browseBtn = document.getElementById("browse-btn");
const fileInput = document.getElementById("product-image");
const imagePreview = document.getElementById("image-preview");
const previewImg = document.getElementById("preview-img");

const submitBtn = reviewForm.querySelector(".submit-btn");
const reviewsTableBody = document.getElementById("reviewsTableBody");

let uploadedImageURL = "";
let editingReviewId = null;

// ====================== USER DROPDOWN & AUTH ======================
const userMenu = document.getElementById("userMenu");
const userDropdown = document.getElementById("userDropdown");
const loginOption = document.getElementById("loginOption");
const logoutOption = document.getElementById("logoutOption");

// Toggle dropdown
if (userMenu && userDropdown) {
  userMenu.addEventListener("click", (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    userDropdown.classList.remove("show");
  });
}

// Admin auth (localStorage)
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

if (logoutOption) {
  logoutOption.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("adminToken");
    window.location.href = "login.html";
  });
}

// ====================== CLOUDINARY UPLOAD ======================
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dvcmr9ojz/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "unsigned_preset";

browseBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) uploadImageToCloudinary(e.target.files[0]);
});

uploadBox.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadBox.classList.add("dragging");
});

uploadBox.addEventListener("dragleave", () => uploadBox.classList.remove("dragging"));

uploadBox.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadBox.classList.remove("dragging");
  if (e.dataTransfer.files.length > 0) uploadImageToCloudinary(e.dataTransfer.files[0]);
});

async function uploadImageToCloudinary(file) {
  if (!file.type.startsWith("image/")) return alert("Please select an image");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  try {
    const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
    const data = await res.json();

    uploadedImageURL = data.secure_url;
    previewImg.src = uploadedImageURL;
    imagePreview.style.display = "block";
  } catch (err) {
    alert("Image upload failed");
    uploadedImageURL = "";
  }
}

// ====================== LOAD REVIEWS (ADMIN) ======================
async function loadReviews() {
  const res = await fetch(`${API_BASE}/api/reviews/admin`);
  const reviews = await res.json();

  reviewsTableBody.innerHTML = "";

  reviews.forEach((review) => {
    const tr = document.createElement("tr");

    const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

    tr.innerHTML = `
      <td>${review.name}</td>
      <td class="rating-stars">${stars}</td>
      <td>${review.product}</td>
      <td class="review-comment">${review.review_text}</td>
      <td>${new Date(review.created_at).toLocaleString()}</td>

      <td class="review-image-cell">
        ${
          review.image_url
            ? `<button type="button" class="view-image-btn">
                 <img src="/assets/icons/image.png" alt="View image">
               </button>`
            : "No Image"
        }
      </td>

      <td class="actions">
        <button type="button" class="edit"></button>
        <button type="button" class="delete"></button>
      </td>
    `;

    if (review.image_url) {
      tr.querySelector(".view-image-btn").onclick = () => {
        window.open(review.image_url, "_blank");
      };
    }

    tr.querySelector(".edit").onclick = () => fillFormForEdit(review);
    tr.querySelector(".delete").onclick = () => deleteReview(review.id);

    reviewsTableBody.appendChild(tr);
  });
}

// ====================== EDIT REVIEW ======================
function fillFormForEdit(review) {
  reviewerNameInput.value = review.name;
  productInput.value = review.product;
  ratingInput.value = review.rating;
  reviewTextInput.value = review.review_text;

  uploadedImageURL = review.image_url || "";
  if (uploadedImageURL) {
    previewImg.src = uploadedImageURL;
    imagePreview.style.display = "block";
  }

  editingReviewId = review.id;
  submitBtn.textContent = "UPDATE REVIEW";
  reviewForm.scrollIntoView({ behavior: "smooth" });
}

// ====================== DELETE REVIEW ======================
async function deleteReview(id) {
  if (!confirm("Are you sure you want to delete this review?")) return;

  await fetch(`https://ss-footwear-business-promo-website.vercel.app/api/reviews/admin/${id}`, { method: "DELETE" });
  loadReviews();
}

  // ====================== ADD / UPDATE REVIEW ======================
  reviewForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  let payload;
  let url;
  let method;

  if (editingReviewId) {
    const reviewText = reviewTextInput.value.trim();
    if (!reviewText) {
      alert("Review text cannot be empty");
      return;
    }

    payload = {
      rating: Number(ratingInput.value),
      review_text: reviewText,
      product: productInput.value.trim()
    };

    url = `/api/reviews/admin/${editingReviewId}`;
    method = "PUT";

  } else {
    payload = {
      name: reviewerNameInput.value.trim(),
      email: reviewerEmailInput.value.trim(), // if required
      product: productInput.value.trim(),
      rating: Number(ratingInput.value),
      review: reviewTextInput.value.trim(),
      image_url: uploadedImageURL
    };

    url = "/api/reviews";
    method = "POST";
  }

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  reviewForm.reset();
  imagePreview.style.display = "none";
  uploadedImageURL = "";
  editingReviewId = null;
  submitBtn.textContent = "ADD REVIEW";

  loadReviews();
});

