const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    key: {
      type: String,
      unique: true,
      required: true,
      default: () => uuidv4(),
    },
    hashedKey: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    permissions: [
      {
        type: String,
        enum: [
          'read',
          'write',
          'delete',
          'admin',
        ],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
apiKeySchema.index({ user: 1 });
apiKeySchema.index({ hashedKey: 1 });

// Hash the key before saving
apiKeySchema.pre('save', function (next) {
  if (this.isModified('key') || this.isNew) {
    this.hashedKey = crypto
      .createHash('sha256')
      .update(this.key)
      .digest('hex');
  }
  next();
});

// Method to verify API key
apiKeySchema.statics.verifyKey = function (key) {
  const hashedKey = crypto
    .createHash('sha256')
    .update(key)
    .digest('hex');
  return this.findOne({
    hashedKey,
    isActive: true,
    expiresAt: { $gt: new Date() },
  }).populate('user');
};

module.exports = mongoose.model('ApiKey', apiKeySchema);
