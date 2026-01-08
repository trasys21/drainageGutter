import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, Check } from 'react-feather';

const PhotoCapture: React.FC = () => {
  const navigate = useNavigate();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [firstPhotoBlob, setFirstPhotoBlob] = useState<Blob | null>(null);
  const [firstPhotoLocation, setFirstPhotoLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
    setStep(1); 
    setFirstPhotoBlob(null); 
  }, [stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    if (isCameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraActive, stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      setStep(1);
    } catch (err) {
      console.warn('Environment camera not found, trying fallback...', err);
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        setStream(mediaStream);
        setIsCameraActive(true);
        setStep(1);
      } catch (fallbackErr) {
        console.error('Error accessing camera:', fallbackErr);
        alert('카메라에 접근할 수 없습니다. 권한을 확인해주세요.');
        cameraInputRef.current?.click();
      }
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (!blob) return;

          if (step === 1) {
            setFirstPhotoBlob(blob);
            setStep(2);
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  setFirstPhotoLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                  });
                },
                (error) => {
                  console.warn("Could not get location on first photo capture:", error);
                },
                { enableHighAccuracy: true }
              );
            }
          } else {
            mergeAndNavigate(blob);
          }
        }, 'image/jpeg', 0.85);
      }
    }
  };

  const mergeAndNavigate = async (secondBlob: Blob) => {
    if (!firstPhotoBlob) return;

    try {
      const img1 = await createImageBitmap(firstPhotoBlob);
      const img2 = await createImageBitmap(secondBlob);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      canvas.width = Math.max(img1.width, img2.width);
      canvas.height = img1.height + img2.height;

      ctx.drawImage(img1, 0, 0);
      ctx.drawImage(img2, 0, img1.height);

      canvas.toBlob((mergedBlob) => {
        if (mergedBlob) {
          const file = new File([mergedBlob], 'merged_report_photo.jpg', { type: 'image/jpeg' });
          stopCamera();
          navigate('/report/confirm-photo', { 
            state: { 
              file, 
              previewUrl: URL.createObjectURL(file),
              latitude: firstPhotoLocation?.latitude,
              longitude: firstPhotoLocation?.longitude
            } 
          });
        }
      }, 'image/jpeg', 0.85);

    } catch (error) {
      console.error("Error merging images:", error);
      alert("사진 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      setStep(1);
      setFirstPhotoBlob(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      navigate('/report/confirm-photo', { 
        state: { 
          file, 
          previewUrl: URL.createObjectURL(file) 
        } 
      });
    }
    event.target.value = '';
  };

  if (isCameraActive) {
    return (
      <div className="camera-container">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        <div className="camera-overlay">
          <div className={`guide-box step-${step}`}>
            {step === 1 && (
              <div className="top-boundary-line"></div>
            )}
            {step === 2 && (
              <div className="right-boundary-line"></div>
            )}

            <div className="guide-text">
              <span className="step-indicator">단계 {step} / 2</span>
              {step === 1 
                ? "빗물받이가 잘 보이도록\n위에서 정면으로 촬영해주세요."
                : "점선을 도로/건물 경계에 맞춰\n빗물받이를 멀리서 촬영해주세요."}
            </div>
          </div>
          
          <div className="camera-controls">
            <button onClick={stopCamera} className="control-button">
              <X size={28} />
              <span>닫기</span>
            </button>
            
            <button onClick={capturePhoto} className="control-button capture-trigger">
            </button>
            
            <div style={{ width: 60 }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="photo-capture center-content-text card-container">
        <h2>사진 촬영</h2>
        <p className="secondary-text">
          정확한 신고를 위해<br/>
          <strong>2장의 사진</strong>을 촬영합니다.
        </p>
        
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <div className="capture-options">
          <button onClick={startCamera} className="capture-button">
            <Camera size={24} />
            <span>카메라 켜기</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoCapture;
