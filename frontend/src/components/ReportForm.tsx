import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useReport } from "../context/ReportContext";
import { useReportForm } from "../hooks/useReportForm";
import imageCompression from "browser-image-compression";

const ReportForm: React.FC = () => {
  const location = useLocation();
  const { file } = (location.state as { file: File }) || {};

  const { reportData, setPhoto, setLocation } = useReport();
  const navigate = useNavigate();
  const [gpsMessage, setGpsMessage] = useState<string>("");
  const [detailedAddress, setDetailedAddress] = useState<string>("");
  const [loadingAddress, setLoadingAddress] = useState<boolean>(false);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // 새로 만든 폼 훅을 사용합니다.
  const {
    formState,
    message,
    isSubmitting,
    handleChange,
    handlePhoneNumberChange, // 추가
    handleCauseClick,
    handleCloggingLevelClick,
    handleSubmit,
  } = useReportForm();

  // 전화번호 입력 필드 Ref
  const phonePart1Ref = useRef<HTMLInputElement>(null);
  const phonePart2Ref = useRef<HTMLInputElement>(null);
  const phonePart3Ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleImage = async (imageFile: File) => {
      if (!imageFile) return;

      setIsCompressing(true);
      console.log(`원본 이미지 크기: ${imageFile.size / 1024 / 1024} MB`);

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(imageFile, options);
        console.log(
          `압축된 이미지 크기: ${compressedFile.size / 1024 / 1024} MB`
        );
        setPhoto(compressedFile);
      } catch (error) {
        console.error("이미지 압축 실패:", error);
        // 압축 실패 시 원본 파일 사용
        setPhoto(imageFile);
      } finally {
        setIsCompressing(false);
      }
    };

    if (file) {
      handleImage(file);
    } else {
      // 파일이 없는 경우, 사용자를 안내 페이지로 보냅니다.
      navigate("/report/guide");
    }
  }, [file, setPhoto, navigate]);

  useEffect(() => {
    // GPS 정보가 없을 때만 위치를 가져옵니다.
    if (!reportData.latitude || !reportData.longitude) {
      setGpsMessage("GPS 위치 정보를 가져오는 중...");
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position: GeolocationPosition) => {
            setLocation(position.coords.latitude, position.coords.longitude);
            setGpsMessage("GPS 위치 정보 획득 성공!");
          },
          (error: GeolocationPositionError) => {
            console.error("GPS Error:", error);
            setGpsMessage(`GPS 위치 정보 획득 실패: ${error.message}`);
          }
        );
      } else {
        setGpsMessage("이 브라우저는 위치 정보를 지원하지 않습니다.");
      }
    }
  }, [reportData.latitude, reportData.longitude, setLocation]);

  // GPS 좌표로 주소 가져오기
  useEffect(() => {
    const fetchAddress = async () => {
      if (reportData.latitude && reportData.longitude) {
        setLoadingAddress(true);
        try {
          // OpenStreetMap Nominatim API 사용
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${reportData.latitude}&lon=${reportData.longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();

          if (data && data.address) {
            const address = data.address;
            const state = address.state || ""; // 시/도
            const city = address.city || address.town || address.village || ""; // 시/군/구 (또는 읍/면/동)
            const county = address.county || ""; // 구
            const neighbourhood = address.neighbourhood || address.suburb || ""; // 읍/면/동 또는 상세 지역
            const road = address.road || ""; // 도로명
            const houseNumber = address.house_number || ""; // 건물 번호

            let fullAddress = "";
            // 한국 주소 표기 방식에 가깝게 재구성
            if (state) fullAddress += `${state} `;
            if (city) fullAddress += `${city} `;
            if (county) fullAddress += `${county} `;
            if (neighbourhood) fullAddress += `${neighbourhood} `;
            if (road) fullAddress += `${road} `;
            if (houseNumber) fullAddress += `${houseNumber}`;

            setDetailedAddress(
              fullAddress.trim() || "주소를 찾을 수 없습니다."
            );
            setGpsMessage("GPS 위치 정보 획득 성공!");
          } else {
            setDetailedAddress("주소를 찾을 수 없습니다.");
          }
        } catch (error) {
          console.error("Reverse Geocoding Error:", error);
          setDetailedAddress("주소 정보를 가져오는 데 실패했습니다.");
        } finally {
          setLoadingAddress(false);
        }
      }
    };

    fetchAddress();
  }, [reportData.latitude, reportData.longitude]);

  const handlePhoneInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    part: "part1" | "part2" | "part3"
  ) => {
    const { value } = e.target;
    handlePhoneNumberChange(part, value);

    // 자동 포커스 이동
    if (part === "part1" && value.length === 3 && phonePart2Ref.current) {
      phonePart2Ref.current.focus();
    } else if (
      part === "part2" &&
      value.length === 4 &&
      phonePart3Ref.current
    ) {
      phonePart3Ref.current.focus();
    }
  };

  const handlePhoneInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    part: "part1" | "part2" | "part3"
  ) => {
    // 백스페이스 시 이전 필드로 이동
    if (e.key === "Backspace" && e.currentTarget.value === "") {
      if (part === "part3" && phonePart2Ref.current) {
        phonePart2Ref.current.focus();
      } else if (part === "part2" && phonePart1Ref.current) {
        phonePart1Ref.current.focus();
      }
    }
  };

  const cloggingLevelOptions: string[] = ["양호", "주의", "막힘", "폐색"];
  const causeOptions: string[] = [
    "안막힘",
    "쓰레기",
    "담배꽁초",
    "낙엽",
    "시멘트",
    "나뭇가지",
    "폐기물",
    "토사",
    "기타",
  ];

  return (
    <div className="report-form-container card-container">
      <h2>빗물받이 막힘 신고</h2>

      {isCompressing ? (
        <p>사진 압축 중...</p>
      ) : (
        reportData.photoPreview && (
          <div className="form-group">
            <label>첨부된 사진:</label>
            <img
              src={reportData.photoPreview}
              alt="첨부된 사진"
              className="photo-preview"
            />
          </div>
        )
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>막힘 정도:</label>
          <div className="cause-options">
            {cloggingLevelOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={formState.cloggingLevel === option ? "selected" : ""}
                onClick={() => handleCloggingLevelClick(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>막힘 원인:</label>
          <div className="cause-options">
            {causeOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={formState.causeType === option ? "selected" : ""}
                onClick={() => handleCauseClick(option)}
              >
                {option}
              </button>
            ))}
          </div>
          {formState.causeType === "기타" && (
            <input
              type="text"
              name="causeDetail"
              placeholder="기타 원인 상세 입력"
              value={formState.causeDetail}
              onChange={handleChange}
            />
          )}
        </div>

        <div className="form-group">
          <label>신고자 연락처:</label>
          <div className="phone-input-group">
            <input
              type="tel"
              name="phonePart1"
              placeholder="010"
              value={formState.phoneNumber.part1}
              onChange={(e) => handlePhoneInputChange(e, "part1")}
              onKeyDown={(e) => handlePhoneInputKeyDown(e, "part1")}
              maxLength={3}
              ref={phonePart1Ref}
              required
            />
            <span>-</span>
            <input
              type="tel"
              name="phonePart2"
              placeholder="1234"
              value={formState.phoneNumber.part2}
              onChange={(e) => handlePhoneInputChange(e, "part2")}
              onKeyDown={(e) => handlePhoneInputKeyDown(e, "part2")}
              maxLength={4}
              ref={phonePart2Ref}
              required
            />
            <span>-</span>
            <input
              type="tel"
              name="phonePart3"
              placeholder="5678"
              value={formState.phoneNumber.part3}
              onChange={(e) => handlePhoneInputChange(e, "part3")}
              onKeyDown={(e) => handlePhoneInputKeyDown(e, "part3")}
              maxLength={4}
              ref={phonePart3Ref}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>추가 설명 (300자 제한):</label>
          <textarea
            name="description"
            maxLength={300}
            value={formState.description}
            onChange={handleChange}
            rows={4}
            placeholder="막힘 정도, 악취, 주변 상황 등"
          ></textarea>
        </div>

        <div className="form-group">
          <label>GPS 정보:</label>
          {loadingAddress ? (
            <p>{gpsMessage}</p>
          ) : reportData.latitude && reportData.longitude ? (
            <p>
              {detailedAddress ||
                `위도: ${reportData.latitude.toFixed(
                  4
                )}, 경도: ${reportData.longitude.toFixed(4)}`}
            </p>
          ) : (
            <p>{gpsMessage}</p>
          )}
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting || isCompressing}
        >
          {isSubmitting ? "제출 중..." : "신고하기"}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default ReportForm;
