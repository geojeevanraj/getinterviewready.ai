import express from 'express';
import {
  uploadResume,
  getResumeHistory,
  getResumeById,
  deleteResume
} from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../config/multer.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Upload and analyze resume (multipart/form-data)
router.post('/upload', upload.single('resume'), uploadResume);

// Get resume history
router.get('/history', getResumeHistory);

// Get single resume analysis
router.get('/:resumeId', validateObjectId('resumeId'), getResumeById);

// Delete resume
router.delete('/:resumeId', validateObjectId('resumeId'), deleteResume);

export default router;
