const API_BASE = "https://ss-footwear-business-promo-website.vercel.app";

document.addEventListener("DOMContentLoaded", () => {
  loadFeaturedProducts();
});

/* -------- Featured Products -------- */
async function loadFeaturedProducts() {
  const productContainer = document.getElementById("featured-products");

  // Safety check
  if (!productContainer) {
    console.warn("#featured-products container not found");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/products`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const products = await response.json();

    if (!Array.isArray(products)) {
      throw new Error("Invalid products response");
    }

    productContainer.innerHTML = "";

    if (products.length === 0) {
      productContainer.innerHTML =
        "<p class='empty-msg'>No products available.</p>";
      return;
    }

    // Show latest 6 products
    const featuredProducts = products.slice(0, 6);

    featuredProducts.forEach((product) => {
      const card = document.createElement("div");
      card.className = "product-card";

      const imageSrc =
        product.image_url && product.image_url.trim() !== ""
          ? product.image_url
          : "/assets/images/no-image.png";

      const price =
        product.price !== undefined && product.price !== null
          ? `Rs. ${Number(product.price).toFixed(2)}`
          : "Price unavailable";

      card.innerHTML = `
        <img src="${imageSrc}" alt="${product.name || "Product image"}">
        <h3>${product.name || "Unnamed Product"}</h3>
        <p>${product.description || "No description available."}</p>
        <div class="price">${price}</div>
      `;

      productContainer.appendChild(card);
    });

  } catch (error) {
    console.error("Error loading featured products:", error);
    productContainer.innerHTML =
      "<p class='error-msg'>Unable to load products.</p>";
  }
}
