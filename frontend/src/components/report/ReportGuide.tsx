import React from 'react';
import { Link } from 'react-router-dom';

const ReportGuide: React.FC = () => {
  const steps = [
    {
      title: "사진 촬영",
      description: "막힌 빗물받이가 잘 보이도록 사진을 촬영합니다.",
    },
    {
      title: "정보 입력",
      description: "막힘 원인, 연락처 등 추가 정보를 입력합니다.",
    },
    {
      title: "위치 확인",
      description: "GPS를 통해 현재 위치가 정확한지 확인합니다.",
    },
  ];

  return (
    <div className="content-container">
      <div className="report-guide center-content-text">
        <div className="card-container">
          <h2>신고 절차 안내</h2>
          <p className="secondary-text">정확한 신고를 위해 다음 절차를 따라주세요.</p>
        </div>

        <div className="guide-steps">
          {steps.map((step, index) => (
            <div key={index} className="guide-step-card">
              <div className="step-number">{index + 1}</div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p className="secondary-text">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card-container privacy-info">
          <p className="secondary-text">수집된 개인정보는 신고 처리 목적으로만 사용됩니다.</p>
        </div>
        
        <Link to="/report/capture" className="menu-button">확인 후 신고하기</Link>
      </div>
    </div>
  );
};

export default ReportGuide;