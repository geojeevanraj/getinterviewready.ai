import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI client
let genAI = null;
let model = null;

const initializeGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }
  
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  console.log('✅ Gemini AI initialized successfully');
};

/**
 * Generate interview questions using Gemini AI
 * @param {string} role - Job role (e.g., "MERN Developer")
 * @param {string} level - Difficulty level (e.g., "Beginner", "Intermediate", "Advanced")
 * @param {number} count - Number of questions to generate (default: 5)
 * @returns {Promise<Array>} Array of generated questions
 */
export const generateInterviewQuestions = async (role, level, count = 5) => {
  try {
    // Initialize if not already done
    if (!model) {
      initializeGemini();
    }

    // Construct the prompt
    const prompt = `Act as a senior technical interviewer.
Generate exactly ${count} interview questions for a ${role} position at ${level} level.

Requirements:
- Questions should be relevant to ${role} role
- Difficulty should match ${level} level
- Cover different aspects: technical skills, problem-solving, experience
- Questions should be clear and professional

Return output strictly in JSON format as a valid JSON array:
[
  {
    "id": 1,
    "question": "Question text here",
    "difficulty": "${level}"
  },
  {
    "id": 2,
    "question": "Question text here",
    "difficulty": "${level}"
  }
]

IMPORTANT: Return ONLY the JSON array, no additional text or markdown formatting.`;

    console.log(`🤖 Generating ${count} questions for ${role} (${level})...`);

    // Call Gemini API with retry logic
    let response;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const result = await model.generateContent(prompt);
        response = result.response;
        break;
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
        console.log(`⚠️  Retry attempt ${attempts}/${maxAttempts}...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }

    const text = response.text();
    console.log('📝 Gemini response received');

    // Parse and validate the response
    const questions = parseGeminiResponse(text);
    
    // Validate questions
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid response format from Gemini AI');
    }

    // Ensure each question has required fields
    const validatedQuestions = questions.map((q, index) => ({
      id: q.id || index + 1,
      question: q.question || q.text || '',
      difficulty: q.difficulty || level
    }));

    // Filter out invalid questions
    const validQuestions = validatedQuestions.filter(q => q.question.trim() !== '');

    if (validQuestions.length === 0) {
      throw new Error('No valid questions generated');
    }

    console.log(`✅ Generated ${validQuestions.length} valid questions`);
    return validQuestions;

  } catch (error) {
    console.error('❌ Gemini service error:', error.message);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
};

/**
 * Parse Gemini response and extract JSON
 * Handles various response formats
 */
const parseGeminiResponse = (text) => {
  try {
    // Remove markdown code blocks if present
    let cleaned = text.trim();
    
    // Remove ```json and ``` markers
    cleaned = cleaned.replace(/```json\s*/gi, '');
    cleaned = cleaned.replace(/```\s*/g, '');
    
    // Try to find JSON array in the text
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    // Parse JSON
    const parsed = JSON.parse(cleaned);
    
    if (Array.isArray(parsed)) {
      return parsed;
    }
    
    // If it's an object with questions array
    if (parsed.questions && Array.isArray(parsed.questions)) {
      return parsed.questions;
    }

    throw new Error('Response is not a valid array');
    
  } catch (error) {
    console.error('❌ JSON parsing error:', error.message);
    console.log('Raw response:', text.substring(0, 200) + '...');
    
    // Fallback: Try to extract questions manually
    return extractQuestionsManually(text);
  }
};

/**
 * Fallback method to extract questions from text
 */
const extractQuestionsManually = (text) => {
  const questions = [];
  const lines = text.split('\n');
  
  let questionCount = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Look for question patterns
    if (trimmed.length > 20 && 
        (trimmed.includes('?') || 
         trimmed.match(/^\d+\./))) {
      
      questionCount++;
      questions.push({
        id: questionCount,
        question: trimmed.replace(/^\d+\.\s*/, ''),
        difficulty: 'Unknown'
      });
    }
  }
  
  if (questions.length === 0) {
    throw new Error('Could not extract questions from response');
  }
  
  return questions;
};

/**
 * Evaluate user's answer using Gemini AI
 * @param {string} question - The interview question
 * @param {string} userAnswer - User's answer
 * @returns {Promise<Object>} Evaluation with score, strengths, weaknesses, improvedAnswer
 */
export const evaluateAnswer = async (question, userAnswer) => {
  try {
    // Initialize if not already done
    if (!model) {
      initializeGemini();
    }

    console.log(`🤖 Evaluating answer for question...`);

    // Construct the evaluation prompt
    const prompt = `You are a senior technical interviewer evaluating a candidate's answer.

Question: ${question}

User's Answer: ${userAnswer}

Evaluate this answer and return your assessment in STRICT JSON format. No markdown, no code blocks, just pure JSON.

{
  "score": <number 0-10>,
  "strengths": "<what the candidate did well>",
  "weaknesses": "<areas for improvement>",
  "improvedAnswer": "<a better version of the answer>"
}

Requirements:
- Score 0-10 (10 is perfect)
- Be constructive and professional
- Keep feedback concise (2-3 sentences each)
- Improved answer should be 2-3 sentences

Return ONLY the JSON object, nothing else.`;

    // Call Gemini API with retry logic
    let response;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const result = await model.generateContent(prompt);
        response = result.response;
        break;
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error(`Failed to evaluate answer: ${error.message}`);
        }
        console.log(`⚠️  Retry attempt ${attempts}/${maxAttempts}...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }

    const text = response.text();
    console.log('📝 Raw Gemini evaluation response:', text.substring(0, 200));

    // Parse the response
    const evaluation = parseEvaluationResponse(text);
    
    console.log(`✅ Evaluation complete - Score: ${evaluation.score}/10`);
    
    return evaluation;

  } catch (error) {
    console.error('❌ Gemini evaluation error:', error.message);
    throw new Error(`Failed to evaluate answer: ${error.message}`);
  }
};

