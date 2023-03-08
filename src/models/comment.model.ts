import mongoose, { Model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import { ICommentDoc } from '../interfaces/comment.interfaces';

export interface IComment extends ICommentDoc {
  id?: string;
}

export type ICommentModel = Model<IComment>;

const commentSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Post',
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

commentSchema.plugin(paginate);

const Comment = mongoose.model<IComment, mongoose.PaginateModel<ICommentModel>>('Comment', commentSchema);

export default Comment;
