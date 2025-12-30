// ------------------- DOM ELEMENTS -------------------
const requestsTableBody = document.getElementById("requestsTableBody");

// Admin nav buttons
const btnProducts = document.getElementById("btn-products");
const btnReviews = document.getElementById("btn-reviews");
const btnCustomization = document.getElementById("btn-customization");

// ------------------- ADMIN NAV HIGHLIGHT -------------------
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

  if (requestsTableBody) {
    fetchCustomizationRequests();
  }
});

// ------------------- FETCH CUSTOMIZATION REQUESTS -------------------
async function fetchCustomizationRequests() {
  try {
    const res = await fetch("/api/custom-requests");
    const requests = await res.json();

    requestsTableBody.innerHTML = "";

    if (!requests.length) {
      requestsTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:10px;">
            No requests found.
          </td>
        </tr>
      `;
      return;
    }

    requests.forEach((request) => {
      const date = new Date(request.createdAt).toLocaleDateString();
      const status = request.status || "Pending";

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
          <button class="status-btn ${status.toLowerCase()}">
            ${status}
          </button>
        </td>
        <td class="actions">
          <button class="delete" title="Delete">
            <img src="/assets/icons/trash.png" alt="Delete" class="delete-icon">
          </button>
        </td>
      `;

      /* -------- Status Toggle -------- */
      const statusBtn = row.querySelector(".status-btn");
      statusBtn.addEventListener("click", async () => {
        const newStatus =
          statusBtn.textContent === "Pending" ? "Accepted" : "Pending";

        try {
          await fetch(`/api/custom-requests/${request._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
          });

          statusBtn.textContent = newStatus;
          statusBtn.className = `status-btn ${newStatus.toLowerCase()}`;
        } catch (err) {
          console.error("Failed to update status:", err);
        }
      });

      /* -------- Delete -------- */
      row.querySelector(".delete").addEventListener("click", async () => {
        if (!confirm("Are you sure you want to delete this request?")) return;

        try {
          await fetch(`/api/custom-requests/${request._id}`, {
            method: "DELETE"
          });
          row.remove();
        } catch (err) {
          console.error("Failed to delete request:", err);
        }
      });

      requestsTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Failed to fetch requests:", error);
    requestsTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; color:red;">
          Failed to load requests.
        </td>
      </tr>
    `;
  }
}
