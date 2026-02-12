import Resume from '../models/Resume.js';
import User from '../models/User.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

// Initialize Gemini AI client (lazy initialization)
let genAI = null;
let model = null;

const initializeGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }
  
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });
  
  console.log('✅ Resume Controller - Gemini AI initialized successfully');
};

// Analyze resume text using Gemini AI
const analyzeResumeWithAI = async (resumeText) => {
  try {
    // Initialize if not already done
    if (!model) {
      initializeGemini();
    }

    const prompt = `You are an expert ATS (Applicant Tracking System) analyzer and technical recruiter.

Analyze this resume for ATS compatibility and provide a comprehensive evaluation.

Resume Content:
${resumeText}

IMPORTANT: Return ONLY valid JSON (no markdown, no code blocks, no extra text):

{
  "strengths": ["specific strength with evidence", "another strength", "third strength", "fourth strength"],
  "weaknesses": ["specific weakness", "another weakness", "third weakness"],
  "missingSkills": ["important missing skill", "another missing skill", "third missing skill"],
  "improvementSuggestions": ["actionable suggestion", "another suggestion", "third suggestion", "fourth suggestion"],
  "atsScore": 75,
  "keywords": {
    "technical": ["React", "Node.js", "MongoDB", "JavaScript", "TypeScript"],
    "soft": ["Leadership", "Communication", "Problem Solving"],
    "tools": ["Git", "Docker", "AWS", "Jira"],
    "missing": ["Jenkins", "Kubernetes", "GraphQL"]
  },
  "scoreBreakdown": {
    "keywordOptimization": 75,
    "formatting": 80,
    "contentQuality": 70,
    "completeness": 85,
    "impactMetrics": 60
  },
  "sections": {
    "hasContactInfo": true,
    "hasSummary": true,
    "hasExperience": true,
    "hasEducation": true,
    "hasSkills": true,
    "hasProjects": false,
    "hasCertifications": false
  }
}

ATS Analysis Guidelines:

1. KEYWORD EXTRACTION (0-100):
   - Extract ALL technical skills mentioned (frameworks, languages, databases, tools)
   - Identify soft skills explicitly stated
   - List development tools and platforms
   - Note critical missing keywords for tech roles (CI/CD, cloud platforms, testing frameworks)
   - Score based on keyword density and relevance

2. FORMATTING SCORE (0-100):
   - Simple, clean structure (avoid tables, columns, graphics)
   - Standard section headings (Experience, Education, Skills)
   - Consistent date formats
   - No headers/footers that ATS can't parse
   - Bullet points vs paragraphs
   - File format compatibility (PDF readability)

3. CONTENT QUALITY (0-100):
   - Quantifiable achievements (numbers, percentages, metrics)
   - Action verbs at start of bullets (Developed, Implemented, Led)
   - Relevant experience for tech roles
   - Clear job titles and company names
   - Appropriate length (1-2 pages)
   - No spelling/grammar errors

4. COMPLETENESS (0-100):
   - Contact information (email, phone, LinkedIn, GitHub)
   - Professional summary/objective
   - Work experience with dates
   - Education with degrees
   - Technical skills section
   - Projects/portfolio (for developers)
   - Certifications (if applicable)

5. IMPACT METRICS (0-100):
   - Uses quantifiable results (improved performance by 40%)
   - Shows business impact (reduced costs, increased revenue)
   - Demonstrates scale (managed team of 10, handled 1M users)
   - Technical achievements (reduced load time, optimized queries)

Provide specific, actionable feedback. Be critical but constructive.
Focus on both ATS parsing and recruiter appeal.`;

    console.log('🤖 Analyzing resume with Gemini AI...');
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('📄 Raw AI Response:', text.substring(0, 200) + '...');
    
    // Clean up response to extract JSON
    let jsonText = text.trim();
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    // Remove any leading/trailing whitespace
    jsonText = jsonText.trim();
    
    // Parse JSON
    const analysis = JSON.parse(jsonText);
    
    // Validate analysis structure
    if (!analysis.strengths || !analysis.weaknesses || !analysis.missingSkills || 
        !analysis.improvementSuggestions || typeof analysis.atsScore !== 'number') {
      throw new Error('Invalid analysis format from AI');
    }
    
    // Ensure all required fields exist with defaults
    analysis.keywords = analysis.keywords || { technical: [], soft: [], tools: [], missing: [] };
    analysis.scoreBreakdown = analysis.scoreBreakdown || {
      keywordOptimization: analysis.atsScore,
      formatting: analysis.atsScore,
      contentQuality: analysis.atsScore,
      completeness: analysis.atsScore,
      impactMetrics: analysis.atsScore
    };
    analysis.sections = analysis.sections || {
      hasContactInfo: true,
      hasSummary: false,
      hasExperience: true,
      hasEducation: true,
      hasSkills: true,
      hasProjects: false,
      hasCertifications: false
    };
    
    console.log('✅ Resume analysis completed successfully');
    
    return analysis;
  } catch (error) {
    console.error('Error analyzing resume with AI:', error);
    throw new Error('Failed to analyze resume with AI');
  }
};

