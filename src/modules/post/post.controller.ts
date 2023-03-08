import httpStatus from 'http-status';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import * as postService from './post.service';

export const createPost = catchAsync(async (req: Request, res: Response) => {
  req.body.createdBy = req.user.id;
  const post = await postService.createPost(req.body);
  res.status(httpStatus.CREATED).send(post);
});

export const getUserPost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.body.userId ? req.body.userId : req.user.id;
  const options = req.body?.options;
  delete req.body?.options;

  const post = await postService.getUserPost(new mongoose.Types.ObjectId(userId), options);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Todo not found');
  }
  res.send(post);
});

export const getPostById = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['postId'] === 'string') {
    const post = await postService.getPostById(new mongoose.Types.ObjectId(req.params['postId']));
    if (!post) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
    }
    res.send(post);
  }
});

export const updatePost = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['postId'] === 'string') {
    const post = await postService.updatePostById(new mongoose.Types.ObjectId(req.params['postId']), req.body, req.user.id);
    res.send(post);
  }
});

export const deletePost = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['postId'] === 'string') {
    await postService.deletePostById(new mongoose.Types.ObjectId(req.params['postId']), req.user.id);
    res.status(httpStatus.NO_CONTENT).send();
  }
});
