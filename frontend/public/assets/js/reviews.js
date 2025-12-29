import { db } from "./firebase-config.js"; 
import { collection, query, orderBy, onSnapshot } 
  from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-links a");
  const userMenu = document.getElementById("userMenu");
  const userDropdown = document.getElementById("userDropdown");
  const loginOption = document.getElementById("loginOption");
  const logoutOption = document.getElementById("logoutOption");
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const reviewsContainer = document.querySelector(".reviews-container");

  // IDs for review analysis section
  const overallRateEl = document.getElementById("overall-rate");
  const overallStarsEl = document.getElementById("overall-stars");
  const reviewsCountEl = document.getElementById("reviews-count");
  const recommendationEl = document.getElementById("recommendation-percentage");

  const barFills = {
    5: document.getElementById("bar-5"),
    4: document.getElementById("bar-4"),
    3: document.getElementById("bar-3"),
    2: document.getElementById("bar-2"),
    1: document.getElementById("bar-1")
  };

  const barCounts = {
    5: document.getElementById("count-5"),
    4: document.getElementById("count-4"),
    3: document.getElementById("count-3"),
    2: document.getElementById("count-2"),
    1: document.getElementById("count-1")
  };


// -------- Highlight nav link --------
  const currentPage = window.location.pathname.split("/").pop();
  navLinks.forEach(link => {
    const linkPage = link.getAttribute("href").split("/").pop();
    if (linkPage === currentPage) link.classList.add("active");
  });

  // -------- User dropdown toggle --------
  if (userMenu && userDropdown) {
    userMenu.addEventListener("click", () => {
      userDropdown.style.display =
        userDropdown.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (!userMenu.contains(e.target)) userDropdown.style.display = "none";
    });
  }

  // -------- Menu toggle (FIX ADDED) --------
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  // -------- Utility: format "time ago" --------
  function timeAgo(timestamp) {
    if (!timestamp) return "";

    const seconds = (Date.now() - timestamp.toDate()) / 1000;
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;

    if (days >= 1) return `${Math.floor(days)} day(s) ago`;
    if (hours >= 1) return `${Math.floor(hours)} hour(s) ago`;
    if (minutes >= 1) return `${Math.floor(minutes)} min(s) ago`;
    return "Just now";
  }

  // -------- Render stars --------
  function renderStars(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
      stars += `<span class="star ${i <= rating ? "filled" : ""}">★</span>`;
    }
    return stars;
  }

  // -------- Render single review --------
  function renderReviewCard(review) {
    return `
      <article class="review-card">
        <div class="review-header">
          <div class="quote-icon">“</div>
          <div class="reviewer-info">
            <span class="reviewer-name">${review.name}</span>
            <span class="product-name">${review.product}</span>
            <span class="review-time">${timeAgo(review.createdAt)}</span>
          </div>
          <div class="rating-stars">
            ${renderStars(review.rating)}
          </div>
        </div>
        <p class="review-text">${review.reviewText}</p><br>
        ${
          review.image 
            ? `<p class="review-image-link">
                <a href="${review.image}" target="_blank" rel="noopener noreferrer" style="color: #8f4c00ff; text-decoration: underline;">
                  View Image >>>
                </a>
              </p>` 
            : ""
        }
      </article>
    `;
  }

  // -------- Update Review Analysis --------
function updateReviewAnalysis(reviews) {
  if (!reviews || reviews.length === 0) return;

  // Average rating
  let sumRating = 0;
  let validRatingCount = 0;
  const starCount = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  reviews.forEach(r => {
    let rating = Number(r.rating);
    if (isNaN(rating) || rating < 0) return;

    const safeRating = Math.min(Math.max(rating, 1), 5);
    sumRating += safeRating;
    validRatingCount++;

    starCount[safeRating] = (starCount[safeRating] || 0) + 1;
  });

  if (validRatingCount === 0) return;

  // Average rating
  const averageRating = Number((sumRating / validRatingCount).toFixed(1));
  overallRateEl.textContent = averageRating;
  reviewsCountEl.textContent = `Based on ${validRatingCount} review${validRatingCount > 1 ? 's' : ''}`;

  // Stars
  let fullStars = Math.floor(averageRating);
  let halfStar = averageRating - fullStars >= 0.5 ? 1 : 0;
  fullStars = Math.min(Math.max(fullStars, 0), 5);
  halfStar = halfStar && fullStars < 5 ? 1 : 0;

   if (overallStarsEl)
  overallStarsEl.textContent =
    "★".repeat(fullStars) + (halfStar ? "½" : "") + "☆".repeat(5 - fullStars - halfStar);
  
  // Recommendation
  const recommended = (starCount[5] || 0) + (starCount[4] || 0);
  const recommendationPercent = Math.round((recommended / validRatingCount) * 100);
  if (recommendationEl) recommendationEl.textContent = `${recommendationPercent}% Of Customers Recommend S&S Footwear`;

  // Update bars
  for (let i = 5; i >= 1; i--) {
    const percent = ((starCount[i] || 0) / validRatingCount * 100).toFixed(0);
    if (barFills[i]) barFills[i].style.width = `${percent}%`;
    if (barCounts[i]) barCounts[i].textContent = starCount[i] || 0;
  }
}

// -------- Fetch and render reviews --------
  if (reviewsContainer) {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
      reviewsContainer.innerHTML = "";
      const reviews = [];
      snapshot.forEach((doc) => {
        const review = doc.data();
        reviews.push(review);
        reviewsContainer.innerHTML += renderReviewCard(review);
      });
      updateReviewAnalysis(reviews);
    });
  }
});