// Extract structured profile data from resume text using Gemini AI
const extractProfileFromResume = async (resumeText) => {
  try {
    if (!model) {
      initializeGemini();
    }

    const prompt = `Extract the following details from this resume text and return strict JSON.

Resume Content:
${resumeText}

IMPORTANT: Return ONLY valid JSON (no markdown, no code blocks, no extra text):

{
  "name": "",
  "email": "",
  "phone": "",
  "education": [
    {
      "degree": "",
      "institution": "",
      "year": "",
      "cgpa": ""
    }
  ],
  "skills": [],
  "certifications": []
}

Guidelines:
- Extract ALL education entries found (degree, university/college, graduation year, CGPA/GPA if mentioned)
- Extract ALL technical and soft skills as individual items
- Extract ALL certifications, courses, or professional qualifications
- If a field is not found, use empty string for strings or empty array for arrays
- For education year, use the graduation year or expected graduation year
- For CGPA, include the scale if mentioned (e.g. "8.5/10" or "3.8/4.0")
- Return only valid JSON`;

    console.log('🤖 Extracting profile data from resume with Gemini AI...');
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Clean up response to extract JSON
    let jsonText = text.trim();
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    jsonText = jsonText.trim();
    
    const extracted = JSON.parse(jsonText);
    
    // Validate and sanitize
    extracted.name = extracted.name || '';
    extracted.email = extracted.email || '';
    extracted.phone = extracted.phone || '';
    extracted.education = Array.isArray(extracted.education) ? extracted.education : [];
    extracted.skills = Array.isArray(extracted.skills) ? extracted.skills.filter(s => typeof s === 'string' && s.trim()) : [];
    extracted.certifications = Array.isArray(extracted.certifications) ? extracted.certifications.filter(c => typeof c === 'string' && c.trim()) : [];
    
    console.log('✅ Profile extraction completed successfully');
    return extracted;
  } catch (error) {
    console.error('Error extracting profile from resume:', error);
    throw new Error('Failed to extract profile data from resume');
  }
};

