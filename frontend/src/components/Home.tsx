import React from "react";
import { Link } from "react-router-dom";
import useWindowDimensions from "../hooks/useWindowDimensions";
import WeatherDisplay from "./WeatherDisplay";

const Home: React.FC = () => {
  const { width } = useWindowDimensions();
  const isPC = width > 768;

  return (
    <div className="content-container">
      {isPC && (
        <div className="card-container message">
          <p>신고하기는 모바일 환경에서만 이용 가능합니다.</p>
        </div>
      )}
      <div className="center-content-text card-container">
        <h2>무엇을 도와드릴까요?</h2>
        <p className="secondary-text">
          빗물받이 관련 문제를 신고하거나,
          <br />
          현재 신고된 현황을 지도에서 확인해보세요.
        </p>
        <div className="home-menu">
          {isPC ? (
            <div className="menu-button disabled">신고하기</div>
          ) : (
            <Link to="/report/guide" className="menu-button">
              신고하기
            </Link>
          )}
          <Link to="/map" className="menu-button">
            지도 보기
          </Link>
        </div>
      </div>
      <WeatherDisplay /> {/* Add the WeatherDisplay component here */}
    </div>
  );
};

export default Home;
