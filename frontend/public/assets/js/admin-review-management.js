import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { 
  collection, query, orderBy, onSnapshot, 
  doc, deleteDoc, updateDoc, serverTimestamp, 
  addDoc, getDoc 
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Elements
const loginOption = document.getElementById("loginOption");
const logoutOption = document.getElementById("logoutOption");
const userMenu = document.getElementById("userMenu");
const userDropdown = document.getElementById("userDropdown");

// Toggle dropdown
userMenu.addEventListener("click", () => {
  userDropdown.style.display = userDropdown.style.display === "block" ? "none" : "block";
});

// Show/hide login/logout based on auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginOption.style.display = "none"; 
    logoutOption.style.display = "flex";
  } else {
    loginOption.style.display = "flex"; 
    logoutOption.style.display = "none"; 
  }
});

// Handle logout
logoutOption.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signOut(auth);
    window.location.href = "login.html"; 
  } catch (error) {
    console.error("Logout failed:", error.message);
  }
});

document.addEventListener("click", (e) => {
  if (!userMenu.contains(e.target)) {
    userDropdown.style.display = "none";
  }
});

// ---------------------- ADMIN NAV HIGHLIGHT ----------------------
document.addEventListener("DOMContentLoaded", () => {
  console.log("JS loaded, URL:", window.location.href);

  // Select the nav buttons
  const btnProducts = document.getElementById("btnProducts");
  const btnReviews = document.getElementById("btnReviews");
  const btnCustomization = document.getElementById("btnCustomization");

  const url = window.location.href;
  if (url.includes("product-management.html")) {
    btnProducts.classList.add("active");
  } else if (url.includes("review-management.html")) {
    btnReviews.classList.add("active");
  } else if (url.includes("customization-management.html")) {
    btnCustomization.classList.add("active");
  }

  // Load reviews from Firestore
  loadReviews();
});


// ---------------------- FORM ELEMENTS ----------------------
const reviewForm = document.querySelector(".review-form");
const reviewerNameInput = document.getElementById("reviewer-name"); 
const emailInput = document.getElementById("email");
const productInput = document.getElementById("product-name"); 
const ratingInput = document.getElementById("rating");
const reviewTextInput = document.getElementById("review-text");

const uploadBox = document.getElementById("upload-box");
const browseBtn = document.getElementById("browse-btn");
const fileInput = document.getElementById("product-image");
const imagePreview = document.getElementById("image-preview");
const previewImg = document.getElementById("preview-img");

const submitBtn = reviewForm?.querySelector(".submit-btn"); 
const reviewsTableBody = document.getElementById("reviewsTableBody"); 

let uploadedImageURL = "";
let editingReviewId = null;

// ---------------------- IMAGE UPLOAD (Cloudinary) ----------------------
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dvcmr9ojz/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "unsigned_preset"; // replace with your real preset


// Trigger file input
browseBtn.addEventListener("click", () => fileInput.click());

// Handle file browse
fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    uploadImageToCloudinary(e.target.files[0]);
  }
});

// Handle drag & drop
uploadBox.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadBox.classList.add("dragging");
});
uploadBox.addEventListener("dragleave", () => {
  uploadBox.classList.remove("dragging");
});
uploadBox.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadBox.classList.remove("dragging");

  if (e.dataTransfer.files.length > 0) {
    uploadImageToCloudinary(e.dataTransfer.files[0]);
  }
});

// Upload to Cloudinary
async function uploadImageToCloudinary(file) {
  if (!file.type.startsWith("image/")) {
    alert("Please select an image file.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  try {
    // Show uploading state
    previewImg.style.display = "none";
    imagePreview.style.display = "block";
    imagePreview.querySelector("p")?.remove();

    // Temporary loading text
    const loadingText = document.createElement("p");
    loadingText.textContent = "Uploading...";
    loadingText.id = "uploadingText";
    imagePreview.appendChild(loadingText);

    const res = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.secure_url) {
      uploadedImageURL = data.secure_url;

      // Show preview
      previewImg.src = uploadedImageURL;
      previewImg.style.display = "block";


      document.getElementById("uploadingText")?.remove();
    } else {
      throw new Error(data.error?.message || "Cloudinary upload failed");
    }
  } catch (error) {
    console.error("Upload error:", error);
    alert("Image upload failed. Please try again.");
    imagePreview.style.display = "none";
    uploadedImageURL = "";
  }
}


