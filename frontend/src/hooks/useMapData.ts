
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import L, { Map } from 'leaflet';
import { ReportBase, FloodDamageCluster } from '../types/reportTypes';

export const useMapData = (mapRef: React.RefObject<Map | null>) => {
  const [reports, setReports] = useState<ReportBase[]>([]);
  const [floodDamages, setFloodDamages] = useState<FloodDamageCluster[]>([]);
  const [userLocation, setUserLocation] = useState<L.LatLng | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(13);
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);

  const updateMapState = () => {
    const map = mapRef.current;
    if (map) {
      setZoom(map.getZoom());
      setBounds(map.getBounds());
    }
  };
  
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const response = await axios.get<ReportBase[]>(
          `${process.env.REACT_APP_API_URL}/api/reports`
        );
        setReports(response.data);
      } catch (err) {
        setError("신고 데이터를 불러오는 데 실패했습니다.");
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    if (!bounds) {
      if (mapRef.current) {
        setBounds(mapRef.current.getBounds());
      }
      return;
    }

    const fetchFloodDamages = async () => {
      try {
        const params = {
          zoom: zoom,
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        };
        const response = await axios.get<FloodDamageCluster[]>(
          `${process.env.REACT_APP_API_URL}/api/flood-damages`,
          { params }
        );
        setFloodDamages(response.data);
      } catch (err) {
        setError("침수 피해 데이터를 불러오는 데 실패했습니다.");
        console.error("Error fetching flood damages:", err);
      }
    };
    fetchFloodDamages();
  }, [zoom, bounds]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation(
            new L.LatLng(position.coords.latitude, position.coords.longitude)
          );
        },
        (err) => {
          setLocationError(
            "현재 위치를 가져오는 데 실패했습니다. 위치 정보 접근 권한을 확인해주세요."
          );
          console.error("Error getting user location:", err);
        }
      );
    } else {
      setLocationError("이 브라우저에서는 위치 정보가 지원되지 않습니다.");
    }
  }, []);

  return {
    reports,
    floodDamages,
    userLocation,
    loading,
    error,
    locationError,
    zoom,
    bounds,
    updateMapState,
  };
};
