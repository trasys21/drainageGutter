const mongoose = require("mongoose");

// --- Mongoose Schema & Model ---
const ReportSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  cloggingLevel: { type: String, required: true },
  causeType: { type: String, required: true },
  causeDetail: String,
  description: String,
  phoneNumber: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  photoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  status: { type: String, default: "접수" },
  createdAt: { type: Date, default: Date.now },
});

const Report = mongoose.model("Report", ReportSchema);

module.exports = Report;
