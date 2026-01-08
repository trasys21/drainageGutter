import React from "react";
import { Outlet, useNavigation, useMatches } from "react-router-dom";
import useWindowDimensions from "./hooks/useWindowDimensions";
import Header from "./components/layout/Header";
import BottomNav from "./components/layout/BottomNav";
import PCBlocker from "./components/PCBlocker";
import LoadingSpinner from "./components/common/LoadingSpinner";
import "./App.scss";
import TopNav from "./components/layout/TopNav";

interface RouteHandle {
  title?: string;
}


interface RouteMatch {
  handle: RouteHandle;
  id: string;
  pathname: string;
  params: Record<string, string>;
  data: unknown;
}


const getTitleFromMatches = (matches: RouteMatch[]): string => {
  const match = matches.find((m) => m.handle?.title);
  return match?.handle?.title || "빗물받이 신고 시스템";
};

const App: React.FC = () => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const matches = useMatches() as RouteMatch[];
  const title = getTitleFromMatches(matches);

  const isPC = width > 768;

  return (
    <div className={isPC ? "App pc-layout" : "App"}>
      {isPC ? <TopNav /> : <Header title={title} />}
      <main className="App-content">
        {navigation.state === "loading" && <LoadingSpinner />}
        <div
          className="page-container"
          style={{ opacity: navigation.state === "loading" ? 0.5 : 1 }}
        >
          <Outlet />
        </div>
      </main>
      {isPC ? null : <BottomNav />}
    </div>
  );
};

export default App;
