import React from "react";
import { Grid, Smartphone } from "react-feather";

const PCBlocker: React.FC = () => {
  return (
    <div className="pc-blocker">
      <div className="pc-blocker-content">
        <Smartphone size={48} />
        <h1>모바일/태블릿 환경에 최적화되어 있습니다.</h1>
        <p>더 나은 사용 경험을 위해 모바일 기기로 접속해주세요.</p>
        <div className="qr-code-placeholder">
          <img
            src="/images/qr.png"
            style={{ width: "150px", height: "150px" }}
          />
          <p>QR 코드를 스캔하세요</p>
        </div>
      </div>
    </div>
  );
};

export default PCBlocker;
