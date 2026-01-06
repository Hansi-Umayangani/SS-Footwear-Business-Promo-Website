const API_BASE = "https://ss-footwear-business-promo-website.vercel.app";

document.addEventListener("DOMContentLoaded", () => {
  /* ===============================
     NAV & USER MENU ELEMENTS
     =============================== */
  const navLinks = document.querySelectorAll(".nav-links a");
  const userMenu = document.getElementById("userMenu");
  const userDropdown = document.getElementById("userDropdown");
  const loginOption = document.getElementById("loginOption");
  const logoutOption = document.getElementById("logoutOption");
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");

  /* ===============================
     REVIEW ELEMENTS
     =============================== */
  const reviewsContainer = document.querySelector(".reviews-container");

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

  /* ===============================
     ACTIVE NAV LINK
     =============================== */
  const currentPage = window.location.pathname.split("/").pop();
  navLinks.forEach(link => {
    const linkPage = link.getAttribute("href").split("/").pop();
    if (linkPage === currentPage) link.classList.add("active");
  });

  /* ===============================
     USER DROPDOWN
     =============================== */
  if (userMenu && userDropdown) {
    userMenu.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("show");
    });

    document.addEventListener("click", () => {
      userDropdown.classList.remove("show");
    });
  }

  /* ===============================
     MOBILE MENU
     =============================== */
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  /* ===============================
     TIME AGO (PostgreSQL timestamps)
     =============================== */
  function timeAgo(dateString) {
    if (!dateString) return "Just now";

    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds >= 86400) return `${Math.floor(seconds / 86400)} day(s) ago`;
    if (seconds >= 3600) return `${Math.floor(seconds / 3600)} hour(s) ago`;
    if (seconds >= 60) return `${Math.floor(seconds / 60)} min(s) ago`;

    return "Just now";
  }

  /* ===============================
     STAR RENDERING
     =============================== */
  function renderStars(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
      stars += `<span class="star ${i <= rating ? "filled" : ""}">★</span>`;
    }
    return stars;
  }

  /* ===============================
     REVIEW CARD
     =============================== */
  function renderReviewCard(review) {
    return `
      <article class="review-card">
        <div class="review-header">
          <div class="quote-icon">“</div>
          <div class="reviewer-info">
            <span class="reviewer-name">${review.name}</span>
            <span class="product-name">${review.product || ""}</span>
            <span class="review-time">${timeAgo(review.created_at)}</span>
          </div>
          <div class="rating-stars">
            ${renderStars(review.rating)}
          </div>
        </div>

        <p class="review-text">${review.review_text}</p>

        ${
          review.image_url
            ? `<p class="review-image-link">
                <a href="${review.image_url}" target="_blank" rel="noopener noreferrer"
                  style="color:#8f4c00ff;text-decoration:underline;">
                  View Image &gt;&gt;&gt;
                </a>
              </p>`
            : ""
        }
      </article>
    `;
  }

  /* ===============================
     REVIEW ANALYTICS
     =============================== */
  function updateReviewAnalysis(reviews) {
    if (!reviews.length) return;

    let sum = 0;
    const starCount = { 1:0, 2:0, 3:0, 4:0, 5:0 };

    reviews.forEach(r => {
      const rating = Math.min(Math.max(Number(r.rating), 1), 5);
      sum += rating;
      starCount[rating]++;
    });

    const avg = Number((sum / reviews.length).toFixed(1));
    overallRateEl.textContent = avg;
    reviewsCountEl.textContent =
      `Based on ${reviews.length} review${reviews.length > 1 ? "s" : ""}`;

    const fullStars = Math.floor(avg);
    const halfStar = avg - fullStars >= 0.5 ? 1 : 0;

    overallStarsEl.textContent =
      "★".repeat(fullStars) +
      (halfStar ? "½" : "") +
      "☆".repeat(5 - fullStars - halfStar);

    const recommended = starCount[4] + starCount[5];
    recommendationEl.textContent =
      `${Math.round((recommended / reviews.length) * 100)}% Of Customers Recommend S&S Footwear`;

    for (let i = 5; i >= 1; i--) {
      const percent = ((starCount[i] / reviews.length) * 100).toFixed(0);
      if (barFills[i]) barFills[i].style.width = `${percent}%`;
      if (barCounts[i]) barCounts[i].textContent = starCount[i];
    }
  }

  /* ===============================
     FETCH REVIEWS (API)
     =============================== */
  async function loadReviews() {
    try {
      const res = await fetch(`${API_BASE}/api/reviews`);
      if (!res.ok) throw new Error("Failed to fetch reviews");

      const reviews = await res.json();

      reviewsContainer.innerHTML = "";
      reviews.forEach(r => {
        reviewsContainer.innerHTML += renderReviewCard(r);
      });

      updateReviewAnalysis(reviews);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    }
  }

  if (reviewsContainer) loadReviews();
});
