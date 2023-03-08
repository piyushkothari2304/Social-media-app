import httpStatus from 'http-status';
import mongoose from 'mongoose';
import Comment, { ICommentModel } from '../../models/comment.model';
import ApiError from '../errors/ApiError';
import { ICommentDoc } from '../../interfaces/comment.interfaces';
import { Post } from '../post';

/**
 * Create a comment
 * @param {ICommentDoc} commentBody
 * @returns {Promise<ICommentModel>}
 */
export const createComment = async (commentBody: ICommentDoc): Promise<ICommentModel> => {
  const post = Post.findById({ postId: commentBody.postId });
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  return Comment.create(commentBody);
};

/**
 * Get comment by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<ICommentDoc | null>}
 */
export const getCommentById = async (id: mongoose.Types.ObjectId): Promise<ICommentDoc | null> => Comment.findById(id);

/**
 * Get comment by id
 * @param {mongoose.Types.ObjectId} postId
 * @returns {Promise<QueryResult>}
 */
export const getCommentByPostId = async (
  postId: mongoose.Types.ObjectId,
  options: {
    page: number;
    limit: number;
  }
): Promise<
  mongoose.PaginateResult<
    mongoose.Document<unknown, any, ICommentModel> &
      ICommentModel & {
        _id: mongoose.Types.ObjectId;
      } & {
        page: number;
        limit: number;
      }
  >
> => {
  const paginationOptions = {
    page: options?.page || 1,
    limit: options?.limit || 10,
  };

  const data = await Comment.paginate({ postId }, paginationOptions, function (err, result) {
    if (err) {
      return err;
    }
    return result;
  });

  return data;
};

/**
 * Update comment by id
 * @param {mongoose.Types.ObjectId} commentId
 * @param {ICommentDoc} updateBody
 * @param {string} userId
 * @returns {Promise<ICommentDoc | null>}
 */
export const updateCommentById = async (
  commentId: mongoose.Types.ObjectId,
  updateBody: ICommentDoc,
  userId: string
): Promise<ICommentDoc | null> => {
  const comment = await getCommentById(commentId);
  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }
  if (comment.createdBy.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Operation Not Allowed');
  }
  Object.assign(comment, updateBody);
  await comment.save();

  return comment;
};

/**
 * Delete comment by id
 * @param {mongoose.Types.ObjectId} commentId
 * @param {string} userId
 * @returns {Promise<ICommentDoc | null>}
 */
export const deleteCommentById = async (commentId: mongoose.Types.ObjectId, userId: string): Promise<ICommentDoc | null> => {
  const comment = await getCommentById(commentId);
  if (!comment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
  }
  if (comment.createdBy.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Operation Not Allowed');
  }
  await comment.remove();
  return comment;
};
