import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image } from 'react-feather';

const PhotoCapture: React.FC = () => {
  const navigate = useNavigate();
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Pass the file and a newly created preview URL directly via navigation state
      navigate('/report/confirm-photo', { 
        state: { 
          file, 
          previewUrl: URL.createObjectURL(file) 
        } 
      });
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  return (
    <div className="content-container">
      <div className="photo-capture center-content-text card-container">
        <h2>사진 첨부</h2>
        <p className="secondary-text">신고할 빗물받이 사진을 첨부해주세요.</p>
        
        {/* Hidden file inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Visible buttons for the user */}
        <div className="capture-options">
          <button onClick={() => cameraInputRef.current?.click()} className="capture-button">
            <Camera size={24} />
            <span>카메라로 촬영</span>
          </button>
          <button onClick={() => galleryInputRef.current?.click()} className="capture-button">
            <Image size={24} />
            <span>갤러리에서 선택</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoCapture;
