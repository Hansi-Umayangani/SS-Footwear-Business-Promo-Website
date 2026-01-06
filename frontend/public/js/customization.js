const API_BASE = "https://ss-footwear-business-website.vercel.app";

document.addEventListener("DOMContentLoaded", () => {
  /* ---------------- DOM ELEMENTS ---------------- */
  const navLinks = document.querySelectorAll(".nav-links a");
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const customForm = document.getElementById("customRequestForm");

  /* ---------------- Highlight active nav link ---------------- */
  const currentPage = window.location.pathname.split("/").pop();
  navLinks.forEach(link => {
    const linkPage = link.getAttribute("href").split("/").pop();
    if (linkPage === currentPage) link.classList.add("active");
  });

  /* ---------------- Mobile menu toggle ---------------- */
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  /* ---------------- Custom Request Form ---------------- */
  if (!customForm) return;

  customForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    /* ---- Get inputs SAFELY by ID ---- */
    const customerName   = document.getElementById("customer_name");
    const contactNumber  = document.getElementById("contact_number");
    const emailAddress   = document.getElementById("email_address");
    const productType    = document.getElementById("product_type");
    const customDetails  = document.getElementById("custom_details");

    const contactMethod = document.querySelector(
      "input[name='contact_method']:checked"
    )?.value;

    /* ---- Safety check ---- */
    if (!customerName || !contactNumber || !emailAddress) {
      console.error("Form elements not found");
      return;
    }

    /* ---- Payload (MATCHES BACKEND) ---- */
    const payload = {
      customerName: customerName.value.trim(),
      contactNumber: contactNumber.value.trim(),
      emailAddress: emailAddress.value.trim(),
      productType: productType?.value.trim() || null,
      customDetails: customDetails?.value.trim() || null,
      contactMethod: contactMethod
    };

    /* ---------------- Validation ---------------- */
    if (
      !payload.customerName ||
      !payload.contactNumber ||
      !payload.emailAddress ||
      !payload.contactMethod
    ) {
      alert("Please fill all required fields.");
      return;
    }

    if (!/^\+?\d{9,15}$/.test(payload.contactNumber)) {
      alert("Please enter a valid contact number.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(payload.emailAddress)) {
      alert("Please enter a valid email address.");
      return;
    }

    /* ---------------- Submit to API ---------------- */
    try {
      const res = await fetch(`${API_BASE}/api/custom-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Submission failed");

      alert("Your customization request has been submitted successfully!");
      customForm.reset();
    } catch (err) {
      console.error("Customization request error:", err);
      alert("Something went wrong. Please try again later.");
    }
  });
});
