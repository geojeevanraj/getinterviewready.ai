import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[\w.-]+@[\w.-]+\.\w{2,}$/,
        'Please provide a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't return password by default
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    lastLogin: {
      type: Date,
      default: null
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    education: [
      {
        degree: { type: String, trim: true, default: '' },
        institution: { type: String, trim: true, default: '' },
        year: { type: String, trim: true, default: '' },
        cgpa: { type: String, trim: true, default: '' }
      }
    ],
    skills: [{ type: String, trim: true }],
    certifications: [{ type: String, trim: true }],
    resumeExtracted: {
      type: Boolean,
      default: false
    },
    resumeExtractedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
