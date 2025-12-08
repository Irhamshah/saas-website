import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  subscriptionId: {
    type: String,
    default: null
  },
  customerId: {
    type: String,
    default: null
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'incomplete', 'trialing', null],
    default: null
  },
  subscriptionEndDate: {
    type: Date,
    default: null
  },
  toolsUsed: [{
    toolId: String,
    count: {
      type: Number,
      default: 0
    },
    lastUsed: Date
  }],
  totalToolUsage: {
    type: Number,
    default: 0
  },
  // Monthly usage tracking for free tier limits
  monthlyUsage: {
    type: Map,
    of: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to track tool usage
userSchema.methods.trackToolUsage = async function(toolId) {
  const toolIndex = this.toolsUsed.findIndex(t => t.toolId === toolId);
  
  if (toolIndex > -1) {
    this.toolsUsed[toolIndex].count += 1;
    this.toolsUsed[toolIndex].lastUsed = new Date();
  } else {
    this.toolsUsed.push({
      toolId,
      count: 1,
      lastUsed: new Date()
    });
  }
  
  this.totalToolUsage += 1;
  await this.save();
};

// Method to check if user has exceeded monthly limit
userSchema.methods.checkMonthlyLimit = function(toolId) {
  if (this.isPremium) {
    return { allowed: true, remaining: null };
  }

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthKey = `${currentYear}-${currentMonth}`;
  
  const usage = this.monthlyUsage?.get(monthKey)?.[toolId] || 0;
  const limit = 3;
  
  return {
    allowed: usage < limit,
    used: usage,
    limit: limit,
    remaining: Math.max(0, limit - usage)
  };
};

// Method to reset monthly usage (can be called by cron job)
userSchema.methods.resetMonthlyUsage = function(monthKey) {
  if (this.monthlyUsage) {
    this.monthlyUsage.delete(monthKey);
    this.markModified('monthlyUsage');
  }
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.models.user || mongoose.model('user', userSchema);

export default User;
