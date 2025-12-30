const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

/* ---------------- Database ---------------- */
connectDB();

/* ---------------- Middleware ---------------- */
app.use(cors());
app.use(express.json());

/* ---------------- Frontend Static Files ---------------- */
const frontendPath = path.join(__dirname, "../../frontend/public");
app.use(express.static(frontendPath));

/* ---------------- Routes ---------------- */
app.get("/", (req, res) => {
  res.sendFile(
    path.join(frontendPath, "pages/customer/home.html")
  );
});

app.use("/api/reviews", reviewRoutes);

/* ---------------- Server ---------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
