const express = require("express");
const router = express.Router();
const FloodDamage = require("../models/FloodDamage");

// 모든 침수 피해 데이터 가져오기 (원시 데이터)
router.get("/all", async (req, res) => {
  try {
    const allFloodDamages = await FloodDamage.find().sort({ createdAt: -1 });
    res.json(allFloodDamages);
  } catch (err) {
    console.error("모든 침수 피해 데이터 가져오기 오류:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  const { zoom: zoomStr, north, south, east, west } = req.query;

  const zoom = parseInt(zoomStr, 10) || 10;

  if (!north || !south || !east || !west) {
    return res.json([]);
  }

  const northLat = parseFloat(north);
  const southLat = parseFloat(south);
  const eastLng = parseFloat(east);
  const westLng = parseFloat(west);

  const gridSize = 1 / (Math.pow(2, zoom) * 0.1);

  try {
    const aggregationPipeline = [
      {
        $match: {
          latitude: { $gte: southLat, $lte: northLat },
          longitude: { $gte: westLng, $lte: eastLng },
        },
      },
      {
        $project: {
          latitude: 1,
          longitude: 1,
          lat_grid: { $floor: { $divide: ["$latitude", gridSize] } },
          lng_grid: { $floor: { $divide: ["$longitude", gridSize] } },
        },
      },
      {
        $group: {
          _id: { lat_grid: "$lat_grid", lng_grid: "$lng_grid" },
          latitude: { $avg: "$latitude" },
          longitude: { $avg: "$longitude" },
          count: { $sum: 1 },
        },
      },
    ];

    const floodDamages = await FloodDamage.aggregate(aggregationPipeline);

    res.json(floodDamages);
  } catch (err) {
    console.error("침수 피해 데이터 집계 오류:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
