const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Favorite = require('../models/Favorite');
const { check, validationResult } = require('express-validator');

// @route   GET /api/favorites
// @desc    Get user's favorite cities
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(favorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/favorites
// @desc    Add city to favorites
// @access  Private
router.post('/', [
  auth,
  [
    check('cityName', 'City name is required').not().isEmpty(),
    check('country', 'Country is required').not().isEmpty()
  ]
], async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { cityName, country } = req.body;

  try {
    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      userId: req.user.id,
      cityName
    });

    if (existingFavorite) {
      return res.status(400).json({ message: 'City already in favorites' });
    }

    // Create new favorite
    const favorite = new Favorite({
      userId: req.user.id,
      cityName,
      country
    });

    await favorite.save();
    res.status(201).json(favorite);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'City already in favorites' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/favorites/:id
// @desc    Remove city from favorites
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Favorite removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/favorites/city/:cityName
// @desc    Remove city from favorites by city name
// @access  Private
router.delete('/city/:cityName', auth, async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      cityName: req.params.cityName,
      userId: req.user.id
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Favorite removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;