import Interview from '../models/Interview.js';
import mongoose from 'mongoose';

// @desc    Get dashboard summary with analytics
// @route   GET /api/dashboard/summary
// @access  Private
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    console.log(`📊 Fetching dashboard summary for user ${userId}`);

    // Get total interviews count (both started and completed)
    const totalInterviewsCount = await Interview.countDocuments({ userId: userId });

    // Optimized aggregation pipeline - single database query instead of multiple
    const dashboardStats = await Interview.aggregate([
      // Stage 1: Match user's interviews with averageScore (completed interviews)
      {
        $match: {
          userId: userId,
          averageScore: { $ne: null } // Only interviews that have been scored
        }
      },
      // Stage 2: Sort by completion date (newest first)
      {
        $sort: { completedAt: -1 }
      },
      // Stage 3: Group and calculate statistics
      {
        $group: {
          _id: null,
          totalInterviews: { $sum: 1 },
          overallAverageScore: { $avg: '$averageScore' },
          allInterviews: { $push: '$$ROOT' } // Keep all documents for further processing
        }
      },
      // Stage 4: Project final structure
      {
        $project: {
          _id: 0,
          totalInterviews: 1,
          overallAverageScore: { $round: ['$overallAverageScore', 2] },
          recentInterviews: { $slice: ['$allInterviews', 5] }, // Top 5
          scoreHistory: { $slice: ['$allInterviews', 10] } // Top 10 for chart
        }
      }
    ]);

    // Handle case when no completed interviews exist
    if (!dashboardStats.length) {
      return res.status(200).json({
        success: true,
        data: {
          totalInterviews: totalInterviewsCount, // Include all interviews
          completedInterviews: 0,
          overallAverageScore: 0,
          recentInterviews: [],
          weakTopics: [{
            topic: 'No patterns detected yet',
            frequency: 0,
            recommendation: 'Complete more interviews to identify weak areas'
          }],
          scoreHistory: []
        }
      });
    }

    const stats = dashboardStats[0];

    // Format recent interviews
    const recentInterviews = stats.recentInterviews.map(interview => ({
      id: interview._id,
      role: interview.role,
      level: interview.level,
      averageScore: interview.averageScore,
      completedAt: interview.completedAt,
      questionCount: interview.questions.length
    }));

    // Format score history for chart
    const scoreHistory = stats.scoreHistory.reverse().map(interview => ({
      date: new Date(interview.completedAt).toLocaleDateString(),
      score: interview.averageScore,
      role: interview.role
    }));

    // Detect weak topics (optimized with aggregation)
    const weakTopics = await detectWeakTopicsOptimized(userId);

    console.log(`✅ Dashboard summary generated - ${totalInterviewsCount} total interviews (${stats.totalInterviews} completed)`);

    res.status(200).json({
      success: true,
      data: {
        totalInterviews: totalInterviewsCount, // Total count including all statuses
        completedInterviews: stats.totalInterviews, // Completed interviews count
        overallAverageScore: stats.overallAverageScore || 0,
        recentInterviews,
        weakTopics,
        scoreHistory
      }
    });

  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard summary'
    });
  }
};

/**
 * Optimized weak topic detection using MongoDB aggregation
 * More efficient than in-memory processing for large datasets
 */
const detectWeakTopicsOptimized = async (userId) => {
  try {
    // Technical keywords to track
    const technicalKeywords = [
      'react', 'node', 'mongodb', 'express', 'javascript', 'async',
      'promise', 'state', 'component', 'hooks', 'database', 'query',
      'api', 'rest', 'authentication', 'security', 'performance',
      'testing', 'deployment', 'error', 'handling', 'design', 'pattern',
      'algorithm', 'data', 'structure', 'complexity', 'optimization',
      'backend', 'frontend', 'fullstack', 'server', 'client'
    ];

    // Use aggregation to analyze weaknesses across all interviews
    const weaknessAnalysis = await Interview.aggregate([
      // Stage 1: Match user's completed interviews with scores
      {
        $match: {
          userId: userId,
          averageScore: { $ne: null } // Only scored interviews
        }
      },
      // Stage 2: Unwind evaluations array
      {
        $unwind: '$evaluations'
      },
      // Stage 3: Filter low scores only
      {
        $match: {
          'evaluations.score': { $lt: 7 }
        }
      },
      // Stage 4: Project only weaknesses field
      {
        $project: {
          weaknesses: { $toLower: '$evaluations.weaknesses' }
        }
      },
      // Stage 5: Group all weaknesses together
      {
        $group: {
          _id: null,
          allWeaknesses: { $push: '$weaknesses' }
        }
      }
    ]);

    if (!weaknessAnalysis.length || !weaknessAnalysis[0].allWeaknesses.length) {
      return [{
        topic: 'No patterns detected yet',
        frequency: 0,
        recommendation: 'Complete more interviews to identify weak areas'
      }];
    }

    // Process weaknesses to extract keywords
    const weaknessKeywords = {};
    weaknessAnalysis[0].allWeaknesses.forEach(weakness => {
      const words = weakness.split(/\W+/).filter(word => word.length > 4);
      
      words.forEach(word => {
        if (technicalKeywords.includes(word)) {
          weaknessKeywords[word] = (weaknessKeywords[word] || 0) + 1;
        }
      });
    });

    // Sort by frequency and get top 3
    const sortedWeaknesses = Object.entries(weaknessKeywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic, count]) => ({
        topic: topic.charAt(0).toUpperCase() + topic.slice(1),
        frequency: count,
        recommendation: getRecommendation(topic)
      }));

    return sortedWeaknesses.length > 0 ? sortedWeaknesses : [{
      topic: 'No patterns detected yet',
      frequency: 0,
      recommendation: 'Complete more interviews to identify weak areas'
    }];

  } catch (error) {
    console.error('Weak topic detection error:', error);
    return [{
      topic: 'Error analyzing weaknesses',
      frequency: 0,
      recommendation: 'Please try again later'
    }];
  }
};

