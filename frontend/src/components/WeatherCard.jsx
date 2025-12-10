import React from 'react';
import './WeatherCard.css';
import { addFavorite, removeFavorite } from '../utils/api';

function WeatherCard({ 
  weatherData, 
  user, 
  favorites = [], 
  onFavoriteUpdate 
}) {
  if (!weatherData) return null;

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTemperatureColor = (temp) => {
    if (temp < 0) return '#4cc9f0';
    if (temp < 10) return '#3a86ff';
    if (temp < 20) return '#38b000';
    if (temp < 30) return '#ff9e00';
    return '#ff006e';
  };

  // Favorite functionality
  const isFavorited = favorites?.some(fav => 
    fav.cityName === weatherData.name
  );

  const handleFavoriteClick = async () => {
    if (!user) {
      alert('Please login to add favorites');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      if (isFavorited) {
        const favoriteToRemove = favorites.find(fav => 
          fav.cityName === weatherData.name
        );
        if (favoriteToRemove) {
          await removeFavorite(token, favoriteToRemove._id);
        }
      } else {
        await addFavorite(token, {
          cityName: weatherData.name,
          country: weatherData.sys.country
        });
      }
      if (onFavoriteUpdate) onFavoriteUpdate();
    } catch (error) {
      console.error('Error managing favorite:', error);
      alert('Error managing favorite. Please try again.');
    }
  };

  return (
    <div className="weather-card">
      <div className="weather-header">
        <div style={{ position: 'relative' }}>
          <h2 className="city-name">{weatherData.name}, {weatherData.sys.country}</h2>
          <p className="current-date">{formatDate(weatherData.dt)}</p>
          
          {/* Favorite Button */}
          <div className="favorite-button-container">
            <button 
              className={`favorite-button ${isFavorited ? 'active' : ''}`}
              onClick={handleFavoriteClick}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <i className={`fas fa-heart${isFavorited ? '' : '-o'}`}></i>
            </button>
          </div>
        </div>
      </div>
      
      <div className="weather-main">
        <div className="temperature-section">
          <div className="current-temp">
            <span className="temp-value" style={{ color: getTemperatureColor(weatherData.main.temp) }}>
              {Math.round(weatherData.main.temp)}
            </span>
            <span className="temp-unit">°C</span>
          </div>
          <div className="weather-condition">
            <img 
              src={getWeatherIcon(weatherData.weather[0].icon)} 
              alt={weatherData.weather[0].description}
              className="weather-icon"
            />
            <p className="condition-text">{weatherData.weather[0].description}</p>
          </div>
        </div>
        
        <div className="weather-details">
          <div className="detail-item">
            <i className="fas fa-temperature-high detail-icon"></i>
            <div className="detail-info">
              <span className="detail-label">Feels Like</span>
              <span className="detail-value">{Math.round(weatherData.main.feels_like)}°C</span>
            </div>
          </div>
          
          <div className="detail-item">
            <i className="fas fa-tint detail-icon"></i>
            <div className="detail-info">
              <span className="detail-label">Humidity</span>
              <span className="detail-value">{weatherData.main.humidity}%</span>
            </div>
          </div>
          
          <div className="detail-item">
            <i className="fas fa-wind detail-icon"></i>
            <div className="detail-info">
              <span className="detail-label">Wind Speed</span>
              <span className="detail-value">{Math.round(weatherData.wind.speed)} m/s</span>
            </div>
          </div>
          
          <div className="detail-item">
            <i className="fas fa-compress-alt detail-icon"></i>
            <div className="detail-info">
              <span className="detail-label">Pressure</span>
              <span className="detail-value">{weatherData.main.pressure} hPa</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="weather-footer">
        <div className="min-max-temp">
          <div className="temp-range">
            <span className="temp-label">Min:</span>
            <span className="temp-min">{Math.round(weatherData.main.temp_min)}°C</span>
          </div>
          <div className="temp-range">
            <span className="temp-label">Max:</span>
            <span className="temp-max">{Math.round(weatherData.main.temp_max)}°C</span>
          </div>
        </div>
        <div className="sun-times">
          <div className="sun-time">
            <i className="fas fa-sunrise"></i>
            <span className="sun-label">Sunrise:</span>
            <span className="sun-value">
              {new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="sun-time">
            <i className="fas fa-sunset"></i>
            <span className="sun-label">Sunset:</span>
            <span className="sun-value">
              {new Date(weatherData.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherCard;
