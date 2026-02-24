import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name?: string;
  email: string;
  image?: string | null;
  emailVerified?: Date | null;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, default: '' },
    email: { type: String, required: true, unique: true },
    image: { type: String, default: null },
    emailVerified: { type: Date, default: null },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

const User: Model<IUserDocument> =
  mongoose.models.User ?? mongoose.model<IUserDocument>('User', UserSchema);

export default User;
