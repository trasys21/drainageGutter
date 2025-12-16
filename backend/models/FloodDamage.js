const mongoose = require('mongoose');

// 대한민국 표준시(KST)를 위한 시간대 설정
const moment = require('moment-timezone');
const dateKorea = moment.tz(Date.now(), "Asia/Seoul");


const FloodDamageSchema = new mongoose.Schema({
  // 순번
  sequence: {
    type: Number,
    required: true,
    unique: true,
  },
  // 주소
  address: {
    type: String,
    required: true,
  },
  // 피해 발생 일자
  damageDate: {
    type: String,
    required: true,
  },
  // 위도
  latitude: {
    type: Number,
    required: true,
  },
  // 경도
  longitude: {
    type: Number,
    required: true,
  },
  // 데이터 생성일
  createdAt: {
    type: Date,
    default: () => moment.tz("Asia/Seoul").toDate(),
  },
});

// 한국 시간을 기준으로 현재 날짜를 추가하는 미들웨어
FloodDamageSchema.pre('save', function (next) {
  if (this.isNew) {
    this.createdAt = moment.tz("Asia/Seoul").toDate();
  }
  next();
});

module.exports = mongoose.model('FloodDamage', FloodDamageSchema);
