/**
 * Image Upload Database Model
 * Tracks Cloudinary uploads with proper ownership verification
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IImageUpload extends Document {
  publicId: string;
  secureUrl: string;
  userId: string;
  uploadType: 'recipe' | 'profile' | 'general';
  relatedId?: string; // recipeId for recipe images, etc.
  metadata: {
    width: number;
    height: number;
    format: string;
    bytes: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ImageUploadSchema = new Schema<IImageUpload>({
  publicId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  secureUrl: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  uploadType: {
    type: String,
    enum: ['recipe', 'profile', 'general'],
    required: true
  },
  relatedId: {
    type: String,
    sparse: true // Optional field with index
  },
  metadata: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    format: { type: String, required: true },
    bytes: { type: Number, required: true }
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
ImageUploadSchema.index({ userId: 1, uploadType: 1 });
ImageUploadSchema.index({ relatedId: 1, uploadType: 1 });

// Add static methods to interface
interface IImageUploadModel extends mongoose.Model<IImageUpload> {
  verifyOwnership(publicId: string, userId: string): Promise<boolean>;
  safeDelete(publicId: string, userId: string): Promise<boolean>;
}

// Static method for ownership verification
ImageUploadSchema.statics.verifyOwnership = async function(publicId: string, userId: string) {
  const image = await this.findOne({ publicId, userId });
  return !!image;
};

// Static method for safe deletion
ImageUploadSchema.statics.safeDelete = async function(publicId: string, userId: string) {
  const result = await this.findOneAndDelete({ publicId, userId });
  return !!result;
};

export default (mongoose.models.ImageUpload as IImageUploadModel) || mongoose.model<IImageUpload, IImageUploadModel>('ImageUpload', ImageUploadSchema);