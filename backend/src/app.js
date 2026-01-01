const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

/* ---------------- Database ---------------- */
const { connectDB } = require("./config/db");

/* ---------------- Routes ---------------- */
const reviewRoutes = require("./routes/reviewRoutes");
const productRoutes = require("./routes/productRoutes");
const customRequestRoutes = require("./routes/customRequestRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

/* ---------------- Connect Database ---------------- */
connectDB();

/* ---------------- Middleware ---------------- */
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(
  path.join(__dirname, "../../frontend/public")
));

/* ---------------- API Routes ---------------- */
app.use("/api/reviews", reviewRoutes);
app.use("/api/products", productRoutes);
app.use("/api/custom-requests", customRequestRoutes);
app.use("/api/admin", adminRoutes);

// Default route → load home page
app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../frontend/public/pages/customer/home.html")
  );
});

/* ---------------- Health Check ---------------- */
app.get("/api/health", (req, res) => {
  res.json({ status: "API running" });
});

/* ---------------- Start Server (Local only) ---------------- */
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

/* ---------------- Export for Vercel ---------------- */
module.exports = app;

