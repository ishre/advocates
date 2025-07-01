import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Personal Information
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  occupation?: string;
  company?: string;
  
  // Emergency Contact
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  
  // Legal Information
  clientType: 'individual' | 'corporate' | 'government';
  identificationNumber?: string;
  identificationType?: 'passport' | 'drivers_license' | 'national_id' | 'other';
  
  // Financial Information
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod?: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'other';
  creditLimit?: number;
  
  // Case History
  totalCases: number;
  activeCases: number;
  closedCases: number;
  totalFees: number;
  paidFees: number;
  pendingFees: number;
  
  // Communication Preferences
  preferredContactMethod: 'email' | 'phone' | 'sms' | 'mail';
  preferredLanguage: string;
  timezone: string;
  
  // Notes and History
  notes: Array<{
    content: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    isPrivate: boolean;
  }>;
  
  // Documents
  documents: Array<{
    name: string;
    type: string;
    size: number;
    url: string;
    uploadedAt: Date;
    uploadedBy: mongoose.Types.ObjectId;
  }>;
  
  // Status
  status: 'active' | 'inactive' | 'prospect' | 'former';
  
  // Metadata
  source: 'referral' | 'website' | 'advertisement' | 'walk_in' | 'other';
  assignedTo: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  
  // Subscription and billing
  subscription?: {
    plan: 'free' | 'basic' | 'professional' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled' | 'expired';
    startDate: Date;
    endDate?: Date;
    trialEndsAt?: Date;
  };
  
  // Tenant isolation - associate client with main advocate
  advocateId: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },
  
  // Personal Information
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  occupation: {
    type: String,
  },
  company: {
    type: String,
  },
  
  // Emergency Contact
  emergencyContact: {
    name: {
      type: String,
      required: true,
    },
    relationship: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
  },
  
  // Legal Information
  clientType: {
    type: String,
    enum: ['individual', 'corporate', 'government'],
    default: 'individual',
  },
  identificationNumber: {
    type: String,
  },
  identificationType: {
    type: String,
    enum: ['passport', 'drivers_license', 'national_id', 'other'],
  },
  
  // Financial Information
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'check', 'bank_transfer', 'credit_card', 'other'],
  },
  creditLimit: {
    type: Number,
  },
  
  // Case History
  totalCases: {
    type: Number,
    default: 0,
  },
  activeCases: {
    type: Number,
    default: 0,
  },
  closedCases: {
    type: Number,
    default: 0,
  },
  totalFees: {
    type: Number,
    default: 0,
  },
  paidFees: {
    type: Number,
    default: 0,
  },
  pendingFees: {
    type: Number,
    default: 0,
  },
  
  // Communication Preferences
  preferredContactMethod: {
    type: String,
    enum: ['email', 'phone', 'sms', 'mail'],
    default: 'email',
  },
  preferredLanguage: {
    type: String,
    default: 'English',
  },
  timezone: {
    type: String,
    default: 'UTC',
  },
  
  // Notes and History
  notes: [{
    content: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  }],
  
  // Documents
  documents: [{
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospect', 'former'],
    default: 'active',
  },
  
  // Metadata
  source: {
    type: String,
    enum: ['referral', 'website', 'advertisement', 'walk_in', 'other'],
    default: 'other',
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Subscription and billing
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
  
  // Tenant isolation - associate client with main advocate
  advocateId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // Add index for performance
  },
}, {
  timestamps: true,
});

// Indexes
ClientSchema.index({ name: 1 });
ClientSchema.index({ phone: 1 });
ClientSchema.index({ status: 1 });
ClientSchema.index({ assignedTo: 1 });

// Indexes for tenant isolation and performance
ClientSchema.index({ advocateId: 1 }); // For filtering by tenant
ClientSchema.index({ email: 1, advocateId: 1 }); // For tenant-specific email lookups

export default mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema); 