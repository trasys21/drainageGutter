import React, { useState, useEffect } from "react";
import axios from "axios";
import LazyImage from "./common/LazyImage";
import { getCloggingLevelColor } from "../utils/mapUtils";
import { ReportDetail } from "../types/reportTypes";

interface ReportPopupProps {
  reportId: string;
}

const ReportPopup: React.FC<ReportPopupProps> = ({ reportId }) => {
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportDetail = async () => {
      // reportId가 유효하지 않으면 요청하지 않음
      if (!reportId) {
        setLoading(false);
        setError("유효하지 않은 신고 ID입니다.");
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get<ReportDetail>(
          `${process.env.REACT_APP_API_URL}/api/reports/${reportId}`
        );
        setReport(response.data);
      } catch (err) {
        setError("신고 상세 정보를 불러오는 데 실패했습니다.");
        console.error("Error fetching report detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetail();
  }, [reportId]);

  if (loading) {
    return <div className="report-popup-content">상세 정보 로딩 중...</div>;
  }

  if (error || !report) {
    return (
      <div className="report-popup-content" style={{ color: "red" }}>
        {error}
      </div>
    );
  }

  return (
    <div className="report-popup-content">
      <h3>신고 상세 정보</h3>
      {/* {report.thumbnailUrl && (
        <a
          href={`${process.env.REACT_APP_API_URL}${report.photoUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <LazyImage
            src={`${process.env.REACT_APP_API_URL}${report.thumbnailUrl}`}
            alt="신고 사진"
            className="report-popup-image"
          />
        </a>
      )} */}
      <div className="report-details">
        <p>
          <strong>막힘 정도:</strong>{" "}
          <span
            style={{
              color: getCloggingLevelColor(report.cloggingLevel),
              fontWeight: "bold",
            }}
          >
            {report.cloggingLevel}
          </span>
        </p>{" "}
        <p>
          <strong>막힘 원인:</strong> {report.causeType}{" "}
          {report.causeDetail ? `(${report.causeDetail})` : ""}
        </p>
        <p>
          <strong>신고 일시:</strong>{" "}
          {new Date(report.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default ReportPopup;
