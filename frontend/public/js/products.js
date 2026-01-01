// ------------------ GLOBAL STATE ------------------
let allProducts = [];
let currentFilter = "all";
let currentSearch = "";

// ------------------- CATEGORY MAP -------------------
const categoryMap = {
  "men-formal": "Men's Formal",
  "men-sandals": "Men's Sandals",
  "women-heels": "Women's Heels",
  "women-flats": "Women's Flats",
  "women-sandals": "Women's Sandals",
  "school-shoes": "School Shoes",
  "all": "all"
};

// ------------------- SEARCH SYNONYMS -------------------
const searchMap = {
  "heels": "Women's Heels",
  "flats": "Women's Flats",
  "sandals": ["Men's Sandals", "Women's Sandals"],
  "formal": "Men's Formal",
  "school": "School Shoes"
};

// ------------------- NORMALIZE TEXT -------------------
function normalizeText(text = "") {
  return text
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

// ------------------- DISPLAY PRODUCTS -------------------
function displayProducts(products) {
  const productGrid = document.getElementById("product-grid");
  if (!productGrid) return;

  productGrid.innerHTML = "";

  const filteredProducts = products.filter((p) => {
    const targetCategory = [categoryMap[currentFilter]];

    const matchesCategory =
      targetCategory.includes("all") ||
      normalizeText(p.category) === normalizeText(targetCategory[0]);

    const searchText = normalizeText(currentSearch);

    const matchesSearch =
      !searchText ||
      normalizeText(p.name).includes(searchText) ||
      normalizeText(p.description).includes(searchText) ||
      normalizeText(p.category).includes(searchText);

    return matchesCategory && matchesSearch;
  });

  if (filteredProducts.length === 0) {
    productGrid.innerHTML = "<p>No products found.</p>";
    return;
  }

  filteredProducts.forEach((product) => {
    const card = document.createElement("div");
    card.classList.add("product-card");

    card.innerHTML = `
      <img src="${product.image_url}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <div class="price">Rs. ${Number(product.price).toFixed(2)}</div>
    `;

    productGrid.appendChild(card);
  });
}

// ------------------ LOAD PRODUCTS FROM BACKEND ------------------
async function loadProducts() {
  try {
    const res = await fetch("/api/products");

    if (!res.ok) throw new Error("Failed to fetch products");

    allProducts = await res.json();
    displayProducts(allProducts);
  } catch (err) {
    console.error(err);
    const productGrid = document.getElementById("product-grid");
    if (productGrid)
      productGrid.innerHTML = "<p>Failed to load products.</p>";
  }
}

// ------------------ DOM READY ------------------
document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const searchInput = document.querySelector(".search-bar input");

  // -------- SEARCH (ENTER KEY) --------
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      currentSearch = searchInput.value.trim();
      displayProducts(allProducts);
    });
  }

  // -------- CATEGORY FILTER --------
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.category;
      currentSearch = "";

      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      displayProducts(allProducts);
    });
  });

  // -------- LOAD PRODUCTS --------
  loadProducts();
});

console.log("products.js loaded (API version)");
