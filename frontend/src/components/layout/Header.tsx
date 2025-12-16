import React from "react";
import { Link } from "react-router-dom";

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="App-header">
      <div className="header-logo-wrapper">
        <img src="/images/logo.svg" alt="Logo" className="header-logo" />
      </div>
      <div className="header-right">
        <Link to="/about" className="header-button">
          About
        </Link>
      </div>
    </header>
  );
};

export default Header;
