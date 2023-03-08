import mongoose, { Model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import { IPostDoc } from '../interfaces/post.interfaces';

export interface IPost extends IPostDoc {
  id?: string;
}

export type IPostModel = Model<IPost>;

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

postSchema.plugin(paginate);

const Post = mongoose.model<IPost, mongoose.PaginateModel<IPostModel>>('Post', postSchema);

export default Post;