/**
 * Parse Gemini's evaluation response
 */
const parseEvaluationResponse = (text) => {
  try {
    // Remove markdown code blocks if present
    let cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Try to parse as JSON
    const evaluation = JSON.parse(cleanedText);
    
    // Validate structure
    if (typeof evaluation.score !== 'number' || evaluation.score < 0 || evaluation.score > 10) {
      throw new Error('Invalid score in evaluation');
    }
    
    return {
      score: Math.round(evaluation.score * 10) / 10, // Round to 1 decimal
      strengths: evaluation.strengths || 'No specific strengths identified',
      weaknesses: evaluation.weaknesses || 'No specific weaknesses identified',
      improvedAnswer: evaluation.improvedAnswer || 'No improved answer provided'
    };
    
  } catch (parseError) {
    console.error('Failed to parse evaluation response:', parseError.message);
    
    // Fallback: return default evaluation
    return {
      score: 5,
      strengths: 'Answer was provided',
      weaknesses: 'Unable to evaluate properly',
      improvedAnswer: 'Please review the question and provide a more detailed answer'
    };
  }
};

/**
 * Validate Gemini API key
 */
export const validateGeminiApiKey = () => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return { valid: false, message: 'GEMINI_API_KEY not set' };
    }
    
    if (process.env.GEMINI_API_KEY.length < 20) {
      return { valid: false, message: 'GEMINI_API_KEY appears invalid' };
    }
    
    return { valid: true, message: 'API key present' };
  } catch (error) {
    return { valid: false, message: error.message };
  }
};

/**
 * Generate confidence feedback based on webcam metrics
 * @param {object} metrics - Confidence metrics from facial analysis
 * @returns {Promise<object>} Confidence feedback
 */
