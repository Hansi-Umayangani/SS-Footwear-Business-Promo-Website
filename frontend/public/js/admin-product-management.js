const API_BASE = "https://ss-footwear-business-promo-website.vercel.app";

document.addEventListener("DOMContentLoaded", () => {
  /* ================= AUTH GUARD ================= */
  const token = localStorage.getItem("adminToken");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  /* ================= DOM ELEMENTS ================= */
  const loginOption = document.getElementById("loginOption");
  const logoutOption = document.getElementById("logoutOption");
  const userMenu = document.getElementById("userMenu");
  const userDropdown = document.getElementById("userDropdown");

  const productForm = document.querySelector(".product-form");
  const productName = document.getElementById("product-name");
  const categorySelect = document.getElementById("category");
  const newCategoryInput = document.getElementById("new-category");
  const price = document.getElementById("price");
  const description = document.getElementById("description");
  const productsTbody = document.getElementById("products-tbody");

  const previewImg = document.getElementById("preview-img");
  const imagePreview = document.getElementById("image-preview");
  const uploadBox = document.getElementById("upload-box");
  const browseBtn = document.getElementById("browse-btn");

  /* ================= AUTH UI ================= */
  if (loginOption && logoutOption) {
    loginOption.style.display = "none";
    logoutOption.style.display = "flex";
  }

  logoutOption?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("adminToken");
    window.location.href = "login.html";
  });

  /* ================= USER DROPDOWN ================= */
  if (userMenu && userDropdown) {
    userMenu.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("show");
    });

    document.addEventListener("click", () => {
      userDropdown.classList.remove("show");
    });
  }

  /* ================= CLOUDINARY ================= */
  let uploadedImageURL = "";
  let editProductId = null;

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
      e.preventDefault();
      widget.open();
    });
  }

  /* ================= FORM SUBMIT ================= */
  productForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    let finalCategory = "";

    if (categorySelect.value === "__new__") {
      finalCategory = newCategoryInput.value.trim();
    } else {
      finalCategory = categorySelect.value.trim();
    }

    if (!finalCategory) {
      alert("Please select or enter a category.");
      return;
    }

    const payload = {
      name: productName.value.trim(),
      category: finalCategory,
      price: Number(price.value),
      description: description.value.trim(),
      imageURL: uploadedImageURL,
    };

    if (!payload.name || !payload.description || isNaN(payload.price)) {
      alert("Please fill all fields correctly.");
      return;
    }

    if (!editProductId && !uploadedImageURL) {
      alert("Please upload a product image.");
      return;
    }

    try {
      const res = await fetch(
        editProductId ? `${API_BASE}/api/products/${editProductId}` : `${API_BASE}/api/products`,
        {
          method: editProductId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Save failed");

      alert(editProductId ? "Product updated successfully" : "Product added successfully");

      editProductId = null;
      uploadedImageURL = "";
      imagePreview.style.display = "none";
      newCategoryInput.style.display = "none";
      productForm.reset();

      loadCategories();
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Error saving product");
    }
  });

  /* ================= LOAD CATEGORIES ================= */
  async function loadCategories() {
    try {
      const res = await fetch(`${API_BASE}/api/products/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const categories = await res.json();

      categorySelect.innerHTML = `<option value="">Select Category</option>`;
      newCategoryInput.style.display = "none";
      newCategoryInput.value = "";

      if (categories.length === 0) {
        newCategoryInput.style.display = "block";
        return;
      }

      categories.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
      });

      const addNewOption = document.createElement("option");
      addNewOption.value = "__new__";
      addNewOption.textContent = "+ Add new category";
      categorySelect.appendChild(addNewOption);

      categorySelect.onchange = () => {
        newCategoryInput.style.display =
          categorySelect.value === "__new__" ? "block" : "none";
      };
    } catch (err) {
      console.error("Category load error:", err);
    }
  }

  /* ================= LOAD PRODUCTS ================= */
  async function loadProducts() {
    if (!productsTbody) return;

    productsTbody.innerHTML = "";

    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const products = await res.json();

      products.forEach((product) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td><img src="${product.image_url}" width="60"></td>
          <td>${product.name}</td>
          <td>${product.category}</td>
          <td>${product.description}</td>
          <td>Rs. ${product.price}</td>
          <td class="actions">
            <button type="button" class="edit"></button>
            <button type="button" class="delete"></button>
          </td>
        `;

        tr.querySelector(".delete").onclick = async () => {
          if (!confirm(`Delete "${product.name}"?`)) return;
          await fetch(`${API_BASE}/api/products/${product.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          loadProducts();
        };

        tr.querySelector(".edit").onclick = () => {
          editProductId = product.id;
          productName.value = product.name;
          price.value = product.price;
          description.value = product.description;
          previewImg.src = product.image_url;
          imagePreview.style.display = "block";
          uploadedImageURL = product.image_url;

          if ([...categorySelect.options].some(o => o.value === product.category)) {
            categorySelect.value = product.category;
            newCategoryInput.style.display = "none";
          } else {
            categorySelect.value = "__new__";
            newCategoryInput.value = product.category;
            newCategoryInput.style.display = "block";
          }
        };

        productsTbody.appendChild(tr);
      });
    } catch (err) {
      console.error("Failed to load products", err);
    }
  }

  /* ================= INITIAL LOAD ================= */
  loadCategories();
  loadProducts();
});
