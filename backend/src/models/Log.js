import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  userEmail: { type: String },
  role: { type: String },
  action: { type: String, required: true, index: true },
  details: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String }
}, {
  timestamps: { createdAt: 'timestamp', updatedAt: false }
});

// Automatically delete logs older than 90 days for DB optimization
logSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

const Log = mongoose.model('Log', logSchema);
export default Log;
