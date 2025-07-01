import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  roles: string[]; // Array of roles: ['advocate', 'team_member', 'admin', 'client']
  companyName?: string;
  phone?: string;
  isActive: boolean;
  emailVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  subscription?: {
    plan: 'free' | 'basic' | 'professional' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled' | 'expired';
    startDate: Date;
    endDate?: Date;
    trialEndsAt?: Date;
  };
  // Tenant isolation fields
  advocateId?: Schema.Types.ObjectId | string; // For team members and clients - references the main advocate
  isMainAdvocate?: boolean; // True if this user is the main advocate for their organization
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
    // Password is required for all users
    required: true,
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
  // Tenant isolation fields
  advocateId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    // Required for team members and clients, optional for advocates
    required: function(this: unknown) {
      const self = this as { roles: string[]; advocateId?: string };
      return self.roles.includes('team_member') || self.roles.includes('client');
    },
  },
  isMainAdvocate: {
    type: Boolean,
    default: function(this: unknown) {
      const self = this as { roles: string[]; advocateId?: string };
      return self.roles.includes('advocate') && !self.advocateId;
    },
  },
}, {
  timestamps: true,
});

// Indexes for tenant isolation and performance
UserSchema.index({ resetPasswordToken: 1 });
UserSchema.index({ advocateId: 1 }); // For filtering by tenant
UserSchema.index({ email: 1, advocateId: 1 }); // For tenant-specific email lookups
UserSchema.index({ isMainAdvocate: 1 }); // For finding main advocates

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 