/**
 * Detect weak topics from interview evaluations (Legacy - kept for reference)
 * Analyzes weaknesses across all interviews to identify patterns
 */
const detectWeakTopics = async (interviews) => {
  try {
    const weaknessKeywords = {};

    // Extract keywords from weaknesses
    interviews.forEach(interview => {
      if (interview.evaluations && interview.evaluations.length > 0) {
        interview.evaluations.forEach(evaluation => {
          if (evaluation.weaknesses && evaluation.score < 7) {
            // Extract meaningful words from weaknesses
            const words = evaluation.weaknesses
              .toLowerCase()
              .split(/\W+/)
              .filter(word => word.length > 4); // Only words longer than 4 chars

            // Common technical keywords to track
            const technicalKeywords = [
              'react', 'node', 'mongodb', 'express', 'javascript', 'async',
              'promise', 'state', 'component', 'hooks', 'database', 'query',
              'api', 'rest', 'authentication', 'security', 'performance',
              'testing', 'deployment', 'error', 'handling', 'design', 'pattern',
              'algorithm', 'data', 'structure', 'complexity', 'optimization',
              'backend', 'frontend', 'fullstack', 'server', 'client'
            ];

            words.forEach(word => {
              if (technicalKeywords.includes(word)) {
                weaknessKeywords[word] = (weaknessKeywords[word] || 0) + 1;
              }
            });
          }
        });
      }
    });

    // Sort by frequency and get top 3
    const sortedWeaknesses = Object.entries(weaknessKeywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic, count]) => ({
        topic: topic.charAt(0).toUpperCase() + topic.slice(1),
        frequency: count,
        recommendation: getRecommendation(topic)
      }));

    return sortedWeaknesses.length > 0 ? sortedWeaknesses : [
      {
        topic: 'No patterns detected yet',
        frequency: 0,
        recommendation: 'Complete more interviews to identify weak areas'
      }
    ];

  } catch (error) {
    console.error('Weak topic detection error:', error);
    return [];
  }
};

/**
 * Get recommendation based on weak topic
 */
const getRecommendation = (topic) => {
  const recommendations = {
    'react': 'Practice component lifecycle and hooks',
    'node': 'Review Node.js async patterns and event loop',
    'mongodb': 'Study database indexing and aggregation',
    'express': 'Learn middleware and routing best practices',
    'javascript': 'Strengthen core JavaScript fundamentals',
    'async': 'Master async/await and Promise handling',
    'promise': 'Practice Promise chaining and error handling',
    'state': 'Review state management patterns',
    'hooks': 'Deep dive into React hooks usage',
    'database': 'Study database design and normalization',
    'api': 'Practice RESTful API design principles',
    'authentication': 'Review JWT and OAuth patterns',
    'security': 'Study common security vulnerabilities',
    'performance': 'Learn optimization techniques',
    'testing': 'Practice unit and integration testing',
    'algorithm': 'Practice data structures and algorithms',
    'error': 'Study error handling best practices'
  };

  return recommendations[topic] || `Review ${topic} concepts and practice`;
};

// @desc    Get detailed interview statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDetailedStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Optimized aggregation - combine both queries into one pipeline with facets
    const result = await Interview.aggregate([
      // Stage 1: Match user's completed interviews (with scores)
      {
        $match: { userId: userId, averageScore: { $ne: null } }
      },
      // Stage 2: Use $facet to run multiple aggregations in parallel
      {
        $facet: {
          // Overall statistics
          overall: [
            {
              $group: {
                _id: null,
                totalInterviews: { $sum: 1 },
                avgScore: { $avg: '$averageScore' },
                maxScore: { $max: '$averageScore' },
                minScore: { $min: '$averageScore' },
                totalQuestions: { $sum: { $size: '$questions' } }
              }
            },
            {
              $project: {
                _id: 0,
                totalInterviews: 1,
                avgScore: { $round: ['$avgScore', 2] },
                maxScore: { $round: ['$maxScore', 2] },
                minScore: { $round: ['$minScore', 2] },
                totalQuestions: 1
              }
            }
          ],
          // Statistics by level
          byLevel: [
            {
              $group: {
                _id: '$level',
                count: { $sum: 1 },
                avgScore: { $avg: '$averageScore' }
              }
            },
            {
              $project: {
                _id: 0,
                level: '$_id',
                count: 1,
                avgScore: { $round: ['$avgScore', 2] }
              }
            },
            {
              $sort: { count: -1 }
            }
          ]
        }
      }
    ]);

    // Extract results from facet
    const overall = result[0]?.overall[0] || {
      totalInterviews: 0,
      avgScore: 0,
      maxScore: 0,
      minScore: 0,
      totalQuestions: 0
    };

    const byLevel = result[0]?.byLevel || [];

    res.status(200).json({
      success: true,
      data: {
        overall,
        byLevel
      }
    });

  } catch (error) {
    console.error('Detailed stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
};
