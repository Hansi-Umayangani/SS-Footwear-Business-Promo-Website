// ====================== ADMIN NAV HIGHLIGHT ======================
document.addEventListener("DOMContentLoaded", () => {
  const btnProducts = document.getElementById("btnProducts");
  const btnReviews = document.getElementById("btnReviews");
  const btnCustomization = document.getElementById("btnCustomization");

  const url = window.location.href;
  if (url.includes("product-management.html")) btnProducts.classList.add("active");
  else if (url.includes("review-management.html")) btnReviews.classList.add("active");
  else if (url.includes("customization-management.html")) btnCustomization.classList.add("active");

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
  const res = await fetch("/api/reviews/admin");
  const reviews = await res.json();

  reviewsTableBody.innerHTML = "";

  reviews.forEach((review) => {
    const tr = document.createElement("tr");

    const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

    tr.innerHTML = `
      <td>${review.name}</td>
      <td class="rating-stars">${stars}</td>
      <td>${review.product}</td>
      <td class="review-comment">${review.reviewText}</td>
      <td>${new Date(review.createdAt).toLocaleString()}</td>

      <td class="review-image-cell">
        ${
          review.image
            ? `
              <button type="button" class="view-image-btn">
                <img src="/assets/icons/image.png" alt="View image">
              </button>
            `
            : "No Image"
        }
      </td>

      <td class="actions">
        <button type="button" class="edit"></button>
        <button type="button" class="delete"></button>
      </td>
    `;

    if (review.image) {
      tr.querySelector(".view-image-btn").onclick = () => {
        window.open(review.image, "_blank");
      };
    }

    tr.querySelector(".edit").onclick = () => fillFormForEdit(review);
    tr.querySelector(".delete").onclick = () => deleteReview(review._id);

    reviewsTableBody.appendChild(tr);
  });
}

// ====================== EDIT REVIEW ======================
function fillFormForEdit(review) {
  reviewerNameInput.value = review.name;
  productInput.value = review.product;
  ratingInput.value = review.rating;
  reviewTextInput.value = review.reviewText;

  uploadedImageURL = review.image || "";
  if (uploadedImageURL) {
    previewImg.src = uploadedImageURL;
    imagePreview.style.display = "block";
  }

  editingReviewId = review._id;
  submitBtn.textContent = "UPDATE REVIEW";
  reviewForm.scrollIntoView({ behavior: "smooth" });
}

// ====================== DELETE REVIEW ======================
async function deleteReview(id) {
  if (!confirm("Are you sure you want to delete this review?")) return;

  await fetch(`/api/reviews/admin/${id}`, { method: "DELETE" });
  loadReviews();
}

// ====================== ADD / UPDATE REVIEW ======================
reviewForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name: reviewerNameInput.value.trim(),
    product: productInput.value.trim(),
    rating: Number(ratingInput.value),
    reviewText: reviewTextInput.value.trim(),
    image: uploadedImageURL
  };

  const url = editingReviewId
    ? `/api/reviews/admin/${editingReviewId}`
    : "/api/reviews";

  const method = editingReviewId ? "PUT" : "POST";

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
