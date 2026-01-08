import React, { useEffect, useState } from "react";
import {
  BsSun,
  BsCloud,
  BsCloudFog,
  BsCloudDrizzle,
  BsCloudDrizzleFill,
  BsCloudRain,
  BsCloudRainFill,
  BsSnow,
  BsCloudLightningRain,
  BsCloudLightningRainFill,
  BsCloudRainHeavy,
} from "react-icons/bs";

interface DailyWeather {
  time: string;
  weathercode: number;
  temperature_2m_max: number;
  temperature_2m_min: number;
}

interface HourlyWeather {
  time: string;
  temperature_2m: number;
  weathercode: number;
}

const WeatherDisplay: React.FC = () => {
  const [weatherData, setWeatherData] = useState<DailyWeather[] | null>(null);
  const [hourlyWeatherData, setHourlyWeatherData] = useState<
    HourlyWeather[] | null
  >(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);

  const getWeatherDescription = (weathercode: number) => {
    switch (weathercode) {
      case 0:
        return "맑음";
      case 1:
      case 2:
      case 3:
        return "대체로 맑음";
      case 45:
      case 48:
        return "안개";
      case 51:
      case 53:
      case 55:
        return "이슬비";
      case 56:
      case 57:
        return "어는 이슬비";
      case 61:
      case 63:
      case 65:
        return "비";
      case 66:
      case 67:
        return "어는 비";
      case 71:
      case 73:
      case 75:
        return "눈";
      case 77:
        return "싸락눈";
      case 80:
      case 81:
      case 82:
        return "소나기";
      case 85:
      case 86:
        return "눈 소나기";
      case 95:
        return "뇌우";
      case 96:
      case 99:
        return "우박을 동반한 뇌우";
      default:
        return "알 수 없음";
    }
  };

  const getWeatherIcon = (weathercode: number) => {
    const iconProps = { size: 24, className: "weather-icon" };
    switch (weathercode) {
      case 0:
        return <BsSun {...iconProps} />;
      case 1:
      case 2:
      case 3:
        return <BsCloud {...iconProps} />;
      case 45:
      case 48:
        return <BsCloudFog {...iconProps} />;
      case 51:
      case 53:
      case 55:
        return <BsCloudDrizzle {...iconProps} />;
      case 56:
      case 57:
        return <BsCloudDrizzleFill {...iconProps} />;
      case 61:
      case 63:
      case 65:
        return <BsCloudRain {...iconProps} />;
      case 66:
      case 67:
        return <BsCloudRainFill {...iconProps} />;
      case 71:
      case 73:
      case 75:
      case 77:
        return <BsSnow {...iconProps} />;
      case 80:
      case 81:
      case 82:
        return <BsCloudRainHeavy {...iconProps} />;
      case 85:
      case 86:
        return <BsSnow {...iconProps} />;
      case 95:
        return <BsCloudLightningRain {...iconProps} />;
      case 96:
      case 99:
        return <BsCloudLightningRainFill {...iconProps} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log(
              "Geolocation successful:",
              position.coords.latitude,
              position.coords.longitude
            );
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (err) => {
            console.error("위치 정보를 가져오는 데 실패했습니다:", err);
            setError(
              "위치 정보를 가져올 수 없습니다. 기본 위치(서울)로 날씨를 표시합니다."
            );
            setUserLocation({ latitude: 37.5665, longitude: 126.978 });
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } else {
        setError(
          "이 브라우저에서는 위치 정보가 지원되지 않습니다. 기본 위치(서울)로 날씨를 표시합니다."
        );
        setUserLocation({ latitude: 37.5665, longitude: 126.978 });
      }
    };

    fetchUserLocation();
  }, []);

  useEffect(() => {
    if (!userLocation) {
      console.log("userLocation is null, skipping API calls.");
      return;
    }

    const fetchWeatherAndLocationName = async () => {
      setLoading(true);
      setError(null);
      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weathercode&forecast_days=7&timezone=Asia%2FSeoul`;
        console.log("Fetching weather from:", weatherUrl);
        const weatherResponse = await fetch(weatherUrl);
        if (!weatherResponse.ok) {
          throw new Error(
            `날씨 정보를 가져오는 데 실패했습니다: HTTP error! status: ${weatherResponse.status}`
          );
        }
        const weatherData = await weatherResponse.json();
        console.log("Weather data received:", weatherData);

        if (weatherData && weatherData.daily) {
          const dailyWeather: DailyWeather[] = weatherData.daily.time.map(
            (time: string, index: number) => ({
              time: time,
              weathercode: weatherData.daily.weathercode[index],
              temperature_2m_max: weatherData.daily.temperature_2m_max[index],
              temperature_2m_min: weatherData.daily.temperature_2m_min[index],
            })
          );
          setWeatherData(dailyWeather);
        } else {
          setError("일별 날씨 데이터를 찾을 수 없습니다.");
        }

        if (weatherData && weatherData.hourly) {
          const hourlyWeather: HourlyWeather[] = weatherData.hourly.time.map(
            (time: string, index: number) => ({
              time: time,
              temperature_2m: weatherData.hourly.temperature_2m[index],
              weathercode: weatherData.hourly.weathercode[index],
            })
          );
          const now = new Date();
          const currentHour = now.getHours();
          const filteredHourly = hourlyWeather
            .filter((item) => {
              const itemDate = new Date(item.time);
              return (
                (itemDate.getDate() === now.getDate() &&
                  itemDate.getHours() >= currentHour) ||
                (itemDate.getDate() === now.getDate() + 1 &&
                  itemDate.getHours() < currentHour)
              );
            })
            .slice(0, 24);

          setHourlyWeatherData(filteredHourly);
        } else {
          setError((prev) =>
            prev
              ? prev + " 시간별 날씨 데이터를 찾을 수 없습니다."
              : "시간별 날씨 데이터를 찾을 수 없습니다."
          );
        }

        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.latitude}&lon=${userLocation.longitude}&zoom=10&addressdetails=1&accept-language=ko`;
        console.log("Fetching location from Nominatim:", nominatimUrl);
        const geocodingResponse = await fetch(nominatimUrl);
        if (!geocodingResponse.ok) {
          throw new Error(
            `위치 이름을 가져오는 데 실패했습니다: HTTP error! status: ${geocodingResponse.status}`
          );
        }
        const geocodingData = await geocodingResponse.json();
        console.log("Nominatim geocoding data received:", geocodingData);

        if (geocodingData && geocodingData.address) {
          const address = geocodingData.address;
          let displayAddress = "";
          if (address.city) displayAddress = address.city;
          else if (address.town) displayAddress = address.town;
          else if (address.village) displayAddress = address.village;
          else if (address.county) displayAddress = address.county;
          else if (address.state) displayAddress = address.state;
          else if (address.country) displayAddress = address.country;

          if (displayAddress) {
            setLocationName(displayAddress);
          } else {
            setLocationName(geocodingData.display_name || "알 수 없는 위치");
          }
        } else {
          setLocationName("알 수 없는 위치");
        }
      } catch (e: any) {
        setError(`데이터를 가져오는 데 실패했습니다: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherAndLocationName();
  }, [userLocation]);

  if (loading) {
    return <div className="card-container">날씨 정보를 불러오는 중...</div>;
  }

  if (error && !weatherData) {
    return <div className="card-container error">{error}</div>;
  }

  if (!weatherData || weatherData.length === 0) {
    return (
      <div className="card-container">날씨 정보를 사용할 수 없습니다.</div>
    );
  }

  const todayWeather = weatherData[0];
  const isRainingToday = [
    51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99,
  ].includes(todayWeather.weathercode);

  const renderRaindrops = () => {
    const drops = [];
    for (let i = 0; i < 100; i++) {
      const style = {
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * -20}s`,
        animationDuration: `${0.5 + Math.random() * 0.5}s`,
        opacity: `${0.5 + Math.random() * 0.5}`,
        transform: `scale(${0.5 + Math.random() * 0.5})`,
      };
      drops.push(<div key={i} className="drop" style={style}></div>);
    }
    return drops;
  };

  return (
    <div className="weather-section">
      <div className="card-container current-day-weather">
        <h3>
          {locationName ? `${locationName}의 ` : ""}오늘의 날씨 (
          {new Date(todayWeather.time).toLocaleDateString("ko-KR", {
            month: "long",
            day: "numeric",
          })}
          )
        </h3>
        <div className="weather-summary">
          {getWeatherIcon(todayWeather.weathercode)}
          <p>{getWeatherDescription(todayWeather.weathercode)}</p>
        </div>
        <p className="temp-range">
          최고: {todayWeather.temperature_2m_max}°C / 최저:{" "}
          {todayWeather.temperature_2m_min}°C
        </p>
        {error && <p className="location-error-message">{error}</p>}
      </div>

      {hourlyWeatherData && hourlyWeatherData.length > 0 && (
        <div className="card-container hourly-forecast-card-container">
          <h3>시간대별 예보</h3>
          <div className="hourly-forecast-list">
            {hourlyWeatherData.map((hour, index) => (
              <div key={index} className="hourly-forecast-card">
                <p className="time">
                  {new Date(hour.time).toLocaleTimeString("ko-KR", {
                    hour: "numeric",
                    hour12: false,
                  })}
                </p>
                {getWeatherIcon(hour.weathercode)}
                <p className="temperature">{hour.temperature_2m}°C</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isRainingToday && (
        <div className="card-container rain-warning-card">
          <div className="raining-background">{renderRaindrops()}</div>
          <div className="rain-warning">
            <p>
              오늘 비가 옵니다! 주변 빗물받이를 확인하여 막혀있으면 신고를
              부탁드립니다.
            </p>
          </div>
        </div>
      )}

      <div className="card-container weekly-forecast-card">
        <h3>주간 예보</h3>
        <div className="forecast-list">
          {weatherData.slice(1, 7).map((day, index) => (
            <div key={index} className="forecast-day-card">
              <p className="date">
                {new Date(day.time).toLocaleDateString("ko-KR", {
                  month: "numeric",
                  day: "numeric",
                })}
              </p>
              {getWeatherIcon(day.weathercode)}
              <p className="temp-range">
                {day.temperature_2m_max}°C / {day.temperature_2m_min}°C
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherDisplay;
