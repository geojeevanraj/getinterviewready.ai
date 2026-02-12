import AptitudeResult from '../models/AptitudeResult.js';
import { generateAptitudeQuestions } from '../services/geminiService.js';

/**
 * Start a new aptitude test
 * Generates questions based on category, difficulty, and count
 */
export const startAptitudeTest = async (req, res) => {
  try {
    const { category, difficulty, count } = req.body;
    const userId = req.user.id;

    console.log(`🎯 Starting aptitude test for user ${userId}:`, { category, difficulty, count });

    // Validation
    if (!category || !difficulty || !count) {
      return res.status(400).json({
        success: false,
        message: 'Category, difficulty, and count are required'
      });
    }

    // Validate category
    const validCategories = ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    // Validate difficulty
    const validDifficulties = ['Easy', 'Medium', 'Hard'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`
      });
    }

    // Validate count (5-50)
    const questionCount = parseInt(count);
    if (isNaN(questionCount) || questionCount < 5 || questionCount > 50) {
      return res.status(400).json({
        success: false,
        message: 'Question count must be a number between 5 and 50'
      });
    }

    // Generate questions using Gemini AI
    const questions = await generateAptitudeQuestions(category, difficulty, questionCount);

    if (!questions || questions.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate questions. Please try again.'
      });
    }

    // Return questions without correct answers (for security)
    const questionsForFrontend = questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options
    }));

    // Store full questions in session or temporary storage
    // For simplicity, we'll return a test session object
    const testSession = {
      category,
      difficulty,
      totalQuestions: questions.length,
      questions: questionsForFrontend,
      // Store full questions with answers for later verification
      _fullQuestions: questions
    };

    res.status(200).json({
      success: true,
      message: 'Aptitude test started successfully',
      data: testSession
    });

  } catch (error) {
    console.error('❌ Error starting aptitude test:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to start aptitude test'
    });
  }
};

/**
 * Submit aptitude test answers and calculate score
 */
export const submitAptitudeTest = async (req, res) => {
  try {
    const { category, difficulty, answers, fullQuestions, timeTaken } = req.body;
    const userId = req.user.id;

    console.log(`📝 Submitting aptitude test for user ${userId}`);

    // Validation
    if (!category || !difficulty || !answers || !fullQuestions) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Answers must be a non-empty array'
      });
    }

    // Calculate score
    let correctCount = 0;
    const evaluatedAnswers = answers.map((userAnswer) => {
      const question = fullQuestions.find(q => q.id === userAnswer.questionId);
      
      if (!question) {
        return null;
      }

      const isCorrect = userAnswer.selectedAnswer === question.correctAnswer;
      if (isCorrect) {
        correctCount++;
      }

      return {
        questionId: question.id,
        question: question.question,
        userAnswer: userAnswer.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
    }).filter(a => a !== null);

    const totalQuestions = evaluatedAnswers.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // Save result to database
    const result = new AptitudeResult({
      userId,
      category,
      difficulty,
      totalQuestions,
      correctAnswers: correctCount,
      score,
      answers: evaluatedAnswers,
      timeTaken: timeTaken || 0
    });

    await result.save();

    console.log(`✅ Aptitude test submitted. Score: ${score}%`);

    res.status(200).json({
      success: true,
      message: 'Test submitted successfully',
      data: {
        resultId: result._id,
        score,
        correctAnswers: correctCount,
        totalQuestions,
        answers: evaluatedAnswers
      }
    });

  } catch (error) {
    console.error('❌ Error submitting aptitude test:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit test'
    });
  }
};

/**
 * Get user's aptitude test history
 */
export const getAptitudeHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const results = await AptitudeResult.find({ userId })
      .sort({ createdAt: -1 })
      .select('-answers') // Exclude detailed answers for list view
      .limit(50);

    res.status(200).json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('❌ Error fetching aptitude history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch aptitude history'
    });
  }
};

/**
 * Get detailed result by ID
 */
export const getAptitudeResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const userId = req.user.id;

    const result = await AptitudeResult.findOne({
      _id: resultId,
      userId
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Error fetching aptitude result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch result'
    });
  }
};

/**
 * Get aptitude statistics for dashboard
 */
export const getAptitudeStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all results
    const results = await AptitudeResult.find({ userId })
      .select('category difficulty score totalQuestions correctAnswers createdAt')
      .sort({ createdAt: -1 });

    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalTests: 0,
          averageScore: 0,
          categoryStats: [],
          recentTests: []
        }
      });
    }

    // Calculate overall stats
    const totalTests = results.length;
    const averageScore = Math.round(
      results.reduce((sum, r) => sum + r.score, 0) / totalTests
    );

    // Category-wise stats
    const categoryMap = new Map();
    results.forEach(r => {
      if (!categoryMap.has(r.category)) {
        categoryMap.set(r.category, {
          category: r.category,
          count: 0,
          totalScore: 0,
          averageScore: 0
        });
      }
      const stat = categoryMap.get(r.category);
      stat.count++;
      stat.totalScore += r.score;
    });

    const categoryStats = Array.from(categoryMap.values()).map(stat => ({
      ...stat,
      averageScore: Math.round(stat.totalScore / stat.count)
    }));

    // Recent tests
    const recentTests = results.slice(0, 5).map(r => ({
      id: r._id,
      category: r.category,
      difficulty: r.difficulty,
      score: r.score,
      date: r.createdAt
    }));

    res.status(200).json({
      success: true,
      data: {
        totalTests,
        averageScore,
        categoryStats,
        recentTests
      }
    });

  } catch (error) {
    console.error('❌ Error fetching aptitude stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
};
