import mongoose, { Schema, Document } from 'mongoose';

export interface ICase extends Document {
  caseNumber: string;
  title: string;
  description: string;
  caseType: 'civil' | 'criminal' | 'family' | 'corporate' | 'property' | 'other';
  status: 'active' | 'closed' | 'pending' | 'on_hold' | 'settled' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Client Information
  clientId: mongoose.Types.ObjectId;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  
  // Court Information
  courtName: string;
  courtLocation: string;
  judgeName: string;
  opposingParty: string;
  opposingLawyer: string;
  
  // Dates
  filingDate: Date;
  nextHearingDate: Date;
  deadlineDate: Date;
  closedDate?: Date;
  
  // Financial Information
  fees: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    currency: string;
  };
  
  // Team Assignment
  assignedTo: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  
  // Tenant isolation - associate case with main advocate
  advocateId: mongoose.Types.ObjectId;
  
  // Documents
  documents: Array<{
    name: string;
    type: string;
    size: number;
    url: string;
    uploadedAt: Date;
    uploadedBy: mongoose.Types.ObjectId;
  }>;
  
  // Notes and Updates
  notes: Array<{
    content: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    isPrivate: boolean;
  }>;
  
  // Tasks
  tasks: Array<{
    title: string;
    description: string;
    assignedTo: mongoose.Types.ObjectId;
    dueDate: Date;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
  }>;
  
  // Google Drive Integration
  googleDriveFolderId?: string;
  lastBackupDate?: Date;
  
  // Add new fields for the new case form
  registrationDate: Date;
  previousDate: Date;
  stage: string;
  particulars: string;
  year: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const CaseSchema = new Schema<ICase>({
  caseNumber: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  caseType: {
    type: String,
    enum: ['civil', 'criminal', 'family', 'corporate', 'property', 'other'],
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'pending', 'on_hold', 'settled', 'dismissed'],
    default: 'active',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  
  // Client Information
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  clientEmail: {
    type: String,
    required: true,
  },
  clientPhone: {
    type: String,
    required: true,
  },
  
  // Court Information
  courtName: {
    type: String,
    required: true,
  },
  courtLocation: {
    type: String,
    required: true,
  },
  judgeName: {
    type: String,
  },
  opposingParty: {
    type: String,
  },
  opposingLawyer: {
    type: String,
  },
  
  // Dates
  filingDate: {
    type: Date,
    required: true,
  },
  nextHearingDate: {
    type: Date,
  },
  deadlineDate: {
    type: Date,
  },
  closedDate: {
    type: Date,
  },
  
  // Financial Information
  fees: {
    totalAmount: {
      type: Number,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    pendingAmount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
  },
  
  // Team Assignment
  assignedTo: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Tenant isolation - associate case with main advocate
  advocateId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // Add index for performance
  },
  
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
  
  // Notes and Updates
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
  
  // Tasks
  tasks: [{
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'overdue'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Google Drive Integration
  googleDriveFolderId: {
    type: String,
  },
  lastBackupDate: {
    type: Date,
  },
  
  // Add new fields for the new case form
  registrationDate: {
    type: Date,
    required: true,
  },
  previousDate: {
    type: Date,
  },
  stage: {
    type: String,
    enum: ['Agreement', 'Arguments', 'Charge', 'Evidence', 'Judgement', 'Plaintiff Evidence', 'Remand'],
  },
  particulars: {
    type: String,
  },
  year: {
    type: Number,
  },
}, {
  timestamps: true,
});

// Indexes
CaseSchema.index({ clientId: 1 });
CaseSchema.index({ assignedTo: 1 });
CaseSchema.index({ status: 1 });
CaseSchema.index({ nextHearingDate: 1 });
CaseSchema.index({ deadlineDate: 1 });

export default mongoose.models.Case || mongoose.model<ICase>('Case', CaseSchema); 