import React, { useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { Map } from "leaflet";
import { HeatmapLayer } from "react-leaflet-heatmap-layer-v3";
import useWindowDimensions from "../hooks/useWindowDimensions";
import { useMapData } from "../hooks/useMapData";
import {
  ReportBase,
  FloodDamageCluster,
  ReportDetail,
} from "../types/reportTypes";
import ReportPopup from "./ReportPopup";
import { getCloggingLevelColor, getMarkerIcon } from "../utils/mapUtils";
import * as XLSX from "xlsx"; // xlsx 라이브러리 임포트
import { getAddressFromCoordinates } from "../utils/geoUtils"; // 지오코딩 유틸리티 임포트
import axios from "axios"; // axios 임포트 추가

// Leaflet 아이콘 경로 설정
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const MapView: React.FC = () => {
  const mapRef = useRef<Map>(null);

  // useMapData 훅으로 데이터 로직 관리
  const {
    reports,
    floodDamages,
    userLocation,
    loading,
    error,
    locationError,
    zoom,
    updateMapState,
  } = useMapData(mapRef);

  const [showPoints, setShowPoints] = useState<boolean>(true);
  const [showReportHeatmap, setShowReportHeatmap] = useState<boolean>(false);
  const [showFloodDamageHeatmap, setShowFloodDamageHeatmap] =
    useState<boolean>(false);
  const [filters, setFilters] = useState({
    양호: true,
    주의: true,
    막힘: true,
    폐색: true,
  });
  const [isDownloading, setIsDownloading] = useState(false); // 다운로드 로딩 상태

  const { width } = useWindowDimensions();
  const isPC = width > 768;

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: checked,
    }));
  };

  const handleLayerToggle = (layer: string) => {
    switch (layer) {
      case "points":
        setShowPoints(!showPoints);
        break;
      case "reportHeatmap":
        setShowReportHeatmap(!showReportHeatmap);
        if (showReportHeatmap) setShowFloodDamageHeatmap(false);
        break;
      case "floodHeatmap":
        setShowFloodDamageHeatmap(!showFloodDamageHeatmap);
        if (showFloodDamageHeatmap) setShowReportHeatmap(false);
        break;
      default:
        break;
    }
  };

  // 맵 이벤트를 처리하는 컴포넌트
  const MapEvents = () => {
    useMapEvents({
      zoomend: updateMapState,
      moveend: updateMapState,
    });
    return null;
  };

  const handleDownloadCloggingData = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const dataToExport = await Promise.all(
        filteredReports.map(async (report) => {
          const [detailRes, address] = await Promise.all([
            axios.get<ReportDetail>(
              `${process.env.REACT_APP_API_URL}/api/reports/${report.reportId}`
            ),
            getAddressFromCoordinates(report.latitude, report.longitude),
          ]);
          const reportDetail = detailRes.data;

          return {
            "신고 ID": report.reportId,
            "막힘 수준": report.cloggingLevel,
            "막힘 원인": reportDetail.causeType,
            "휴대폰 번호": reportDetail.phoneNumber,
            위도: report.latitude,
            경도: report.longitude,
            주소: address,
            "신고 날짜": new Date(reportDetail.createdAt).toLocaleString(),
          };
        })
      );

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "막힘 데이터");
      XLSX.writeFile(workbook, "막힘_데이터.xlsx");
    } catch (err) {
      console.error("Error preparing clogging data for download:", err);
      alert("막힘 데이터를 준비하는 중 오류가 발생했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadFloodData = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/flood-damages/all`
      );
      const allFloodDamages = response.data;

      const dataToExport = allFloodDamages.map((data: any) => ({
        연번: data.sequence,
        피해발생일자: data.damageDate,
        위도: data.latitude,
        경도: data.longitude,
        주소: data.address,
        생성일: new Date(data.createdAt).toLocaleString(),
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "침수 데이터");
      XLSX.writeFile(workbook, "침수_데이터.xlsx");
    } catch (err) {
      console.error("Error fetching all flood damages for download:", err);
      alert("침수 데이터를 불러오는 데 실패했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return <p>지도 데이터를 불러오는 중...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  const defaultCenter: L.LatLngExpression = [35.1595, 126.8526]; // 광주광역시 좌표
  const mapCenter: L.LatLngExpression =
    userLocation ||
    (reports.length > 0
      ? [reports[0].latitude, reports[0].longitude]
      : defaultCenter);

  const filteredReports = reports.filter(
    (report) => (filters as any)[report.cloggingLevel]
  );

  const heatmapData = (level: string) =>
    filteredReports
      .filter((r) => r.cloggingLevel === level)
      .map((r) => [r.latitude, r.longitude, 1.0]);

  return (
    <div className="map-view-container">
      {locationError && (
        <p className="location-error-message">{locationError}</p>
      )}
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        minZoom={10}
        maxZoom={18}
        style={
          isPC
            ? { height: "100%", width: "100%", margin: 0 }
            : { height: "83%", width: "95%", margin: "0 auto" }
        }
        ref={mapRef}
      >
        <MapEvents />
        <div className="map-view-switcher">
          <div className="legend-item">
            <input
              type="checkbox"
              checked={showPoints}
              onChange={() => handleLayerToggle("points")}
            />
            <span>막힘(포인트)</span>
          </div>
          <div className="legend-item">
            <input
              type="checkbox"
              checked={showReportHeatmap}
              onChange={() => handleLayerToggle("reportHeatmap")}
            />
            <span>막힘(히트맵)</span>
          </div>
          <div className="legend-item">
            <input
              type="checkbox"
              checked={showFloodDamageHeatmap}
              onChange={() => handleLayerToggle("floodHeatmap")}
            />
            <span>침수(히트맵)</span>
          </div>
          {/* 엑셀 다운로드 버튼 추가 */}
          <div className="download-buttons">
            <button
              onClick={handleDownloadCloggingData}
              disabled={isDownloading}
            >
              {isDownloading ? "다운로드 중..." : "막힘 데이터 다운로드"}
            </button>
            {/* <button onClick={handleDownloadFloodData} disabled={isDownloading}>
              {isDownloading ? "다운로드 중..." : "침수 데이터 다운로드"}
            </button> */}
          </div>
        </div>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <div className="map-legend">
          <div className="legend-section">
            <h4>막힘 정도 (신고)</h4>
            {Object.keys(filters).map((level) => (
              <div key={level} className="legend-item">
                <input
                  type="checkbox"
                  name={level}
                  checked={(filters as any)[level]}
                  onChange={handleFilterChange}
                  className="filter-checkbox"
                />
                <span
                  className="legend-color"
                  style={{
                    backgroundColor: getCloggingLevelColor(level),
                  }}
                ></span>
                <span>{level}</span>
              </div>
            ))}
          </div>
          <div className="legend-section">
            <h4>침수 피해</h4>
            <div className="legend-item">
              <span
                className="legend-color"
                style={{
                  background:
                    "linear-gradient(to right, rgba(33, 163, 214, 0.1), rgba(33, 163, 214, 0.7))",
                }}
              ></span>
              <span>침수 지역</span>
            </div>
          </div>
        </div>
        {showReportHeatmap && (
          <>
            <HeatmapLayer
              points={heatmapData("양호")}
              longitudeExtractor={(m: any) => m[1]}
              latitudeExtractor={(m: any) => m[0]}
              intensityExtractor={(m: any) => m[2]}
              gradient={{
                0.4: "rgba(76, 175, 80, 0.1)",
                1.0: "rgba(76, 175, 80, 0.3)",
              }}
              radius={20}
              blur={35}
              max={1.0}
            />
            <HeatmapLayer
              points={heatmapData("주의")}
              longitudeExtractor={(m: any) => m[1]}
              latitudeExtractor={(m: any) => m[0]}
              intensityExtractor={(m: any) => m[2]}
              gradient={{
                0.4: "rgba(255, 235, 59, 0.1)",
                1.0: "rgba(255, 235, 59, 0.3)",
              }}
              radius={20}
              blur={35}
              max={1.0}
            />
            <HeatmapLayer
              points={heatmapData("막힘")}
              longitudeExtractor={(m: any) => m[1]}
              latitudeExtractor={(m: any) => m[0]}
              intensityExtractor={(m: any) => m[2]}
              gradient={{
                0.4: "rgba(255, 152, 0, 0.1)",
                1.0: "rgba(255, 152, 0, 0.3)",
              }}
              radius={20}
              blur={35}
              max={1.0}
            />
            <HeatmapLayer
              points={heatmapData("폐색")}
              longitudeExtractor={(m: any) => m[1]}
              latitudeExtractor={(m: any) => m[0]}
              intensityExtractor={(m: any) => m[2]}
              gradient={{
                0.4: "rgba(244, 67, 54, 0.1)",
                1.0: "rgba(244, 67, 54, 0.3)",
              }}
              radius={20}
              blur={35}
              max={1.0}
            />
          </>
        )}
        {showFloodDamageHeatmap && (
          <HeatmapLayer
            points={floodDamages}
            longitudeExtractor={(cluster: FloodDamageCluster) =>
              cluster.longitude
            }
            latitudeExtractor={(cluster: FloodDamageCluster) =>
              cluster.latitude
            }
            intensityExtractor={(cluster: FloodDamageCluster) => cluster.count}
            gradient={{
              0.4: "rgba(33, 163, 214, 0.1)",
              1.0: "rgba(33, 163, 214, 0.7)",
            }}
            radius={20}
            blur={15}
            max={10}
          />
        )}
        {showPoints &&
          filteredReports.map((report) => (
            <Marker
              key={report.reportId}
              position={[report.latitude, report.longitude]}
              icon={getMarkerIcon(report.cloggingLevel, L)}
            >
              <Popup>
                <ReportPopup reportId={report.reportId} />
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
