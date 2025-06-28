import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  roles: string[]; // Array of roles: ['advocate', 'team_member', 'admin']
  companyName?: string;
  phone?: string;
  isActive: boolean;
  emailVerified: boolean;
  googleDriveConnected: boolean;
  googleDriveToken?: string;
  googleDriveRefreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  subscription?: {
    plan: 'free' | 'basic' | 'professional' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled' | 'expired';
    startDate: Date;
    endDate?: Date;
    trialEndsAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    // Password is required only if user doesn't have Google OAuth
    required: function() {
      return !this.googleDriveToken;
    },
  },
  image: {
    type: String,
  },
  roles: {
    type: [String],
    enum: ['advocate', 'team_member', 'admin', 'client'],
    default: ['advocate'],
    validate: {
      validator: function(roles: string[]) {
        return roles.length > 0; // At least one role required
      },
      message: 'User must have at least one role'
    }
  },
  companyName: {
    type: String,
  },
  phone: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  googleDriveConnected: {
    type: Boolean,
    default: false,
  },
  googleDriveToken: {
    type: String,
  },
  googleDriveRefreshToken: {
    type: String,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'professional', 'enterprise'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'expired'],
      default: 'active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    trialEndsAt: {
      type: Date,
    },
  },
}, {
  timestamps: true,
});

// Index for password reset (only this one, remove email index since it's already unique)
UserSchema.index({ resetPasswordToken: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 