import mongoose, { Document, Schema } from 'mongoose';

export interface IVaultItem extends Document {
  ownerId: mongoose.Types.ObjectId;
  cipher: string; // base64 encrypted data
  iv: string; // base64 IV
  titleHint?: string; // lowercase title for search
  createdAt: Date;
  updatedAt: Date;
}

const VaultItemSchema = new Schema<IVaultItem>({
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cipher: {
    type: String,
    required: true,
  },
  iv: {
    type: String,
    required: true,
  },
  titleHint: {
    type: String,
    lowercase: true,
    trim: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.VaultItem || mongoose.model<IVaultItem>('VaultItem', VaultItemSchema);
