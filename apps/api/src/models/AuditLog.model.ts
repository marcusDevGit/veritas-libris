import { Schema, model } from 'mongoose';

export type AuditAction = 'ROLE_UPDATED' | 'EDITORIAL_LOCK_UPDATED';

export interface AuditLogAttrs {
  action: AuditAction;
  actorUid: string;
  actorName: string;
  targetId: string;
  targetLabel: string;
  details: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<AuditLogAttrs>(
  {
    action: {
      type: String,
      enum: ['ROLE_UPDATED', 'EDITORIAL_LOCK_UPDATED'],
      required: true,
    },
    actorUid: { type: String, required: true, trim: true },
    actorName: { type: String, required: true, trim: true },
    targetId: { type: String, required: true, trim: true },
    targetLabel: { type: String, required: true, trim: true },
    details: { type: String, required: true, trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLogModel = model<AuditLogAttrs>('AuditLog', auditLogSchema);
