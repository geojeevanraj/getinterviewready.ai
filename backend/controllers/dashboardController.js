import Interview from '../models/Interview.js';
import Recommendation from '../models/Recommendation.js';
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

// @desc    Get user activity streak and heatmap data
// @route   GET /api/dashboard/streak
// @access  Private
export const getStreakData = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Current year: Jan 1 to Dec 31
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1); // Jan 1
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59); // Dec 31

    // Fetch interview completion dates and challenge completion dates in parallel
    const [interviewDates, challengeDates] = await Promise.all([
      Interview.aggregate([
        {
          $match: {
            userId,
            completedAt: { $gte: yearStart, $lte: yearEnd, $ne: null }
          }
        },
        {
          $project: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } }
          }
        },
        {
          $group: {
            _id: '$date',
            count: { $sum: 1 }
          }
        }
      ]),
      Recommendation.aggregate([
        {
          $match: {
            userId,
            completed: true,
            completedAt: { $gte: yearStart, $lte: yearEnd, $ne: null }
          }
        },
        {
          $project: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } }
          }
        },
        {
          $group: {
            _id: '$date',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Merge activity counts by date
    const activityMap = {};
    interviewDates.forEach(d => {
      activityMap[d._id] = (activityMap[d._id] || 0) + d.count;
    });
    challengeDates.forEach(d => {
      activityMap[d._id] = (activityMap[d._id] || 0) + d.count;
    });

    // Convert to sorted array
    const activeDates = Object.keys(activityMap).sort();
    const totalActiveDays = activeDates.length;

    // Calculate total submissions
    const totalSubmissions = Object.values(activityMap).reduce((a, b) => a + b, 0);

    // Calculate current streak and max streak
    let currentStreak = 0;
    let maxStreak = 0;

    if (activeDates.length > 0) {
      // Build a Set of active date strings for O(1) lookup
      const activeSet = new Set(activeDates);

      // Current streak: count consecutive days back from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let checkDate = new Date(today);

      // Check if today is active; if not, check yesterday (streak might still be alive)
      const todayStr = checkDate.toISOString().split('T')[0];
      if (!activeSet.has(todayStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayStr = checkDate.toISOString().split('T')[0];
        if (!activeSet.has(yesterdayStr)) {
          currentStreak = 0;
        } else {
          // Start counting from yesterday
          while (activeSet.has(checkDate.toISOString().split('T')[0])) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          }
        }
      } else {
        // Today is active, count backwards
        while (activeSet.has(checkDate.toISOString().split('T')[0])) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }

      // Max streak: find longest consecutive run
      let tempStreak = 1;
      maxStreak = 1;
      for (let i = 1; i < activeDates.length; i++) {
        const prev = new Date(activeDates[i - 1]);
        const curr = new Date(activeDates[i]);
        const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
        if (diffDays === 1) {
          tempStreak++;
          maxStreak = Math.max(maxStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
    }

    // Build heatmap data: array of { date, count } for every day in the current year
    const heatmap = [];
    const startDate = new Date(yearStart);
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      heatmap.push({
        date: dateStr,
        count: activityMap[dateStr] || 0
      });
    }

    res.status(200).json({
      success: true,
      data: {
        currentStreak,
        maxStreak,
        totalActiveDays,
        totalSubmissions,
        year: currentYear,
        heatmap
      }
    });
  } catch (error) {
    console.error('Streak data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching streak data'
    });
  }
};
