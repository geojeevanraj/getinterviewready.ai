import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI client
let genAI = null;
let model = null;

const initializeGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }
  
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });
  
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

    // Construct the prompt for HR/Behavioral questions
    const prompt = `Act as a senior HR interviewer conducting behavioral and situational interviews.
Generate exactly ${count} HR interview questions for a ${role} position at ${level} level.

CRITICAL REQUIREMENTS:
- DO NOT generate technical coding or technical implementation questions
- FOCUS ONLY on HR, behavioral, and situational questions
- Questions should assess soft skills, work ethics, teamwork, leadership, problem-solving approach
- Use STAR method framework (Situation, Task, Action, Result) for behavioral questions
- Include questions about: past experiences, conflict resolution, teamwork, motivation, career goals, strengths/weaknesses

QUESTION CATEGORIES TO INCLUDE:
1. Behavioral Questions: "Tell me about a time when..."
2. Situational Questions: "How would you handle..."
3. Motivation & Goals: "Why do you want to work here?", "Where do you see yourself..."
4. Strengths & Weaknesses: Self-assessment questions
5. Cultural Fit: Team dynamics, work style preferences
6. Conflict Resolution: Dealing with difficult situations or people

EXAMPLES OF GOOD HR QUESTIONS:
✅ "Tell me about a time when you had to meet a tight deadline. How did you manage your time and prioritize tasks?"
✅ "Describe a situation where you had a conflict with a team member. How did you resolve it?"
✅ "How would you handle a situation where your manager gives you feedback you don't agree with?"
✅ "What motivates you to do your best work?"
✅ "Tell me about a project that didn't go as planned. What did you learn from it?"

AVOID TECHNICAL QUESTIONS LIKE:
❌ "Explain how authentication works"
❌ "Write code to solve X problem"
❌ "What is the difference between X and Y technology"

Difficulty Level Context for ${level}:
- Beginner: Entry-level questions, basic teamwork, learning experiences
- Intermediate: Mid-level questions, leadership potential, project management
- Advanced: Senior-level questions, strategic thinking, mentoring, complex decision-making

Return output strictly in JSON format as a valid JSON array:
[
  {
    "id": 1,
    "question": "Tell me about a time when you faced a significant challenge at work. How did you approach it and what was the outcome?",
    "difficulty": "${level}"
  },
  {
    "id": 2,
    "question": "How would you handle a situation where you disagree with your team's approach to a project?",
    "difficulty": "${level}"
  }
]

IMPORTANT: Return ONLY the JSON array, no additional text or markdown formatting.
Make questions specific and relevant to a ${role} role.`;

    console.log(`🤖 Generating ${count} HR/Behavioral questions for ${role} (${level})...`);

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

    const effectiveAnswer = userAnswer?.trim() || '(No answer provided)';

    // Construct the evaluation prompt
    const prompt = `You are a senior technical interviewer evaluating a candidate's answer.

Question: ${question}

User's Answer: ${effectiveAnswer}

Evaluate this answer and return your assessment in STRICT JSON format. No markdown, no code blocks, just pure JSON.

{
  "score": <number 0-10>,
  "strengths": "<what the candidate did well>",
  "weaknesses": "<areas for improvement>",
  "improvedAnswer": "<a complete ideal answer to the question>"
}

Requirements:
- Score 0-10 (10 is perfect)
- Be constructive and professional
- Keep feedback concise (2-3 sentences each)
- The "improvedAnswer" must ALWAYS contain a full, correct, ideal answer to the question, even if the candidate did not provide any answer. Never say "please provide an answer" — instead write the actual ideal response.
- Improved answer should be 2-4 sentences

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

/**
 * Generate aptitude test questions using Gemini AI
 * @param {string} category - Category (e.g., "Quantitative Aptitude", "Logical Reasoning", "Verbal Ability")
 * @param {string} difficulty - Difficulty level (e.g., "Easy", "Medium", "Hard")
 * @param {number} count - Number of questions to generate (5-50)
 * @returns {Promise<Array>} Array of generated MCQ questions
 */
export const generateAptitudeQuestions = async (category, difficulty, count) => {
  try {
    // Initialize if not already done
    if (!model) {
      initializeGemini();
    }

    // Validate count (5-50)
    if (count < 5 || count > 50) {
      throw new Error('Question count must be between 5 and 50');
    }

    // Validate category
    const validCategories = ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'];
    if (!validCategories.includes(category)) {
      throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }

    // Validate difficulty
    const validDifficulties = ['Easy', 'Medium', 'Hard'];
    if (!validDifficulties.includes(difficulty)) {
      throw new Error(`Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`);
    }

    // Construct the prompt for aptitude questions
    const prompt = `Generate exactly ${count} ${category} multiple choice questions at ${difficulty} difficulty level.

