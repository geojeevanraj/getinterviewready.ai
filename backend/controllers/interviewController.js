import Interview from '../models/Interview.js';
import { generateInterviewQuestions, evaluateAnswer, generateConfidenceFeedback } from '../services/geminiService.js';
import { validationResult } from 'express-validator';

// @desc    Start a new interview session
// @route   POST /api/interview/start
// @access  Private
export const startInterview = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { role, level } = req.body;
    const userId = req.user.id;

    console.log(`📋 Starting interview for user ${userId}: ${role} (${level})`);

    // Generate questions using Gemini AI
    let questions;
    try {
      questions = await generateInterviewQuestions(role, level, 5);
    } catch (error) {
      console.error('Gemini AI Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate questions. Please try again.',
        error: error.message
      });
    }

    // Validate generated questions
    if (!questions || questions.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'No questions were generated. Please try again.'
      });
    }

    // Create interview record in database
    const interview = await Interview.create({
      userId,
      role,
      level,
      questions,
      status: 'started'
    });

    console.log(`✅ Interview created with ID: ${interview._id}`);

    res.status(201).json({
      success: true,
      message: 'Interview started successfully',
      data: {
        interviewId: interview._id,
        role: interview.role,
        level: interview.level,
        questions: interview.questions,
        questionCount: interview.questions.length,
        status: interview.status,
        createdAt: interview.createdAt
      }
    });

  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while starting interview'
    });
  }
};

// @desc    Get user's interview history
// @route   GET /api/interview/history
// @access  Private
export const getInterviewHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 10, page = 1 } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const limitNum = parseInt(limit);

    // Use lean() for better performance - returns plain JS objects instead of Mongoose documents
    // Select only needed fields to reduce data transfer
    const [interviews, total] = await Promise.all([
      Interview.find(query)
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .skip(skip)
        .select('role level status averageScore questions evaluations createdAt completedAt')
        .lean(),
      Interview.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        interviews,
        pagination: {
          total,
          page: parseInt(page),
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Get interview history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching interview history'
    });
  }
};

// @desc    Get specific interview details
// @route   GET /api/interview/:id
// @access  Private
export const getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const interview = await Interview.findOne({
      _id: id,
      userId
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    res.status(200).json({
      success: true,
      data: interview
    });

  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching interview'
    });
  }
};

// @desc    Submit answer for a question
// @route   PUT /api/interview/:id/answer
// @access  Private
export const submitAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionId, answer } = req.body;
    const userId = req.user.id;

    const interview = await Interview.findOne({
      _id: id,
      userId
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Find and update the question
    const question = interview.questions.find(q => q.id === questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    question.answer = answer;
    await interview.save();

    res.status(200).json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        questionId,
        answer
      }
    });

  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting answer'
    });
  }
};

// @desc    Complete interview
// @route   PUT /api/interview/:id/complete
// @access  Private
export const completeInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const interview = await Interview.findOne({
      _id: id,
      userId
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    await interview.markAsCompleted();

    res.status(200).json({
      success: true,
      message: 'Interview completed successfully',
      data: {
        interviewId: interview._id,
        status: interview.status,
        totalScore: interview.totalScore,
        completedAt: interview.completedAt
      }
    });

  } catch (error) {
    console.error('Complete interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while completing interview'
    });
  }
};

// @desc    Delete interview
// @route   DELETE /api/interview/:id
// @access  Private
export const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const interview = await Interview.findOneAndDelete({
      _id: id,
      userId
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Interview deleted successfully'
    });

  } catch (error) {
    console.error('Delete interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting interview'
    });
  }
};

// @desc    Submit interview answers and get AI evaluation
// @route   POST /api/interview/submit
// @access  Private
export const submitInterview = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { interviewId, answers, confidenceMetrics } = req.body;
    const userId = req.user.id;

    console.log(`📝 Submitting interview ${interviewId} for user ${userId}`);

    // Validate input
    if (!interviewId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Interview ID and answers array are required'
      });
    }

    // Find interview
    const interview = await Interview.findOne({
      _id: interviewId,
      userId
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Interview already completed'
      });
    }

    console.log(`📊 Processing ${answers.length} answers...`);

    // Store answers
    interview.answers = answers;

    // Store confidence metrics if provided
    if (confidenceMetrics) {
      interview.confidenceMetrics = {
        eyeContact: confidenceMetrics.eyeContactScore || 0,
        stability: confidenceMetrics.stabilityScore || 0,
        expression: confidenceMetrics.expressionScore || 0,
        blinkRate: confidenceMetrics.blinkRate || 0,
        duration: confidenceMetrics.duration || 0
      };
      interview.confidenceScore = confidenceMetrics.confidenceScore || 0;
      console.log(`📹 Confidence Score: ${interview.confidenceScore}/100`);
    }

    // Evaluate each answer using Gemini AI
    const evaluations = [];
    
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      const question = interview.questions.find(q => q.id === answer.questionId);

      if (!question) {
        console.warn(`⚠️  Question ${answer.questionId} not found`);
        continue;
      }

      if (!answer.userAnswer || answer.userAnswer.trim() === '') {
        // Skip empty answers
        evaluations.push({
          questionId: answer.questionId,
          score: 0,
          strengths: 'No answer provided',
          weaknesses: 'Question was not attempted',
          improvedAnswer: 'Please provide an answer to this question'
        });
        continue;
      }

      try {
        console.log(`🤖 Evaluating answer ${i + 1}/${answers.length}...`);
        
        const evaluation = await evaluateAnswer(question.question, answer.userAnswer);
        
        evaluations.push({
          questionId: answer.questionId,
          ...evaluation
        });
        
      } catch (error) {
        console.error(`Failed to evaluate answer ${i + 1}:`, error.message);
        
        // Use fallback evaluation
        evaluations.push({
          questionId: answer.questionId,
          score: 5,
          strengths: 'Unable to evaluate automatically',
          weaknesses: 'Evaluation failed - please review manually',
          improvedAnswer: 'N/A'
        });
      }
    }

    // Save evaluations
    interview.evaluations = evaluations;
    
    // Generate confidence feedback if metrics available
    if (confidenceMetrics && interview.confidenceScore > 0) {
      try {
        console.log(`🎥 Generating confidence feedback...`);
        const confidenceFeedback = await generateConfidenceFeedback(confidenceMetrics);
        interview.confidenceFeedback = confidenceFeedback;
      } catch (error) {
        console.error('Failed to generate confidence feedback:', error.message);
        // Continue without confidence feedback
      }
    }
    
    // Mark as completed and calculate average score
    await interview.markAsCompleted();

    console.log(`✅ Interview completed - Average Score: ${interview.averageScore}/10`);

    res.status(200).json({
      success: true,
      message: 'Interview submitted and evaluated successfully',
      data: {
        interviewId: interview._id,
        role: interview.role,
        level: interview.level,
        questions: interview.questions,
        answers: interview.answers,
        evaluations: interview.evaluations,
        averageScore: interview.averageScore,
        confidenceScore: interview.confidenceScore,
        confidenceMetrics: interview.confidenceMetrics,
        confidenceFeedback: interview.confidenceFeedback,
        status: interview.status,
        completedAt: interview.completedAt
      }
    });

  } catch (error) {
    console.error('Submit interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting interview',
      error: error.message
    });
  }
};
