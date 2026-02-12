import express from 'express';
import {
  getDashboardSummary,
  getDetailedStats,
  getStreakData
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All dashboard routes are protected
router.get('/summary', protect, getDashboardSummary);
router.get('/stats', protect, getDetailedStats);
router.get('/streak', protect, getStreakData);

export default router;