CRITICAL REQUIREMENTS:
- Generate ONLY ${category} questions
- All questions must be at ${difficulty} difficulty level
- Each question must have exactly 4 options (A, B, C, D)
- Each question must have ONE correct answer
- Provide detailed explanation for each answer

CATEGORY GUIDELINES:

${category === 'Quantitative Aptitude' ? `
QUANTITATIVE APTITUDE:
- Arithmetic: Percentages, Profit & Loss, Time & Work, Speed & Distance
- Algebra: Linear equations, Quadratic equations, Progressions
- Geometry: Areas, Volumes, Triangles, Circles
- Number System: LCM, GCD, Prime numbers, Divisibility
- Data Interpretation: Charts, Graphs, Tables
- Easy: Basic calculations, single-step problems
- Medium: Multi-step problems, moderate complexity
- Hard: Complex problems, multiple concepts combined
` : ''}

${category === 'Logical Reasoning' ? `
LOGICAL REASONING:
- Pattern Recognition: Number series, Letter series
- Analogies: Word analogies, Number analogies
- Blood Relations: Family tree problems
- Direction Sense: Movement and direction problems
- Coding-Decoding: Letter/Number coding
- Syllogisms: Logical deductions
- Puzzles: Seating arrangements, Ranking, Scheduling
- Easy: Simple patterns, direct logic
- Medium: Multi-step reasoning, moderate complexity
- Hard: Complex puzzles, multiple conditions
` : ''}

${category === 'Verbal Ability' ? `
VERBAL ABILITY:
- Vocabulary: Synonyms, Antonyms, Word meanings
- Grammar: Error spotting, Sentence correction
- Reading Comprehension: Short passages with questions
- Sentence Rearrangement: Jumbled sentences
- Fill in the Blanks: Context-based word selection
- Idioms & Phrases: Common expressions
- Para Jumbles: Paragraph reordering
- Easy: Basic vocabulary, simple grammar
- Medium: Moderate vocabulary, complex sentences
- Hard: Advanced vocabulary, complex comprehension
` : ''}

DIFFICULTY LEVEL SPECIFICS FOR ${difficulty}:
${difficulty === 'Easy' ? '- Questions should be straightforward and test basic concepts\n- Single-step solutions\n- Common scenarios\n- Clear and simple language' : ''}
${difficulty === 'Medium' ? '- Questions should test deeper understanding\n- Multi-step solutions\n- Moderate complexity\n- Some trick elements' : ''}
${difficulty === 'Hard' ? '- Questions should be challenging and complex\n- Multiple concepts combined\n- Tricky scenarios\n- Advanced problem-solving required' : ''}

Return output strictly in JSON format as a valid JSON array:
[
  {
    "question": "Clear question text with all necessary details",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "correctAnswer": "Option A text",
    "explanation": "Detailed explanation of why this is the correct answer and how to solve it"
  }
]

IMPORTANT RULES:
1. Return ONLY the JSON array, no additional text or markdown formatting
2. Ensure all JSON is valid and properly escaped
3. Each question must be unique and different
4. Options should be plausible distractors, not obviously wrong
5. Explanations must be educational and helpful
6. For ${category}, make questions realistic and exam-like`;

    console.log(`🤖 Generating ${count} ${category} questions at ${difficulty} level...`);

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log(`📝 Received response from Gemini`);

    // Parse and validate response
    const questions = parseGeminiResponse(text);

    // Validate question structure
    const validQuestions = questions
      .filter(q => {
        return (
          q.question &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          q.correctAnswer &&
          q.explanation
        );
      })
      .map((q, index) => ({
        id: index + 1,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }));

    if (validQuestions.length === 0) {
      throw new Error('No valid questions generated by AI');
    }

    console.log(`✅ Generated ${validQuestions.length} valid questions`);

    return validQuestions;

  } catch (error) {
    console.error('❌ Error generating aptitude questions:', error.message);
    throw new Error(`Failed to generate aptitude questions: ${error.message}`);
  }
};

export default {
  generateInterviewQuestions,
  evaluateAnswer,
  generateConfidenceFeedback,
  generateAptitudeQuestions,
  validateGeminiApiKey
};
