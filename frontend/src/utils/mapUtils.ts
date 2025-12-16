
// 막힘 정도에 따른 색상을 반환하는 함수
export const getCloggingLevelColor = (cloggingLevel: string) => {
    switch (cloggingLevel) {
      case "양호":
        return "#4CAF50"; // 초록색
      case "주의":
        return "#FFEB3B"; // 노란색
      case "막힘":
        return "#FF9800"; // 주황색
      case "폐색":
        return "#F44336"; // 빨간색
      default:
        return "#9E9E9E"; // 회색
    }
  };
  
  // 막힘 정도에 따라 마커 아이콘을 생성하는 함수
  export const getMarkerIcon = (cloggingLevel: string, L: any) => {
    const color = getCloggingLevelColor(cloggingLevel);
  
    return L.divIcon({
      className: "custom-div-icon",
      html: `<div style="background-color: ${color}; width: 1.5rem; height: 1.5rem; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9rem;">
             </div>`,
      iconSize: [15, 15],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    });
  };
  