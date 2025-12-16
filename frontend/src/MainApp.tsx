import React, { useState, useCallback } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import { IntroScreen } from './components/IntroScreen';

const MainApp: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  if (showIntro) {
    return <IntroScreen onComplete={handleIntroComplete} />;
  }

  return <RouterProvider router={router} />;
};

export default MainApp;
