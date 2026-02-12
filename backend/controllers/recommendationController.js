import Interview from '../models/Interview.js';
import Recommendation from '../models/Recommendation.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cache from '../utils/cache.js';
import mongoose from 'mongoose';

// Lazy initialization - avoid reading env vars at import time (ESM hoists imports before dotenv.config())
let genAI = null;
const getGenAI = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

// Cache key generator for user's daily challenge
const getCacheKey = (userId) => `daily_challenge_${userId}`;

// Helper function to detect weak topics from interviews
const detectWeakTopics = async (userId) => {
  // Ensure userId is ObjectId
  const userObjectId = userId._id ? userId._id : new mongoose.Types.ObjectId(userId);
  
  const interviews = await Interview.aggregate([
    { $match: { userId: userObjectId, averageScore: { $ne: null } } }, // Only scored interviews
    { $unwind: '$evaluations' },
    { $match: { 'evaluations.score': { $lt: 7 } } },
    {
      $project: {
        weaknesses: { $toLower: '$evaluations.weaknesses' }
      }
    },
    {
      $group: {
        _id: null,
        allWeaknesses: { $push: '$weaknesses' }
      }
    }
  ]);

  if (!interviews.length || !interviews[0].allWeaknesses.length) {
    return [];
  }

  // Extract technical keywords from weaknesses
  const weaknessText = interviews[0].allWeaknesses.join(' ');
  const keywords = [
    'algorithm', 'data structure', 'array', 'string', 'tree', 'graph',
    'dynamic programming', 'recursion', 'sorting', 'searching',
    'linked list', 'stack', 'queue', 'hash', 'database', 'sql',
    'api', 'rest', 'system design', 'oop', 'async', 'promise',
    'react', 'node', 'express', 'mongodb', 'javascript', 'python',
    'optimization', 'complexity', 'debugging', 'testing'
  ];

  const topicCount = {};
  keywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    const matches = weaknessText.match(regex);
    if (matches) {
      topicCount[keyword] = matches.length;
    }
  });

  // Sort by frequency and return top weak topics
  return Object.entries(topicCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, frequency]) => ({ topic, frequency }));
};

// Check if user already has a daily challenge for today
const getTodaysChallenge = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return await Recommendation.findOne({
    userId,
    challengeDate: {
      $gte: today,
      $lt: tomorrow
    }
  }).sort({ createdAt: -1 });
};

