import mongoose from 'mongoose';

const aptitudeQuestionSchema = new mongoose.Schema({
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
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 4;
      },
      message: 'Must have exactly 4 options'
    }
  },
  correctAnswer: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
aptitudeQuestionSchema.index({ category: 1, difficulty: 1 });

const AptitudeQuestion = mongoose.model('AptitudeQuestion', aptitudeQuestionSchema);

export default AptitudeQuestion;
