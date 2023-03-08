import httpStatus from 'http-status';
import mongoose from 'mongoose';
import Post, { IPostModel } from '../../models/post.model';
import ApiError from '../errors/ApiError';
import { IPostDoc } from '../../interfaces/post.interfaces';

/**
 * Create a post
 * @param {IPostDoc} postBody
 * @returns {Promise<IPostModel>}
 */
export const createPost = async (postBody: IPostDoc): Promise<IPostModel> => {
  return Post.create(postBody);
};

/**
 * Get post by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IPostDoc | null>}
 */
export const getPostById = async (id: mongoose.Types.ObjectId): Promise<IPostDoc | null> => Post.findById(id);

/**
 * Get post by id
 * @param {mongoose.Types.ObjectId} userId
 * @returns {Promise<QueryResult>}
 */
export const getUserPost = async (
  userId: mongoose.Types.ObjectId,
  options: {
    page: number;
    limit: number;
  }
): Promise<
  mongoose.PaginateResult<
    mongoose.Document<unknown, any, IPostModel> &
      IPostModel & {
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

  const data = await Post.paginate({ userId }, paginationOptions, function (err, result) {
    if (err) {
      return err;
    }
    return result;
  });

  return data;
};

/**
 * Update post by id
 * @param {mongoose.Types.ObjectId} postId
 * @param {IPostDoc} updateBody
 * @param {string} userId
 * @returns {Promise<IPostDoc | null>}
 */
export const updatePostById = async (
  postId: mongoose.Types.ObjectId,
  updateBody: IPostDoc,
  userId: string
): Promise<IPostDoc | null> => {
  const post = await getPostById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  if (post.createdBy.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Operation Not Allowed');
  }
  Object.assign(post, updateBody);
  await post.save();

  return post;
};

/**
 * Delete post by id
 * @param {mongoose.Types.ObjectId} postId
 * @param {string} userId
 * @returns {Promise<IPostDoc | null>}
 */
export const deletePostById = async (postId: mongoose.Types.ObjectId, userId: string): Promise<IPostDoc | null> => {
  const post = await getPostById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  if (post.createdBy.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Operation Not Allowed');
  }
  await post.remove();
  return post;
};
