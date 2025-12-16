const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/reverse", async (req, res) => {
  const { latitude, longitude } = req.query;

  const NAVER_CLIENT_ID = process.env.NAVER_MAPS_CLIENT_ID;
  const NAVER_CLIENT_SECRET = process.env.NAVER_MAPS_CLIENT_SECRET;

  // 디버깅을 위한 로그 추가
  console.log(
    `[Geocode API] Client ID Loaded: ${NAVER_CLIENT_ID ? "Yes" : "No"}`
  );
  console.log(
    `[Geocode API] Client Secret Loaded: ${
      NAVER_CLIENT_SECRET
        ? "Yes, first 5 chars: " + NAVER_CLIENT_SECRET.substring(0, 5)
        : "No"
    }`
  );

  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    return res.status(500).json({
      message: "Naver Maps API credentials are not configured on the server.",
    });
  }

  if (!latitude || !longitude) {
    return res
      .status(400)
      .json({ message: "Latitude and longitude are required." });
  }

  const apiUrl = "https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc";

  try {
    const response = await axios.get(apiUrl, {
      params: {
        coords: `${longitude},${latitude}`,
        output: "json",
        orders: "admcode,addr,roadaddr",
      },
      headers: {
        "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
        "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error proxying to Naver Maps API:", error);
    res
      .status(error.response?.status || 500)
      .json({ message: "Failed to fetch data from Naver API." });
  }
});

module.exports = router;
