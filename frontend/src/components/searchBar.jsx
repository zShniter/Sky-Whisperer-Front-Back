import React, { useState } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch, onLocationClick }) {
  const [city, setCity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city.trim());
      setCity('');
    }
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationClick(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          alert('Unable to retrieve your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-group">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search for a city..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </div>
      </form>
      <button onClick={handleLocationClick} className="location-button">
        <i className="fas fa-location-crosshairs"></i>
        Use My Location
      </button>
    </div>
  );
}

export default SearchBar;