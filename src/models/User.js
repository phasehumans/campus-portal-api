const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'admin'],
      default: 'student',
      required: true,
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    lastLogin: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
      sparse: true,
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Remove password from JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
