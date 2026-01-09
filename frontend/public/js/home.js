const API_BASE = "https://ss-footwear-business-promo-website.vercel.app";

document.addEventListener("DOMContentLoaded", () => {
  loadFeaturedProducts();
});

/* -------- Featured Products -------- */
async function loadFeaturedProducts() {
  const productContainer = document.getElementById("featured-products");

  if (!productContainer) return;

  try {
    const response = await fetch(`${API_BASE}/api/products`);
    if (!response.ok) throw new Error("Failed to load products");

    const products = await response.json();
    if (!Array.isArray(products)) throw new Error("Invalid response");

    productContainer.innerHTML = "";

    if (products.length === 0) {
      productContainer.innerHTML = `<p>No products available.</p>`;
      return;
    }

    // Latest 6 products
    products.slice(0, 6).forEach(product => {
      const card = document.createElement("div");
      card.className = "product-card";

      const imageSrc =
        typeof product.image_url === "string" && product.image_url.trim()
          ? product.image_url
          : "/assets/images/no-image.png";

      const name = product.name || "Unnamed Product";

      // 🔑 truncate description to fit CSS card height
      const description =
        product.description
          ? product.description.length > 90
            ? product.description.substring(0, 90) + "..."
            : product.description
          : "No description available.";

      const price =
        typeof product.price === "number"
          ? `Rs. ${product.price.toFixed(2)}`
          : "Price unavailable";

      card.innerHTML = `
        <img src="${imageSrc}" alt="${name}">
        <h3>${name}</h3>
        <p>${description}</p>
        <div class="price">${price}</div>
      `;

      productContainer.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    productContainer.innerHTML =
      `<p>Unable to load featured products.</p>`;
  }
}

