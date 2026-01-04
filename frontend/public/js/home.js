const API_BASE = "https://ss-footwear-business-promo-website.vercel.app";

document.addEventListener("DOMContentLoaded", () => {
  loadFeaturedProducts();
});

/* -------- Featured Products -------- */
async function loadFeaturedProducts() {
  const productContainer = document.querySelector(".product-list");

  // Safety check
  if (!productContainer) {
    console.warn(".product-list container not found");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/products`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const products = await response.json();

    // Validate response
    if (!Array.isArray(products)) {
      throw new Error("Invalid products response");
    }

    productContainer.innerHTML = "";

    if (products.length === 0) {
      productContainer.innerHTML =
        "<p class='empty-msg'>No products available.</p>";
      return;
    }

    // Show latest 6 products (backend already sorted by createdAt desc)
    const featuredProducts = products.slice(0, 6);

    featuredProducts.forEach((product) => {
      const card = document.createElement("div");
      card.className = "product-card";

      const imageSrc =
        product.imageURL && product.imageURL.trim() !== ""
          ? product.imageURL
          : "/assets/images/no-image.png"; // fallback image

      card.innerHTML = `
        <img 
          src="${imageSrc}" 
          alt="${product.name || "Product image"}"
          class="product-image"
        />
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.description}</p>
      `;

      productContainer.appendChild(card);
    });

  } catch (error) {
    console.error("Error loading featured products:", error);
    productContainer.innerHTML =
      "<p class='error-msg'>Unable to load products.</p>";
  }
}
