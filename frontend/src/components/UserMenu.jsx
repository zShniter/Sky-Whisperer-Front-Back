import React, { useState, useEffect } from 'react';
import './UserMenu.css';
import { getFavorites, addFavorite, removeFavorite } from '../utils/api';

function UserMenu({ user, onLogout, onFavoriteClick }) { // ✅ Added onFavoriteClick prop
  const [isOpen, setIsOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const favs = await getFavorites(token);
      setFavorites(favs);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleAddFavorite = async (cityName, country) => {
    try {
      const token = localStorage.getItem('token');
      await addFavorite(token, { cityName, country });
      loadFavorites();
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      const token = localStorage.getItem('token');
      await removeFavorite(token, favoriteId);
      loadFavorites();
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  // ✅ NEW: Click favorite to load weather
  const handleFavoriteItemClick = (cityName) => {
    if (onFavoriteClick) {
      onFavoriteClick(cityName);
      setIsOpen(false); // Close the dropdown after clicking
    }
  };

  if (!user) return null;

  return (
    <div className="user-menu-container">
      <button className="user-button" onClick={() => setIsOpen(!isOpen)}>
        <i className="fas fa-user-circle"></i>
        <span className="username">{user.username}</span>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
      </button>
      
      {isOpen && (
        <div className="dropdown-menu">
          <div className="user-info">
            <i className="fas fa-user"></i>
            <div>
              <strong>{user.username}</strong>
              <small>{user.email || 'No email'}</small> {/* ✅ Fixed: Handle missing email */}
            </div>
          </div>
          
          <div className="favorites-section">
            <h4>Favorite Cities</h4>
            {favorites.length === 0 ? (
              <p className="no-favorites">No favorite cities yet</p>
            ) : (
              <ul className="favorites-list">
                {favorites.map((fav) => (
                  <li key={fav._id} className="favorite-item">
                    <span 
                      className="favorite-city-name"
                      onClick={() => handleFavoriteItemClick(fav.cityName)}
                      style={{ cursor: 'pointer' }}
                    >
                      {fav.cityName}, {fav.country}
                    </span>
                    <button 
                      className="remove-favorite"
                      onClick={() => handleRemoveFavorite(fav._id)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <button className="logout-button" onClick={onLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
