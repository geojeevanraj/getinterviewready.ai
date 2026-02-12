import mongoose from 'mongoose';

const aptitudeResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  answers: [{
    questionId: String,
    question: String,
    userAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean,
    explanation: String
  }],
  timeTaken: {
    type: Number, // in seconds
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
aptitudeResultSchema.index({ userId: 1, createdAt: -1 });
aptitudeResultSchema.index({ userId: 1, category: 1 });

const AptitudeResult = mongoose.model('AptitudeResult', aptitudeResultSchema);

export default AptitudeResult;
