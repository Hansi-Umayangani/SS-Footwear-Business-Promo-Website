// ---------------------- DOM ELEMENTS ----------------------
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-links a");
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const customForm = document.getElementById("customRequestForm");

  const currentPage = window.location.pathname.split("/").pop();

  /* ---------------- Highlight active nav link ---------------- */
  navLinks.forEach((link) => {
    const linkPage = link.getAttribute("href").split("/").pop();
    if (linkPage === currentPage) link.classList.add("active");
  });

  /* ---------------- Mobile menu toggle ---------------- */
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  /* ---------------- Customization Form Submission ---------------- */
  if (!customForm) return;

  customForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      customerName: document.getElementById("customerName").value.trim(),
      contactNumber: document.getElementById("contactNumber").value.trim(),
      emailAddress: document.getElementById("emailAddress").value.trim(),
      productType: document.getElementById("productType").value.trim(),
      customDetails: document.getElementById("customDetails").value.trim(),
      contactMethod: document.querySelector(
        'input[name="contactMethod"]:checked'
      )?.value
    };

    // Basic validation
    if (
      !data.customerName ||
      !data.contactNumber ||
      !data.emailAddress ||
      !data.contactMethod
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const response = await fetch("/api/custom-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error("Failed to submit request");
      }

      alert("Your customization request has been submitted successfully!");
      customForm.reset();
    } catch (error) {
      console.error("Submission error:", error);
      alert("Something went wrong. Please try again later.");
    }
  });
});
