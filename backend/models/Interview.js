import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
      maxlength: [100, 'Role cannot exceed 100 characters']
    },
    level: {
      type: String,
      required: [true, 'Level is required'],
      enum: {
        values: ['Beginner', 'Intermediate', 'Advanced'],
        message: 'Level must be Beginner, Intermediate, or Advanced'
      }
    },
    questions: [
      {
        id: {
          type: Number,
          required: true
        },
        question: {
          type: String,
          required: true,
          trim: true
        },
        difficulty: {
          type: String,
          required: true
        }
      }
    ],
    answers: [
      {
        questionId: {
          type: Number,
          required: true
        },
        userAnswer: {
          type: String,
          trim: true,
          default: ''
        }
      }
    ],
    evaluations: [
      {
        questionId: {
          type: Number,
          required: true
        },
        score: {
          type: Number,
          min: 0,
          max: 10,
          default: null
        },
        strengths: {
          type: String,
          default: ''
        },
        weaknesses: {
          type: String,
          default: ''
        },
        improvedAnswer: {
          type: String,
          default: ''
        }
      }
    ],
    averageScore: {
      type: Number,
      min: 0,
      max: 10,
      default: null
    },
    // Confidence metrics from webcam analysis
    confidenceMetrics: {
      eyeContact: {
        type: Number,
        min: 0,
        max: 100,
        default: null
      },
      stability: {
        type: Number,
        min: 0,
        max: 100,
        default: null
      },
      expression: {
        type: Number,
        min: 0,
        max: 100,
        default: null
      },
      blinkRate: {
        type: Number,
        default: null
      },
      duration: {
        type: Number, // in seconds
        default: null
      }
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    confidenceFeedback: {
      confidenceLevel: {
        type: String,
        default: ''
      },
      feedback: {
        type: String,
        default: ''
      },
      improvementTips: {
        type: [String],
        default: []
      }
    },
    status: {
      type: String,
      enum: ['started', 'completed'],
      default: 'started'
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt
  }
);

// Indexes for optimized query performance
// Compound index for user's completed interviews sorted by completion date (most common query)
interviewSchema.index({ userId: 1, status: 1, completedAt: -1 });

// Compound index for user's interviews sorted by creation date
interviewSchema.index({ userId: 1, createdAt: -1 });

// Single field indexes
interviewSchema.index({ status: 1 });
interviewSchema.index({ averageScore: -1 }); // For sorting by score
interviewSchema.index({ completedAt: -1 }); // For date-based queries

// Compound index for filtering and sorting
interviewSchema.index({ userId: 1, level: 1, status: 1 });

// Virtual for question count
interviewSchema.virtual('questionCount').get(function () {
  return this.questions.length;
});

// Method to calculate average score
interviewSchema.methods.calculateAverageScore = function () {
  if (this.evaluations.length === 0) return null;
  
  const totalScore = this.evaluations.reduce((sum, e) => sum + (e.score || 0), 0);
  return parseFloat((totalScore / this.evaluations.length).toFixed(2));
};

// Method to mark interview as completed
interviewSchema.methods.markAsCompleted = function () {
  this.status = 'completed';
  this.completedAt = new Date();
  this.averageScore = this.calculateAverageScore();
  return this.save();
};

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview;
