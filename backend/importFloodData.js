require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FloodDamage = require("./models/FloodDamage"); // FloodDamage 모델 임포트

// MongoDB 연결
const MONGO_URI = "mongodb://127.0.0.1:27017/drainageGutter";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected successfully."))
  .catch((err) => console.error("MongoDB connection error:", err));

// Naver Geocoding API를 호출하는 함수
async function getNaverGeocode(address) {
  const NAVER_CLIENT_ID = process.env.NAVER_MAPS_CLIENT_ID;
  const NAVER_CLIENT_SECRET = process.env.NAVER_MAPS_CLIENT_SECRET;
  const API_URL = `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(
    address
  )}`;

  console.log("API URL:", API_URL);
  console.log("Client ID:", NAVER_CLIENT_ID);
  console.log("Client Secret:", NAVER_CLIENT_SECRET ? "Loaded" : "Not Loaded");

  try {
    const response = await axios.get(API_URL, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
        "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET,
      },
    });

    if (response.data.addresses && response.data.addresses.length > 0) {
      const { x, y } = response.data.addresses[0];
      return { longitude: parseFloat(x), latitude: parseFloat(y) };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`네이버 지오코딩 API 오류: ${error.message}`);
    if (error.response) {
      console.error("응답 데이터:", error.response.data);
      console.error("응답 상태:", error.response.status);
      console.error("응답 헤더:", error.response.headers);
    }
    return null;
  }
}

// JSON 파일 경로
const jsonFilePath = path.join(
  __dirname,
  "../광주광역시_관내 침수피해 현황_(종합)_위도경도제거.json"
);

async function importFloodData() {
  try {
    const rawData = fs.readFileSync(jsonFilePath, "utf8");
    const floodData = JSON.parse(rawData);

    // 기존 데이터 삭제 (옵션)
    await FloodDamage.deleteMany({});
    console.log("기존 침수 피해 데이터를 삭제했습니다.");

    for (const [index, data] of floodData.entries()) {
      try {
        console.log(
          `${index + 1}/${floodData.length} 지오코딩 중: ${data.주소}`
        );
        const location = await getNaverGeocode(data.주소);

        if (location) {
          const { latitude, longitude } = location;

          const newFloodDamage = new FloodDamage({
            sequence: data.연번,
            address: data.주소,
            damageDate: data.피해발생일자,
            latitude: latitude,
            longitude: longitude,
          });
          await newFloodDamage.save();
          console.log(
            `데이터 저장 성공: ${data.주소} (위도: ${latitude}, 경도: ${longitude})`
          );
        } else {
          console.warn(`지오코딩 실패 또는 결과 없음: ${data.주소}`);
        }
      } catch (geocodeErr) {
        console.error(
          `지오코딩 중 오류 발생 (${data.주소}):`,
          geocodeErr.message
        );
      }
      // Naver API 호출 제한을 피하기 위해 잠시 대기
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("모든 침수 피해 데이터 가져오기 및 저장 완료.");
  } catch (error) {
    console.error("데이터 가져오기 중 오류 발생:", error);
  } finally {
    mongoose.disconnect();
  }
}

importFloodData();
