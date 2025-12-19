import axios from 'axios';

// Backend axios instance (for your server)
const backendInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// Weather API (separate instance for OpenWeatherMap)
const weatherInstance = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  timeout: 10000,
});

const API_KEY = '02576881221a7bbea9fcb6514bd39123'; 

// 🌤️ WEATHER API FUNCTIONS (unchanged logic, better error handling)
export const fetchCurrentWeather = async (city) => {
  try {
    const response = await weatherInstance.get('/weather', {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching current weather:', error.response?.data || error.message);
    throw new Error(`City "${city}" not found`);
  }
};

export const fetchForecast = async (city) => {
  try {
    const response = await weatherInstance.get('/forecast', {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric',
        cnt: 5,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching forecast:', error.response?.data || error.message);
    throw error;
  }
};

export const fetchWeatherByCoords = async (lat, lon) => {
  try {
    const response = await weatherInstance.get('/weather', {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather by coordinates:', error.response?.data || error.message);
    throw error;
  }
};

// 🔐 AUTH API FUNCTIONS (using backend instance)
export const registerUser = async (userData) => {
  try {
    const response = await backendInstance.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Registration failed');
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await backendInstance.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Invalid credentials');
  }
};

export const verifyToken = async (token) => {
  try {
    const response = await backendInstance.get('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying token:', error.response?.data || error.message);
    throw error;
  }
};

// ❤️ FAVORITES API FUNCTIONS
export const getFavorites = async (token) => {
  try {
    const response = await backendInstance.get('/favorites', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching favorites:', error.response?.data || error.message);
    throw error;
  }
};

export const addFavorite = async (token, cityData) => {
  try {
    const response = await backendInstance.post('/favorites', cityData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding favorite:', error.response?.data || error.message);
    throw error;
  }
};

export const removeFavorite = async (token, favoriteId) => {
  try {
    const response = await backendInstance.delete(`/favorites/${favoriteId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error removing favorite:', error.response?.data || error.message);
    throw error;
  }
};