// ---------------------- FETCH AND DISPLAY REVIEWS ----------------------
function loadReviews() {
  const reviewsRef = collection(db, "reviews");
  const q = query(reviewsRef, orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    reviewsTableBody.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const review = docSnap.data();
      const id = docSnap.id;
      const { name, product, rating, reviewText, image, createdAt } = review;

      const dateStr = createdAt?.toDate ? createdAt.toDate().toLocaleString() : "";

      const numericRating = Number(rating);
      const safeRating = isNaN(numericRating) ? 0 : Math.min(Math.max(numericRating, 0), 5);

      // Build rating stars
      let starsHTML = "";
      for (let i = 1; i <= 5; i++) {
        starsHTML += `<span class="star ${i <= rating ? "filled" : ""}">★</span>`;
      }

      // Build row
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${name}</td>
        <td class="rating-stars">${starsHTML}</td>
        <td>${product || ""}</td>
        <td class="review-comment">${reviewText || ""}</td>
        <td>${dateStr}</td>
        <td>
          ${image
            ? `<button class="view-image-btn" >
                <img src="/assets/icons/image.png" alt="View" style="width:20px; height:20px;">
              </button>`
            : "No Image"}
        </td>
        <td class="actions">
          <button type="button" class="edit">Edit</button>
          <button type="button" class="delete">Delete</button>
        </td>
      `;

      // Attach event listeners with correct review id
      tr.querySelector(".edit").addEventListener("click", () => {
        console.log("Edit clicked for ID:", id);
        handleEditReview(id);
      });
      tr.querySelector(".delete").addEventListener("click", () => {
        console.log("Delete clicked for ID:", id);
        handleDeleteReview(id);
      });

      // View image button (only if image exists)
      if (image) {
        tr.querySelector(".view-image-btn").addEventListener("click", () => {
          window.open(image, "_blank"); // opens the image in a new tab
        });
      }

      reviewsTableBody.appendChild(tr);
    });
  });
}

// ---------------------- EDIT REVIEW ----------------------
async function handleEditReview(id) {
  try {
    const reviewDoc = await getDoc(doc(db, "reviews", id));
    if (!reviewDoc.exists()) {
      console.error("Review not found!");
      return;
    }

    const review = reviewDoc.data();
    console.log("Loaded review for editing:", review);

    // Fill form fields (use the exact variable names from above)
    reviewerNameInput.value = review.name || "";
    ratingInput.value = review.rating || "";
    reviewTextInput.value = review.reviewText || "";
    productInput.value = review.product || "";

    // Image preview
    if (review.image) {
      uploadedImageURL = review.image;
      previewImg.src = review.image;
      imagePreview.style.display = "block";
    } else {
      uploadedImageURL = "";
      previewImg.src = "";
      imagePreview.style.display = "none";
    }

    // Mark editing and update submit button label
    editingReviewId = id;
    if (submitBtn) submitBtn.textContent = "UPDATE REVIEW";

    // Optionally scroll form into view so admin sees it
    reviewForm.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) {
    console.error("Error loading review for editing:", error);
  }
}

// ---------------------- DELETE REVIEW ----------------------
async function handleDeleteReview(id) {
  if (confirm("Are you sure you want to delete this review?")) {
    try {
      await deleteDoc(doc(db, "reviews", id));
      console.log("Review deleted:", id);
      // if you were editing the same doc, reset the form
      if (editingReviewId === id) {
        editingReviewId = null;
        reviewForm.reset();
        uploadedImageURL = "";
        imagePreview.style.display = "none";
        if (submitBtn) submitBtn.textContent = "ADD REVIEW";
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  }
}

// ---------------------- FORM SUBMISSION ----------------------
reviewForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const reviewData = {
    name: (reviewerNameInput.value || "").trim(),
    rating: Number(ratingInput.value) || 0,
    reviewText: (reviewTextInput.value || "").trim(),
    product: (productInput.value || "").trim(),
    image: uploadedImageURL || "",
    createdAt: serverTimestamp(),
  };

  try {
    if (editingReviewId) {
      await updateDoc(doc(db, "reviews", editingReviewId), reviewData);
      console.log("Review updated:", editingReviewId);
      editingReviewId = null;
      if (submitBtn) submitBtn.textContent = "ADD REVIEW";
    } else {
      await addDoc(collection(db, "reviews"), reviewData);
      console.log("New review added");
    }

    reviewForm.reset();
    uploadedImageURL = "";
    imagePreview.style.display = "none";
  } catch (error) {
    console.error("Error saving review:", error);
  }
});