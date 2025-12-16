require('dotenv').config(); // .env 파일 로드

const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const reportRoutes = require("./routes/reports");
const floodDamageRoutes = require("./routes/floodDamages");
const geocodeRoutes = require("./routes/geocode"); // 지오코딩 라우트 추가

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/drainageGutter";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected successfully."))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/reports", reportRoutes);
app.use("/api/flood-damages", floodDamageRoutes);
app.use("/api/geocode", geocodeRoutes); // 지오코딩 라우트 사용

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
