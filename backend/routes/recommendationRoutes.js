import express from 'express';
import {
  getRecommendations,
  completeChallenge,
  getChallengeHistory,
  clearUserCache,
  getCacheStats
} from '../controllers/recommendationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get daily recommendations and challenge
router.get('/', getRecommendations);

// Mark challenge as completed
router.put('/challenge/:recommendationId/complete', validateObjectId('recommendationId'), completeChallenge);

// Get challenge history
router.get('/history', getChallengeHistory);

// Clear user's cache (force new challenge generation)
router.delete('/cache', clearUserCache);

// Get cache statistics (admin only)
router.get('/cache/stats', admin, getCacheStats);

export default router;
