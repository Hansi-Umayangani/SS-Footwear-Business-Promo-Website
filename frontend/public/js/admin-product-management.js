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
  const category = document.getElementById("category");
  const price = document.getElementById("price");
  const description = document.getElementById("description");
  const productsTbody = document.getElementById("products-tbody");

  const previewImg = document.getElementById("preview-img");
  const imagePreview = document.getElementById("image-preview");
  const uploadBox = document.getElementById("upload-box");
  const browseBtn = document.getElementById("browse-btn");

  /* ================= ADMIN NAV HIGHLIGHT ================= */
  const btnProducts = document.getElementById("btn-products");
  const btnReviews = document.getElementById("btn-reviews");
  const btnCustomization = document.getElementById("btn-customization");

  const url = window.location.href;
  if (url.includes("product-management.html") && btnProducts) btnProducts.classList.add("active");
  if (url.includes("review-management.html") && btnReviews) btnReviews.classList.add("active");
  if (url.includes("customization-management.html") && btnCustomization) btnCustomization.classList.add("active");

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
      e.stopPropagation();
      widget.open();
    });
  }

  /* ================= FORM SUBMIT ================= */
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
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
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

  /* ================= LOAD PRODUCTS ================= */
  async function loadProducts() {
    if (!productsTbody) return;

    productsTbody.innerHTML = "";

    try {
      const res = await fetch("/api/products", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Fetch failed");

      const products = await res.json();

      products.forEach((product) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td><img src="${product.image_url}" width="60"></td>
          <td>${product.name}</td>
          <td>${product.category}</td>
          <td>Rs. ${product.price}</td>
          <td class="actions">
            <button type="button" class="edit"></button>
            <button type="button" class="delete"></button>
          </td>
        `;

        tr.querySelector(".delete").onclick = async () => {
          if (!confirm(`Delete "${product.name}"?`)) return;

          await fetch(`/api/products/${product.id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          loadProducts();
        };

        tr.querySelector(".edit").onclick = () => {
          editProductId = product.id;
          productName.value = product.name;
          category.value = product.category;
          price.value = product.price;
          description.value = product.description;
          previewImg.src = product.image_url;
          imagePreview.style.display = "block";
          uploadedImageURL = product.image_url;
        };

        productsTbody.appendChild(tr);
      });
    } catch (err) {
      console.error("Failed to load products", err);
    }
  }

  /* ================= INITIAL LOAD ================= */
  loadProducts();
});
