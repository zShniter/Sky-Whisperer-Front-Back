import React from 'react';
import './Forecast.css';

function Forecast({ forecastData }) {
  if (!forecastData || !forecastData.list) return null;

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const formatDay = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="forecast">
      <h3 className="section-title">3‑Hour Steps Forecast</h3>
      <div className="forecast-cards">
        {forecastData.list.slice(0, 5).map((item, index) => (
          <div key={index} className="forecast-card">
            <div className="forecast-day">{formatDay(item.dt)}</div>
            <div className="forecast-time">{formatTime(item.dt)}</div>
            <img 
              src={getWeatherIcon(item.weather[0].icon)} 
              alt={item.weather[0].description}
              className="forecast-icon"
            />
            <div className="forecast-temp">
              <span className="forecast-temp-max">{Math.round(item.main.temp_max)}°</span>
              <span className="forecast-temp-min">{Math.round(item.main.temp_min)}°</span>
            </div>
            <div className="forecast-condition">{item.weather[0].description}</div>
            <div className="forecast-details">
              <div className="forecast-detail">
                <i className="fas fa-tint"></i>
                <span>{item.main.humidity}%</span>
              </div>
              <div className="forecast-detail">
                <i className="fas fa-wind"></i>
                <span>{Math.round(item.wind.speed)} m/s</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Forecast;