import React, { useState, useEffect } from 'react';
import SearchBar from './components/searchBar';
import WeatherCard from './components/WeatherCard';
import Forecast from './components/Forecast';
import AuthModal from './components/AuthModal';
import UserMenu from './components/UserMenu';
import { 
  fetchCurrentWeather, 
  fetchForecast, 
  fetchWeatherByCoords, 
  verifyToken, 
  getFavorites 
} from './utils/api';
import './styles.css';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [defaultCity, setDefaultCity] = useState('London');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const loadWeatherData = async (city) => {
    setLoading(true);
    setError(null);
    try {
      const [currentWeather, forecast] = await Promise.all([
        fetchCurrentWeather(city),
        fetchForecast(city)
      ]);
      setWeatherData(currentWeather);
      setForecastData(forecast);
    } catch (err) {
      setError('City not found. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const currentWeather = await fetchWeatherByCoords(lat, lon);
      const forecast = await fetchForecast(currentWeather.name);
      setWeatherData(currentWeather);
      setForecastData(forecast);
    } catch (err) {
      setError('Unable to fetch weather for your location.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ❌ FIXED 1: Separate useEffect for default city load
  useEffect(() => {
    if (!weatherData) {
      loadWeatherData(defaultCity);
    }
  }, []);

  // ✅ FIXED 2: Clean auth check useEffect
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const { valid, user: verifiedUser } = await verifyToken(token);
          if (valid) {
            setUser(verifiedUser);
            fetchFavorites();
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    };
    
    checkAuth();
  }, []);

  const fetchFavorites = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const favoritesData = await getFavorites(token);
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      setFavorites([]);
    }
  };

  const handleSearch = (city) => {
    loadWeatherData(city);
  };

  const handleLocationClick = (lat, lon) => {
    loadWeatherByCoords(lat, lon);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
    fetchFavorites();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setFavorites([]);
  };

  const handleFavoriteUpdate = () => {
    fetchFavorites();
  };

  // ✅ FIXED 3: NEW - Handle favorite city click
  const handleFavoriteCityClick = (cityName) => {
    loadWeatherData(cityName);
  };

  return (
    <div className="app-container">
      <div className="weather-app">
        <div className="app-header">
          <h1>🌤️ Sky Whisperer</h1>
          <p>Your personal weather whisperer, delivering accurate forecasts with elegance</p>
          
          <div className="auth-section">
            {user ? (
              <UserMenu 
                user={user} 
                onLogout={handleLogout} 
                onFavoriteClick={handleFavoriteCityClick} // ✅ NOW PASSED!
              />
            ) : (
              <button 
                className="auth-button"
                onClick={() => setShowAuthModal(true)}
              >
                <i className="fas fa-sign-in-alt"></i>
                Login / Register
              </button>
            )}
          </div>
        </div>

        <SearchBar 
          onSearch={handleSearch} 
          onLocationClick={handleLocationClick}
        />

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <div className="main-content">
              <div className="current-weather">
                <WeatherCard 
                  weatherData={weatherData}
                  user={user}
                  favorites={favorites}
                  onFavoriteUpdate={handleFavoriteUpdate}
                />
              </div>
              <div className="forecast-container">
                <Forecast forecastData={forecastData} />
              </div>
            </div>
            
            <div className="app-footer">
              <p className="attribution">
                Weather app made by Ali Chniter & Nassim Laafif, data provided by <a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer">OpenWeatherMap</a>
              </p>
            </div>
          </>
        )}

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />
      </div>
    </div>
  );
}

export default App;
