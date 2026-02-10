import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weakTopics: [{
    topic: String,
    frequency: Number
  }],
  recommendedTopics: [{
    type: String
  }],
  dailyChallenge: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    }
  },
  challengeDate: {
    type: Date,
    default: Date.now
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
recommendationSchema.index({ userId: 1, challengeDate: -1 });
recommendationSchema.index({ userId: 1, completed: 1 });

// Method to mark challenge as completed
recommendationSchema.methods.markAsCompleted = function() {
  this.completed = true;
  this.completedAt = new Date();
  return this.save();
};

export default mongoose.model('Recommendation', recommendationSchema);
