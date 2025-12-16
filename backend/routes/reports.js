const express = require("express");
const router = express.Router();
const multer = require("multer");
const Report = require("../models/Report");
// const sharp = require("sharp");  // 🔴 지금은 안 쓰니까 주석 처리하거나 삭제
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "uploads", "originals");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname) || ".jpg";
    const safeFilename = `${Date.now()}${extension}`;
    cb(null, safeFilename);
  },
});

// 🔹 너무 큰 파일은 아예 업로드 단계에서 막기 (예: 10MB)
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 이상은 거부
  },
});

// 모든 신고 데이터 (기본 정보만)
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find()
      .select("reportId latitude longitude cloggingLevel")
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    console.error("GET /api/reports error:", error);
    res.status(500).json({ message: "Error fetching reports", error });
  }
});

// 특정 ID의 신고 데이터 (상세 정보)
router.get("/:reportId", async (req, res) => {
  try {
    const report = await Report.findOne({ reportId: req.params.reportId });
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.json(report);
  } catch (error) {
    console.error(`GET /api/reports/${req.params.reportId} error:`, error);
    res.status(500).json({ message: "Error fetching report detail", error });
  }
});


router.post("/", upload.single("photo"), async (req, res) => {
  const {
    cloggingLevel,
    causeType,
    causeDetail,
    description,
    phoneNumber,
    latitude,
    longitude,
  } = req.body;

  // multer 에러 (파일 사이즈 초과 등) 처리
  if (!req.file) {
    return res.status(400).json({ message: "Photo is required." });
  }

  try {
    console.log("📸 신고 처리 시작 (썸네일 없음)");

    const originalPhotoPath = req.file.path;
    const photoUrl = `/uploads/originals/${req.file.filename}`;

    // ✅ 썸네일 생성 안 하고, 그대로 동일 경로 사용
    const thumbnailUrl = photoUrl;

    const newReport = {
      reportId: Date.now().toString(),
      cloggingLevel,
      causeType,
      causeDetail,
      description,
      phoneNumber,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      photoUrl,
      thumbnailUrl,
      status: "접수",
    };

    console.log("새 신고 데이터:", newReport);

    let savedReport;
    try {
      console.log("Report.create 시작");
      savedReport = await Report.create(newReport);
      console.log("Report.create 완료:", savedReport._id);
    } catch (dbErr) {
      console.error("🔴 DB 저장 중 에러:", dbErr);
      return res
        .status(500)
        .json({ message: "DB error while saving report", error: dbErr });
    }

    console.log("저장 완료:", savedReport._id);

    return res.status(201).json({
      message: "Report submitted successfully",
      report: savedReport,
    });
  } catch (error) {
    console.error("🔴 라우터 전체 에러:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        message: "Error processing image or saving report",
        error,
      });
    }
  }
});

module.exports = router;
