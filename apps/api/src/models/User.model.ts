import { Schema, model } from 'mongoose';
import { USER_ROLES, type UserRole } from '@app/shared';

export interface UserAttrs {
  uid: string;
  email: string | null;
  name: string;
  photoUrl: string | null;
  role: UserRole;
  isFounder: boolean;
  title: string | null;
  lastSeenAt: Date | null;
  updatedByUid: string | null;
  updatedByEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserAttrs>(
  {
    uid: { type: String, required: true, unique: true, trim: true },
    email: { type: String, default: null, trim: true, lowercase: true, index: true },
    name: { type: String, required: true, trim: true },
    photoUrl: { type: String, default: null, trim: true },
    role: { type: String, enum: USER_ROLES, default: 'READER', index: true },
    isFounder: { type: Boolean, default: false },
    title: { type: String, default: null, trim: true },
    lastSeenAt: { type: Date, default: null },
    updatedByUid: { type: String, default: null },
    updatedByEmail: { type: String, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const UserModel = model<UserAttrs>('User', userSchema);
