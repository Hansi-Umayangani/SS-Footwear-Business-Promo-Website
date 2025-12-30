import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, query, orderBy, onSnapshot } 
  from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// --------------- FIRESTORE INIT -------------------
const db = getFirestore();
const productsCollection = collection(db, "products");

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
function normalizeText(text) {
  return text.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
}

// ------------------- DISPLAY PRODUCTS -------------------
function displayProducts(products, overrideCategories = null) {
  const productGrid = document.getElementById("product-grid");
  if (!productGrid) return;

  productGrid.innerHTML = "";

  const filteredProducts = products.filter(p => {
    const targetCategory = overrideCategories || [categoryMap[currentFilter]];

    const matchesCategory = targetCategory.includes("all") 
      ? true 
      : targetCategory.some(cat => normalizeText(cat) === normalizeText(p.category));

    const matchesSearch = normalizeText(p.name).includes(normalizeText(currentSearch))
      || (searchMap[currentSearch] && (
       Array.isArray(searchMap[currentSearch])
         ? searchMap[currentSearch].some(cat => normalizeText(cat) === normalizeText(p.category))
         : normalizeText(searchMap[currentSearch]) === normalizeText(p.category)
     ));

    return matchesCategory && matchesSearch;
  });

  if (filteredProducts.length === 0) {
    productGrid.innerHTML = "<p>No products found.</p>";
    return;
  }

  filteredProducts.forEach(product => {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.setAttribute("data-category", product.category);

    card.innerHTML = `
      <img src="${product.imageURL}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <div class="price">Rs. ${product.price.toFixed(2)}</div>
    `;

    productGrid.appendChild(card);
  });
}

// ------------------ LOAD PRODUCTS REALTIME ------------------
function loadProductsRealtime() {
  const q = query(productsCollection, orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    displayProducts(allProducts);
  }, (error) => {
    console.error("Error fetching products:", error);
    const productGrid = document.getElementById("product-grid");
    if (productGrid)
    productGrid.innerHTML = "<p>Failed to load products.</p>";
  });
}

// -------- DOM ELEMENTS --------
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-links a");
  const userMenu = document.getElementById("userMenu");
  const userDropdown = document.getElementById("userDropdown");
  const loginOption = document.getElementById("loginOption");
  const logoutOption = document.getElementById("logoutOption");
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const searchInput = document.querySelector(".search-bar input");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const productGrid = document.getElementById("product-grid");

  const currentPage = window.location.pathname.split("/").pop();

 if (currentPage !== "home.html") {

// -------- Highlight nav link --------
  navLinks.forEach(link => {
    const linkPage = link.getAttribute("href").split("/").pop();
    if (linkPage === currentPage) link.classList.add("active");
  });

  if (currentPage === "admin-login.html") 
    userMenu.classList.add("active");

  if (userMenu && userDropdown) {
    userMenu.addEventListener("click", () => {
      userDropdown.style.display = userDropdown.style.display === "block" ? "none" : "block";
    });
    document.addEventListener("click", (e) => {
      if (!userMenu.contains(e.target)) userDropdown.style.display = "none";
    });
  }

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  // -------- AUTH STATE --------
  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (loginOption) loginOption.style.display = "none";
      if (logoutOption) logoutOption.style.display = "flex";
      if  (userMenu) userMenu.classList.add("active");
    } else {
      if (loginOption)  loginOption.style.display = "flex";
      if (logoutOption)  logoutOption.style.display = "none";
      if (userMenu && currentPage !== "login.html") userMenu.classList.remove("active");
    }
  });

  if (logoutOption) {
    logoutOption.addEventListener("click", async (e) => {
    e.preventDefault();
      try {
        await signOut(auth);
        window.location.reload();
      } catch (err) {
        console.error(err);
      }
    });
  }
}



// ------------------ FILTER BUTTONS ------------------
if (userMenu && userDropdown) {
    userMenu.addEventListener("click", () => {
      userDropdown.style.display = userDropdown.style.display === "block" ? "none" : "block";
    });
    document.addEventListener("click", (e) => {
      if (!userMenu.contains(e.target)) userDropdown.style.display = "none";
    });
  }

// ------------------ SEARCH BAR (Enter Key) ------------------
if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();

        const searchTerm = normalizeText(searchInput.value.trim());
        currentSearch = searchTerm;

        let overrideCategories = null;

        if (searchMap[searchTerm]) {
          const mappedCategory = searchMap[searchTerm];
          overrideCategories = Array.isArray(mappedCategory) ? mappedCategory : [mappedCategory];
        }

        displayProducts(allProducts, overrideCategories);
      }
    });
  }

// ------------------ CATEGORY FILTER BUTTONS ------------------
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.category;
      currentSearch = "";
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      displayProducts(allProducts);
    });
  });

// ------------------ LOAD Single PRODUCT ------------------
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("productId");

  if (productId && productGrid) {
    const productRef = doc(db, "products", productId);
    onSnapshot(productRef, (docSnap) => {
      if (docSnap.exists()) {
        const product = docSnap.data();

        productGrid.innerHTML = `
          <div class="product-detail">
            <img src="${product.imageURL}" alt="${product.name}" />
            <h2>${product.name}</h2>
            <p>${product.description}</p>
            <div class="price">Rs. ${product.price.toFixed(2)}</div>
            <button class="request-btn">Request Custom</button>
            <button class="back-btn" onclick="window.location.href='products.html'">Back to Products</button>
          </div>
        `;
      } else {
        productGrid.innerHTML = "<p>Product not found.</p>";
      }
     });
  } else {
    loadProductsRealtime();
  }
});

console.log("products.js loaded");  

