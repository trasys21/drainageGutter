import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PlusSquare, Map } from 'react-feather';

const BottomNav: React.FC = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end>
        <Home />
        <span>홈</span>
      </NavLink>
      <NavLink to="/report/guide">
        <PlusSquare />
        <span>신고하기</span>
      </NavLink>
      <NavLink to="/map">
        <Map />
        <span>지도</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;