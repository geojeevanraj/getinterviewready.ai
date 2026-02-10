import express from 'express';
import { body } from 'express-validator';
import {
  startInterview,
  getInterviewHistory,
  getInterviewById,
  submitAnswer,
  completeInterview,
  deleteInterview,
  submitInterview
} from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Validation rules for starting interview
const startInterviewValidation = [
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Role must be between 2 and 100 characters'),
  body('level')
    .trim()
    .notEmpty()
    .withMessage('Level is required')
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Level must be Beginner, Intermediate, or Advanced')
];

// Validation rules for submitting answer
const submitAnswerValidation = [
  body('questionId')
    .notEmpty()
    .withMessage('Question ID is required')
    .isInt({ min: 1 })
    .withMessage('Question ID must be a positive integer'),
  body('answer')
    .trim()
    .notEmpty()
    .withMessage('Answer is required')
    .isLength({ min: 10 })
    .withMessage('Answer must be at least 10 characters long')
];

// Routes - All routes are protected (require authentication)

// Start new interview
router.post('/start', protect, startInterviewValidation, startInterview);

// Submit interview answers for evaluation
router.post('/submit', protect, submitInterview);

// Get interview history
router.get('/history', protect, getInterviewHistory);

// Get specific interview
router.get('/:id', protect, getInterviewById);

// Submit answer for a question
router.put('/:id/answer', protect, submitAnswerValidation, submitAnswer);

// Complete interview
router.put('/:id/complete', protect, completeInterview);

// Delete interview
router.delete('/:id', protect, deleteInterview);

export default router;
