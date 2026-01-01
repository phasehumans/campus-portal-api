const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    key: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'API Key name is required'],
      trim: true,
    },
    permissions: [
      {
        type: String,
        enum: ['read', 'write', 'delete', 'admin'],
      },
    ],
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsed: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// // Static method to verify API key
// apiKeySchema.statics.verifyKey = async function(providedKey) {
//   const hashedKey = crypto.createHash('sha256').update(providedKey).digest('hex');
//   return await this.findOne({
//     key: hashedKey,
//     isActive: true,
//     expiresAt: { $gt: new Date() },
//   }).populate('user');
// };

apiKeySchema.index({ user: 1 });
apiKeySchema.index({ key: 1 });
apiKeySchema.index({ expiresAt: 1 });
apiKeySchema.index({ isActive: 1 });

const ApikeyModel = mongoose.model('apiKey', apiKeySchema);

module.exports = {
  ApikeyModel : ApikeyModel
}