// Generate recommendations using Gemini AI
const generateRecommendations = async (weakTopics) => {
  try {
    const model = getGenAI().getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });

    const topicsList = weakTopics.map(t => t.topic).join(', ');
    
    const prompt = `You are a senior technical mentor for software engineers.

Based on these weak topics identified from interview performance: ${topicsList}

Please analyze and provide:
1. 3 recommended learning topics to improve (focus on fundamentals and related concepts)
2. 1 daily coding or theory challenge to practice

Return your response in valid JSON format:
{
  "recommendedTopics": ["topic1", "topic2", "topic3"],
  "dailyChallenge": {
    "title": "Challenge title",
    "description": "Detailed challenge description with clear objectives",
    "difficulty": "Easy|Medium|Hard"
  }
}

Make the daily challenge practical, specific, and achievable in 30-60 minutes.
Ensure proper JSON formatting with no markdown or extra text.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Clean up response to extract JSON
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Parse JSON
    const parsedResponse = JSON.parse(jsonText);
    
    return parsedResponse;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw new Error('Failed to generate recommendations from AI');
  }
};

// Get recommendations for user
export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const cacheKey = getCacheKey(userId);

    console.log(`[Recommendations] Fetching for user: ${userId}`);

    // STEP 1: Check in-memory cache first (fastest)
    const cachedChallenge = cache.get(cacheKey);
    if (cachedChallenge) {
      console.log(`[Cache HIT] Returning cached challenge for user: ${userId}`);
      return res.status(200).json({
        success: true,
        data: cachedChallenge,
        cached: true
      });
    }

    console.log(`[Cache MISS] Fetching challenge for user: ${userId}`);

    // STEP 2: Check database for today's challenge
    const existingChallenge = await getTodaysChallenge(userId);
    
    if (existingChallenge) {
      // Store in cache for future requests (24-hour TTL)
      const ttl = 24 * 60 * 60 * 1000; // 24 hours
      cache.set(cacheKey, existingChallenge, ttl);
      console.log(`[Cache SET] Stored challenge in cache for user: ${userId}`);
      
      return res.status(200).json({
        success: true,
        data: existingChallenge
      });
    }

    // STEP 3: No existing challenge - detect weak topics
    const weakTopics = await detectWeakTopics(userId);

    if (!weakTopics.length) {
      const defaultResponse = {
        weakTopics: [],
        recommendedTopics: [],
        dailyChallenge: {
          title: 'Get Started',
          description: 'Complete at least one interview to receive personalized recommendations and daily challenges based on your performance.',
          difficulty: 'Medium'
        }
      };

      // Cache default response for 1 hour only (user might complete interview soon)
      cache.set(cacheKey, defaultResponse, 60 * 60 * 1000);

      return res.status(200).json({
        success: true,
        message: 'Complete more interviews to get personalized recommendations',
        data: defaultResponse
      });
    }

    // STEP 4: Generate new recommendations using Gemini AI
    console.log(`[AI] Generating recommendations for user: ${userId}`);
    const aiRecommendations = await generateRecommendations(weakTopics);

    // STEP 5: Save to database
    const recommendation = await Recommendation.create({
      userId,
      weakTopics,
      recommendedTopics: aiRecommendations.recommendedTopics,
      dailyChallenge: aiRecommendations.dailyChallenge,
      challengeDate: new Date()
    });

    // STEP 6: Store in cache (24-hour TTL)
    const ttl = 24 * 60 * 60 * 1000;
    cache.set(cacheKey, recommendation, ttl);
    console.log(`[Cache SET] Stored new AI-generated challenge for user: ${userId}`);

    res.status(200).json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch recommendations'
    });
  }
};

// Mark daily challenge as completed
export const completeChallenge = async (req, res) => {
  try {
    const { recommendationId } = req.params;
    const userId = req.user._id;
    const cacheKey = getCacheKey(userId);

    const recommendation = await Recommendation.findOne({
      _id: recommendationId,
      userId
    });

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    if (recommendation.completed) {
      return res.status(400).json({
        success: false,
        message: 'Challenge already completed'
      });
    }

    await recommendation.markAsCompleted();

    // Update cache with completed status
    cache.set(cacheKey, recommendation, 24 * 60 * 60 * 1000);
    console.log(`[Cache UPDATE] Updated challenge completion status for user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Challenge completed successfully!',
      data: recommendation
    });
  } catch (error) {
    console.error('Error completing challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete challenge'
    });
  }
};

// Get user's challenge history
export const getChallengeHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const [challenges, total] = await Promise.all([
      Recommendation.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Recommendation.countDocuments({ userId })
    ]);

    res.status(200).json({
      success: true,
      data: {
        challenges,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalChallenges: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching challenge history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge history'
    });
  }
};

// Clear user's cache and today's challenge (forces new challenge generation)
export const clearUserCache = async (req, res) => {
  try {
    const userId = req.user._id;
    const cacheKey = getCacheKey(userId);
    
    // Clear in-memory cache
    cache.delete(cacheKey);

    // Delete today's challenge from the database so a fresh one is generated
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await Recommendation.deleteMany({
      userId,
      challengeDate: { $gte: today, $lt: tomorrow }
    });

    console.log(`[Cache CLEAR] Cleared cache + today's DB challenge for user: ${userId}`);
    
    res.status(200).json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache'
    });
  }
};

// Get cache statistics (admin/debug endpoint)
export const getCacheStats = async (req, res) => {
  try {
    const stats = cache.getStats();
    
    res.status(200).json({
      success: true,
      data: {
        ...stats,
        memoryUsageMB: (stats.memoryUsage / 1024 / 1024).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cache statistics'
    });
  }
};
