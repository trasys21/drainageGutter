
// 기본 신고 정보 (지도에 표시될 최소한의 데이터)
export interface ReportBase {
    _id: string;
    reportId: string;
    latitude: number;
    longitude: number;
    cloggingLevel: string;
  }
  
  // 상세 신고 정보 (팝업에 표시될 전체 데이터)
  export interface ReportDetail extends ReportBase {
    causeType: string;
    causeDetail?: string;
    description?: string;
    phoneNumber: string;
    photoUrl: string;
    thumbnailUrl: string;
    status: string;
    createdAt: string;
  }
  
  // 침수 피해 클러스터 정보
  export interface FloodDamageCluster {
    _id: {
      lat_grid: number;
      lng_grid: number;
    };
    latitude: number;
    longitude: number;
    count: number;
  }
  