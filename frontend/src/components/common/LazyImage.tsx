import React, { useState } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="lazy-image-container">
      {isLoading && <div className="image-loader-spinner"></div>}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? "loading" : "loaded"}`}
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)} // 에러 나도 스피너 꺼주기
        style={{ display: isLoading ? "none" : "block" }}
      />
    </div>
  );
};

export default LazyImage;
