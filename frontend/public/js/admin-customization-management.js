const API_BASE = "https://ss-footwear-business-promo-website.vercel.app";

function capitalize(word) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
}

document.addEventListener("DOMContentLoaded", () => {
  /* ---------------- AUTH GUARD ---------------- */
  const token = localStorage.getItem("adminToken");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  /* ---------------- DOM ELEMENTS ---------------- */
  const logoutOption = document.getElementById("logoutOption");
  const requestsTableBody = document.getElementById("requestsTableBody");

  const btnProducts = document.getElementById("btn-products");
  const btnReviews = document.getElementById("btn-reviews");
  const btnCustomization = document.getElementById("btn-customization");

  const userMenu = document.getElementById("userMenu");
  const userDropdown = document.getElementById("userDropdown");

  /* ---------------- ADMIN NAV HIGHLIGHT ---------------- */
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

  /* ---------------- USER DROPDOWN ---------------- */
  if (userMenu && userDropdown) {
    userMenu.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("show");
    });

    document.addEventListener("click", () => {
      userDropdown.classList.remove("show");
    });
  }

  /* ---------------- LOGOUT ---------------- */
  if (logoutOption) {
    logoutOption.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("adminToken");
      window.location.href = "login.html";
    });
  }

  /* ---------------- LOAD DATA ---------------- */
  if (requestsTableBody) {
    fetchCustomizationRequests();
  }

  /* ---------------- FETCH CUSTOM REQUESTS ---------------- */
  async function fetchCustomizationRequests() {
    try {
      const res = await fetch(`${API_BASE}/api/custom-requests`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const requests = await res.json();
      requestsTableBody.innerHTML = "";

      if (!requests.length) {
        requestsTableBody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align:center; padding:12px;">
              No customization requests found.
            </td>
          </tr>
        `;
        return;
      }

      requests.forEach((request) => {
        const date = new Date(request.createdAt).toLocaleDateString("en-GB");

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${date}</td>
          <td>${request.customerName}</td>
          <td>${request.productType || "-"}</td>
          <td>
            ${request.emailAddress}<br>
            ${request.contactNumber} (${request.contactMethod})
          </td>
          <td>${request.customDetails || "-"}</td>
          <td>
            <button class="status-btn ${request.status}">
              ${capitalize(request.status)}
            </button>
          </td>
          <td class="actions">
            <button class="delete" title="Delete">
              <img src="/assets/icons/trash.png" alt="Delete" class="delete-icon">
            </button>
          </td>
        `;

        /* -------- STATUS TOGGLE -------- */
        const statusBtn = row.querySelector(".status-btn");

        statusBtn.addEventListener("click", async () => {
          const nextStatus =
            request.status === "pending" ? "contacted" :
            request.status === "contacted" ? "completed" :
            request.status === "completed" ? "cancelled" :
            "pending";

          try {
            const res = await fetch(`${API_BASE}/api/custom-requests/${request.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ status: nextStatus })
            });

            if (!res.ok) throw new Error("Update failed");

            request.status = nextStatus;
            statusBtn.textContent = capitalize(nextStatus);
            statusBtn.className = `status-btn ${nextStatus}`;
          } catch (err) {
            console.error("Failed to update status:", err);
            alert("Failed to update status");
          }
        });

        /* -------- DELETE -------- */
        row.querySelector(".delete").addEventListener("click", async () => {
          if (!confirm("Are you sure you want to delete this request?")) return;

          try {
            const res = await fetch(`${API_BASE}/api/custom-requests/${request.id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`
              }
            });

            if (!res.ok) throw new Error("Delete failed");

            row.remove();
          } catch (err) {
            console.error("Failed to delete request:", err);
            alert("Failed to delete request");
          }
        });

        requestsTableBody.appendChild(row);
      });
    } catch (error) {
      console.error("Failed to load requests:", error);
      requestsTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; color:red;">
            Failed to load customization requests.
          </td>
        </tr>
      `;
    }
  }
});
