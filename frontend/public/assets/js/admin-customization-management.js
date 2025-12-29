import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } 
  from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// ------------------- DOM ELEMENTS -------------------
const loginOption = document.getElementById("loginOption");
const logoutOption = document.getElementById("logoutOption");
const userMenu = document.getElementById("userMenu");
const userDropdown = document.getElementById("userDropdown");
const requestsTableBody = document.getElementById("requestsTableBody");
// Admin nav buttons
const btnProducts = document.getElementById("btn-products");
const btnReviews = document.getElementById("btn-reviews");
const btnCustomization = document.getElementById("btn-customization");

// ------------------- AUTH -------------------
function initAuth() {
  if (!loginOption || !logoutOption) return;

onAuthStateChanged(auth, (user) => {
  if (loginOption && logoutOption) {
    if (user) {
      loginOption.style.display = "none";
      logoutOption.style.display = "flex";
    } else {
      loginOption.style.display = "flex";
      logoutOption.style.display = "none";
    }
  }
});

// ------------------- LOGOUT -------------------
logoutOption.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      window.location.href = "login.html";
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  });
}


// ------------------- ADMIN NAV HIGHLIGHT & FETCH -------------------
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

  // Fetch requests
  if (requestsTableBody) fetchCustomizationRequests(requestsTableBody);
});

// ------------------- FETCH CUSTOMIZATION REQUESTS -------------------
function fetchCustomizationRequests(tableBody) {
  if (!tableBody) return;

  const q = query(collection(db, "customRequests"), orderBy("timestamp", "desc"));

  onSnapshot(q, (querySnapshot) => {
    tableBody.innerHTML = "";

  if (querySnapshot.empty) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:10px;">No requests found.</td>
      </tr>
    `;
    return;
  }

    querySnapshot.forEach((docSnap) => {
      const request = docSnap.data();
      const date = request.timestamp?.toDate().toLocaleDateString() || "";
      const customerName = request.customerName || "-";
      const productType = request.productType || "-";
      const emailAddress = request.emailAddress || "-";
      const contactNumber = request.contactNumber || "";
      const contactMethod = request.contactMethod || "";
      const customDetails = request.customDetails || "-";
      const status = request.status || "Pending";

      const row = document.createElement("tr");
      row.setAttribute("data-id", docSnap.id);

      row.innerHTML = `
        <td>${date}</td>
        <td>${customerName}</td>
        <td>${productType}</td>
        <td>${emailAddress}<br>${contactNumber} (${contactMethod})</td>
        <td>${customDetails}</td>
        <td>
          <button class="status-btn ${status.toLowerCase()}">${status}</button>
        </td>
        <td class="actions">
          <button class="delete" title="Delete">
            <img src="/assets/icons/trash.png" alt="Delete" class="delete-icon">
          </button>
        </td>
      `;

      // Status toggle
      const statusBtn = row.querySelector(".status-btn");
      statusBtn.addEventListener("click", async () => {
        const currentStatus = statusBtn.textContent.toLowerCase();
        const newStatus = currentStatus === "pending" ? "Accepted" : "Pending";

        try {
          await updateDoc(doc(db, "customRequests", docSnap.id), { status: newStatus });
        } catch (err) {
          console.error("Failed to update status:", err);
        }
      });

      // Delete handler
      row.querySelector(".delete").addEventListener("click", async () => {
        if (!confirm("Are you sure you want to delete this request?")) return;
        try {
          await deleteDoc(doc(db, "customRequests", docSnap.id));
        } catch (err) {
          console.error("Failed to delete request:", err);
        }
      });

      tableBody.appendChild(row);
    });
    }, (err) => {
      console.error("Failed to fetch requests:", err);
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; color:red;">Failed to load requests.</td>
        </tr>
      `;
    });
  }
