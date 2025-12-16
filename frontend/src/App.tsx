import React from "react";
import { Outlet, useNavigation, useMatches } from "react-router-dom";
import useWindowDimensions from "./hooks/useWindowDimensions";
import Header from "./components/layout/Header";
import BottomNav from "./components/layout/BottomNav";
import PCBlocker from "./components/PCBlocker";
import LoadingSpinner from "./components/common/LoadingSpinner";
import "./App.scss";
import TopNav from "./components/layout/TopNav";

// const APP_MAX_WIDTH = 1024;

// Define the shape of the route handle
interface RouteHandle {
  title?: string;
}

// Define the shape of the match object from useMatches
interface RouteMatch {
  handle: RouteHandle;
  // Add other properties from the match object if needed
  id: string;
  pathname: string;
  params: Record<string, string>;
  data: unknown;
}

// ... (rest of the file remains the same)

// ... (keep existing code until getTitleFromMatches)

// A helper to get the title from the route's handle
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

  // if (width > APP_MAX_WIDTH) {
  //   return <PCBlocker />;
  // }

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