export const generateConfidenceFeedback = async (metrics) => {
  try {
    // Initialize if not already done
    if (!model) {
      initializeGemini();
    }

    const {
      eyeContactScore = 0,
      stabilityScore = 0,
      expressionScore = 0,
      confidenceScore = 0,
      blinkRate = 0,
      duration = 0
    } = metrics;

    // Construct the prompt
    const prompt = `Act as a professional interview coach analyzing a candidate's non-verbal communication.

Interview Confidence Metrics (from webcam analysis):
- Eye Contact: ${eyeContactScore}/100 (how often candidate looked at camera)
- Stability: ${stabilityScore}/100 (head movement and posture steadiness)
- Expression: ${expressionScore}/100 (facial expressions, smile, engagement)
- Overall Confidence Score: ${confidenceScore}/100
- Blink Rate: ${blinkRate} blinks per minute (normal is 15-20)
- Interview Duration: ${duration} seconds

Provide professional feedback and improvement tips for the candidate.

Return output strictly in JSON format:
{
  "confidenceLevel": "Excellent|Good|Average|Below Average|Needs Improvement",
  "feedback": "2-3 sentences summarizing the candidate's non-verbal performance",
  "improvementTips": [
    "Specific tip 1",
    "Specific tip 2",
    "Specific tip 3"
  ]
}

Focus on:
- Professional, constructive tone
- Actionable advice
- Specific improvements for low-scoring metrics
- Positive reinforcement for strengths`;

    console.log('📤 Sending confidence analysis prompt to Gemini...');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('📥 Received confidence feedback from Gemini');

    // Clean response
    let cleanedText = text.trim();
    
    // Remove markdown code blocks
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }
    
    cleanedText = cleanedText.trim();
    
    // Parse JSON
    const feedback = JSON.parse(cleanedText);
    
    // Validate structure
    if (!feedback.confidenceLevel || !feedback.feedback || !Array.isArray(feedback.improvementTips)) {
      throw new Error('Invalid feedback structure');
    }
    
    return {
      confidenceLevel: feedback.confidenceLevel,
      feedback: feedback.feedback,
      improvementTips: feedback.improvementTips
    };
    
  } catch (parseError) {
    console.error('Failed to generate confidence feedback:', parseError.message);
    
    // Fallback feedback based on score
    const { confidenceScore = 50 } = metrics;
    let level = 'Average';
    let feedback = 'Your non-verbal communication shows room for improvement.';
    const tips = [];

    if (confidenceScore >= 80) {
      level = 'Excellent';
      feedback = 'You demonstrated excellent non-verbal communication with strong eye contact and confident demeanor.';
      tips.push('Maintain this level of confidence in future interviews');
    } else if (confidenceScore >= 65) {
      level = 'Good';
      feedback = 'You showed good non-verbal communication with consistent eye contact and stable posture.';
      tips.push('Try to maintain even more consistent eye contact');
    } else if (confidenceScore >= 50) {
      level = 'Average';
      feedback = 'Your non-verbal communication was adequate but could be improved.';
      tips.push('Practice maintaining eye contact with the camera');
      tips.push('Work on keeping your head stable and posture confident');
    } else if (confidenceScore >= 35) {
      level = 'Below Average';
      feedback = 'Your non-verbal communication needs improvement to convey more confidence.';
      tips.push('Practice looking directly at the camera more frequently');
      tips.push('Focus on keeping your head still and maintaining good posture');
      tips.push('Try to smile naturally and appear more engaged');
    } else {
      level = 'Needs Improvement';
      feedback = 'Your non-verbal communication showed significant areas for improvement.';
      tips.push('Practice mock interviews while recording yourself');
      tips.push('Work on maintaining consistent eye contact with the camera');
      tips.push('Focus on minimizing head movement and fidgeting');
    }

    // Add metric-specific tips
    if (metrics.eyeContactScore < 60) {
      tips.push('Improve eye contact: Look at the camera lens, not the screen');
    }
    if (metrics.stabilityScore < 60) {
      tips.push('Reduce head movement: Sit in a comfortable, stable position');
    }
    if (metrics.expressionScore < 50) {
      tips.push('Show more positive expressions: Practice smiling naturally');
    }

    return {
      confidenceLevel: level,
      feedback,
      improvementTips: tips.slice(0, 5) // Max 5 tips
    };
  }
};

export default {
  generateInterviewQuestions,
  evaluateAnswer,
  generateConfidenceFeedback,
  validateGeminiApiKey
};
