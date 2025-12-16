import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReport } from '../../context/ReportContext';

interface LocationState {
  file: File;
  previewUrl: string;
}

const PhotoConfirm: React.FC = () => {
  const { } = useReport(); // setPhoto removed
  const navigate = useNavigate();
  const location = useLocation();

  const { file, previewUrl } = (location.state as LocationState) || {};

  useEffect(() => {
    // ONLY check for the state and redirect if it's missing.
    if (!file || !previewUrl) {
      navigate('/report/capture');
    }
  }, [file, previewUrl, navigate]);

  const handleNext = () => {
    // Pass the data directly to the next route.
    navigate('/report/form', { state: { file, previewUrl } });
  };

  // Don't render anything if the required state is missing, as we'll be redirecting
  if (!previewUrl) {
    return null;
  }

  return (
    <div className="content-container">
      <div className="photo-confirm center-content-text card-container">
        <h2>사진 확인</h2>
        <p className="secondary-text">이 사진으로 신고하시겠습니까?</p>
        <img src={previewUrl} alt="신고 사진 미리보기" className="photo-preview" />
        <div className="button-group">
          <button onClick={() => navigate('/report/capture')} className="menu-button secondary">
            다시 촬영
          </button>
          <button onClick={handleNext} className="menu-button">
            다음
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoConfirm;