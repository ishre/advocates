import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamMember {
  userId: mongoose.Types.ObjectId;
  role: 'viewer' | 'editor' | 'admin';
  addedAt: Date;
  addedBy: mongoose.Types.ObjectId;
}

export interface ITeam extends Document {
  name: string;
  description?: string;
  ownerId: mongoose.Types.ObjectId;
  members: ITeamMember[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['viewer', 'editor', 'admin'],
    default: 'viewer',
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const TeamSchema = new Schema<ITeam>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [TeamMemberSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema); 