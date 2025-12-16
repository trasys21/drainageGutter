import React from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import App from './App';
import Home from './components/Home';
import MapView from './components/MapView';
import ReportGuide from './components/report/ReportGuide';
import PhotoCapture from './components/report/PhotoCapture';
import PhotoConfirm from './components/report/PhotoConfirm';
import ReportForm from './components/ReportForm';
import { ReportProvider } from './context/ReportContext';
import About from './components/About';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { 
        index: true, 
        element: <Home />,
        handle: { title: '홈' }
      },
      { 
        path: 'map', 
        element: <MapView />,
        handle: { title: '신고 현황 지도' }
      },
      {
        path: 'about',
        element: <About />,
        handle: { title: '기업 정보' },
      },
      {
        path: 'report',
        element: <ReportProvider><Outlet /></ReportProvider>,
        children: [
          { 
            path: 'guide', 
            element: <ReportGuide />,
            handle: { title: '신고 안내' }
          },
          { 
            path: 'capture', 
            element: <PhotoCapture />,
            handle: { title: '사진 촬영' }
          },
          { 
            path: 'confirm-photo', 
            element: <PhotoConfirm />,
            handle: { title: '사진 확인' }
          },
          { 
            path: 'form', 
            element: <ReportForm />,
            handle: { title: '신고서 작성' }
          },
        ],
      },
    ],
  },
]);

export default router;