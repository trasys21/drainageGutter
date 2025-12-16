import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./TopNav.module.scss";

const TopNav: React.FC = () => {
  return (
    <nav className={styles.topNav}>
      <div className={styles.logo}>
        <NavLink to="/">
          <img src="/images/logo.svg" alt="Logo" />
        </NavLink>
      </div>
      <div className={styles.navLinks}>
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? styles.active : "")}
        >
          홈
        </NavLink>
        <NavLink
          to="/map"
          className={({ isActive }) => (isActive ? styles.active : "")}
        >
          지도
        </NavLink>
      </div>
    </nav>
  );
};

export default TopNav;
