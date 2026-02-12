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
import { validateObjectId } from '../middleware/validateObjectId.js';

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

// Validation rules for submitting full interview
const submitInterviewValidation = [
  body('interviewId')
    .notEmpty()
    .withMessage('Interview ID is required')
    .isMongoId()
    .withMessage('Invalid interview ID format'),
  body('answers')
    .isArray({ min: 1 })
    .withMessage('Answers must be a non-empty array'),
  body('answers.*.questionId')
    .notEmpty()
    .withMessage('Each answer must have a questionId')
    .isInt({ min: 1 })
    .withMessage('questionId must be a positive integer'),
  body('answers.*.userAnswer')
    .isString()
    .withMessage('Each answer must have a userAnswer string')
];

// Routes - All routes are protected (require authentication)

// Start new interview
router.post('/start', protect, startInterviewValidation, startInterview);

// Submit interview answers for evaluation
router.post('/submit', protect, submitInterviewValidation, submitInterview);

// Get interview history
router.get('/history', protect, getInterviewHistory);

// Get specific interview
router.get('/:id', protect, validateObjectId('id'), getInterviewById);

// Submit answer for a question
router.put('/:id/answer', protect, validateObjectId('id'), submitAnswerValidation, submitAnswer);

// Complete interview
router.put('/:id/complete', protect, validateObjectId('id'), completeInterview);

// Delete interview
router.delete('/:id', protect, validateObjectId('id'), deleteInterview);

export default router;
