import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  analysis: {
    strengths: [{
      type: String
    }],
    weaknesses: [{
      type: String
    }],
    missingSkills: [{
      type: String
    }],
    improvementSuggestions: [{
      type: String
    }],
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    keywords: {
      technical: [{ type: String }],
      soft: [{ type: String }],
      tools: [{ type: String }],
      missing: [{ type: String }]
    },
    scoreBreakdown: {
      keywordOptimization: { type: Number, min: 0, max: 100 },
      formatting: { type: Number, min: 0, max: 100 },
      contentQuality: { type: Number, min: 0, max: 100 },
      completeness: { type: Number, min: 0, max: 100 },
      impactMetrics: { type: Number, min: 0, max: 100 }
    },
    sections: {
      hasContactInfo: { type: Boolean, default: false },
      hasSummary: { type: Boolean, default: false },
      hasExperience: { type: Boolean, default: false },
      hasEducation: { type: Boolean, default: false },
      hasSkills: { type: Boolean, default: false },
      hasProjects: { type: Boolean, default: false },
      hasCertifications: { type: Boolean, default: false }
    }
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
resumeSchema.index({ userId: 1, uploadedAt: -1 });
resumeSchema.index({ userId: 1, 'analysis.atsScore': -1 });

export default mongoose.model('Resume', resumeSchema);
