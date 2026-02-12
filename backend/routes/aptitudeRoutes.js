import express from 'express';
import {
  startAptitudeTest,
  submitAptitudeTest,
  getAptitudeHistory,
  getAptitudeResult,
  getAptitudeStats
} from '../controllers/aptitudeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Start new aptitude test
router.post('/start', startAptitudeTest);

// Submit test answers
router.post('/submit', submitAptitudeTest);

// Get test history
router.get('/history', getAptitudeHistory);

// Get statistics for dashboard
router.get('/stats', getAptitudeStats);

// Get specific result by ID
router.get('/result/:resultId', validateObjectId('resultId'), getAptitudeResult);

export default router;
