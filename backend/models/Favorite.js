const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cityName: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique combination of user and city
FavoriteSchema.index({ userId: 1, cityName: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);