// Upload and analyze resume
export const uploadResume = async (req, res) => {
  let filePath = null;

  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file'
      });
    }

    filePath = req.file.path;
    const userId = req.user._id;

    console.log(`[Resume Upload] Processing file: ${req.file.originalname} for user: ${userId}`);

    // Step 1: Extract text from PDF
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length < 100) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'Could not extract enough text from PDF. Please ensure the PDF contains readable text.'
      });
    }

    console.log(`[Resume Upload] Extracted ${resumeText.length} characters from PDF`);

    // Step 2: Analyze with Gemini AI
    console.log(`[Resume Upload] Analyzing with Gemini AI...`);
    const analysis = await analyzeResumeWithAI(resumeText);

    // Step 3: Save to database (including all analysis fields)
    const resume = await Resume.create({
      userId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      analysis: {
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        missingSkills: analysis.missingSkills,
        improvementSuggestions: analysis.improvementSuggestions,
        atsScore: analysis.atsScore,
        keywords: analysis.keywords,
        scoreBreakdown: analysis.scoreBreakdown,
        sections: analysis.sections
      }
    });

    // Clean up uploaded file after processing
    fs.unlinkSync(filePath);
    console.log(`[Resume Upload] Analysis complete. ATS Score: ${analysis.atsScore}`);

    // Step 4: Extract profile data and update user profile
    let profileExtraction = null;
    try {
      profileExtraction = await extractProfileFromResume(resumeText);
      
      // Build update object - only set non-empty fields
      const profileUpdate = {
        resumeExtracted: true,
        resumeExtractedAt: new Date()
      };
      
      if (profileExtraction.name && profileExtraction.name.trim()) {
        profileUpdate.name = profileExtraction.name.trim();
      }
      if (profileExtraction.phone && profileExtraction.phone.trim()) {
        profileUpdate.phone = profileExtraction.phone.trim();
      }
      if (profileExtraction.education && profileExtraction.education.length > 0) {
        profileUpdate.education = profileExtraction.education.map(edu => ({
          degree: edu.degree || '',
          institution: edu.institution || '',
          year: edu.year || '',
          cgpa: edu.cgpa || ''
        }));
      }
      if (profileExtraction.skills && profileExtraction.skills.length > 0) {
        profileUpdate.skills = profileExtraction.skills;
      }
      if (profileExtraction.certifications && profileExtraction.certifications.length > 0) {
        profileUpdate.certifications = profileExtraction.certifications;
      }
      
      await User.findByIdAndUpdate(userId, profileUpdate, { new: true });
      console.log(`[Resume Upload] User profile updated with extracted data`);
    } catch (extractError) {
      console.error('[Resume Upload] Profile extraction failed (non-fatal):', extractError.message);
      // Non-fatal: resume analysis still succeeded
    }

    res.status(201).json({
      success: true,
      message: 'Resume analyzed successfully',
      data: resume,
      profileExtracted: profileExtraction ? true : false
    });
  } catch (error) {
    // Clean up file if it exists
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    console.error('Error uploading resume:', error);
    
    // Handle specific error types
    if (error.message.includes('Only PDF files')) {
      return res.status(400).json({
        success: false,
        message: 'Only PDF files are allowed'
      });
    }

    if (error.message.includes('File too large')) {
      return res.status(400).json({
        success: false,
        message: 'File size must be less than 5MB'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process resume'
    });
  }
};

// Get user's resume history
export const getResumeHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const [resumes, total] = await Promise.all([
      Resume.find({ userId })
        .sort({ uploadedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v')
        .lean(),
      Resume.countDocuments({ userId })
    ]);

    res.status(200).json({
      success: true,
      data: {
        resumes,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalResumes: total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching resume history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume history'
    });
  }
};

// Get single resume analysis
export const getResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const userId = req.user._id;

    const resume = await Resume.findOne({
      _id: resumeId,
      userId
    }).select('-__v');

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume'
    });
  }
};

// Delete resume
export const deleteResume = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const userId = req.user._id;

    const resume = await Resume.findOneAndDelete({
      _id: resumeId,
      userId
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resume'
    });
  }
};

// Re-extract profile data from most recent resume
export const reExtractProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get the most recent resume
    const latestResume = await Resume.findOne({ userId }).sort({ uploadedAt: -1 });
    if (!latestResume) {
      return res.status(404).json({
        success: false,
        message: 'No resume found. Please upload a resume first.'
      });
    }

    // We don't have the file anymore, but we can try to get text from the stored analysis
    // For re-extraction, we need the original PDF. Since we delete it, we'll use keywords/data from analysis
    // Better approach: re-upload. Send back a message.
    return res.status(400).json({
      success: false,
      message: 'Please re-upload your resume to extract updated profile data.'
    });
  } catch (error) {
    console.error('Error re-extracting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to re-extract profile data'
    });
  }
};
