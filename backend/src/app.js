const express = require("express");
const cors = require("cors");
require("dotenv").config();

/* ---------------- Routes ---------------- */
const reviewRoutes = require("./routes/reviewRoutes");
const productRoutes = require("./routes/productRoutes");
const customRequestRoutes = require("./routes/customRequestRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

/* ---------------- Middleware ---------------- */
app.use(cors());
app.use(express.json());

/* ---------------- API Routes ---------------- */
app.use("/api/reviews", reviewRoutes);
app.use("/api/products", productRoutes);
app.use("/api/custom-requests", customRequestRoutes);
app.use("/api/admin", adminRoutes);

/* ---------------- Health Check ---------------- */
app.get("/api/health", (req, res) => {
  res.json({ status: "API running" });
});

/* ---------------- Local server only ---------------- */
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

/* ---------------- Export for Vercel ---------------- */
module.exports = app;
