// ----------------------- DOM ELEMENTS -----------------------
const loginOption = document.getElementById("loginOption");
const logoutOption = document.getElementById("logoutOption");
const userMenu = document.getElementById("userMenu");
const userDropdown = document.getElementById("userDropdown");

const productForm = document.querySelector(".product-form");
const productName = document.getElementById("product-name");
const category = document.getElementById("category");
const price = document.getElementById("price");
const description = document.getElementById("description");
const productsTbody = document.getElementById("products-tbody");

const previewImg = document.getElementById("preview-img");
const imagePreview = document.getElementById("image-preview");
const uploadBox = document.getElementById("upload-box");
const browseBtn = document.getElementById("browse-btn");

// ------------------- ADMIN NAV HIGHLIGHT -------------------
const btnProducts = document.getElementById("btn-products");
const btnReviews = document.getElementById("btn-reviews");
const btnCustomization = document.getElementById("btn-customization");

document.addEventListener("DOMContentLoaded", () => {
  const url = window.location.href;

  if (url.includes("product-management.html") && btnProducts) {
    btnProducts.classList.add("active");
  }
  if (url.includes("review-management.html") && btnReviews) {
    btnReviews.classList.add("active");
  }
  if (url.includes("customization-management.html") && btnCustomization) {
    btnCustomization.classList.add("active");
  }
});

let uploadedImageURL = "";
let editProductId = null;

// ----------------------- AUTH UI (TEMP) -----------------------
if (loginOption && logoutOption) {
  loginOption.style.display = "none";
  logoutOption.style.display = "flex";
}

logoutOption?.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "login.html";
});

// ----------------------- DROPDOWN -----------------------
if (userMenu && userDropdown) {
  userMenu.addEventListener("click", (e) => {
    e.stopPropagation();
    userDropdown.style.display =
      userDropdown.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (e) => {
    if (!userMenu.contains(e.target)) {
      userDropdown.style.display = "none";
    }
  });
}

// ----------------------- CLOUDINARY -----------------------
if (window.cloudinary && uploadBox && browseBtn) {
  const widget = window.cloudinary.createUploadWidget(
    {
      cloudName: "dvcmr9ojz",
      uploadPreset: "unsigned_preset",
      multiple: false,
      folder: "products",
    },
    (err, result) => {
      if (!err && result.event === "success") {
        uploadedImageURL = result.info.secure_url;
        previewImg.src = uploadedImageURL;
        imagePreview.style.display = "block";
      }
    }
  );

  uploadBox.addEventListener("click", () => widget.open());

  browseBtn.addEventListener("click", (e) => {
    e.preventDefault();     // stop form submit
    e.stopPropagation();    // stop uploadBox click
    widget.open();
  });
}

// ----------------------- FORM SUBMIT -----------------------
if (productForm) {
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      name: productName.value.trim(),
      category: category.value.trim(),
      price: Number(price.value),
      description: description.value.trim(),
      imageURL: uploadedImageURL,
    };

    if (!payload.name || !payload.category || !payload.description || isNaN(payload.price)) {
      alert("Please fill all fields correctly.");
      return;
    }

    if (!editProductId && !uploadedImageURL) {
      alert("Please upload a product image.");
      return;
    }

    try {
      const res = await fetch(
        editProductId ? `/api/products/${editProductId}` : "/api/products",
        {
          method: editProductId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Save failed");

      alert(editProductId ? "Product updated successfully" : "Product added successfully");

      editProductId = null;
      uploadedImageURL = "";
      imagePreview.style.display = "none";
      productForm.reset();

      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Error saving product");
    }
  });
}

// ----------------------- LOAD PRODUCTS -----------------------
async function loadProducts() {
  if (!productsTbody) return;

  productsTbody.innerHTML = "";

  try {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error("Failed to fetch");

    const products = await res.json();

    products.forEach((product) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td><img src="${product.imageURL}" width="60"></td>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>Rs. ${product.price}</td>
        <td class="actions">
          <button type="button" class="edit"></button>
          <button type="button" class="delete"></button>
        </td>
      `;

      tr.querySelector(".delete").onclick = async () => {
        if (confirm(`Delete "${product.name}"?`)) {
          await fetch(`/api/products/${product._id}`, { method: "DELETE" });
          loadProducts();
        }
      };

      tr.querySelector(".edit").onclick = () => {
        editProductId = product._id;
        productName.value = product.name;
        category.value = product.category;
        price.value = product.price;
        description.value = product.description;
        previewImg.src = product.imageURL;
        imagePreview.style.display = "block";
        uploadedImageURL = product.imageURL;
      };

      productsTbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load products", err);
  }
}

// ----------------------- INITIAL LOAD -----------------------
loadProducts();
