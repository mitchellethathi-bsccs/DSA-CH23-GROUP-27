import mongoose, { Schema, Document } from 'mongoose';

export interface IStory extends Document {
  user: mongoose.Types.ObjectId;
  content?: string;
  image?: string;
  expiresAt: Date;
  views: mongoose.Types.ObjectId[];
}

const storySchema = new Schema<IStory>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    image: { type: String },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      index: { expires: '0s' } // TTL index, document deleted when expiresAt is reached
    },
    views: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);

const Story = mongoose.model<IStory>('Story', storySchema);
export default Story;
