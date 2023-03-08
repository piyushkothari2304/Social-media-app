import httpStatus from 'http-status';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import * as commentService from './comment.service';

export const createComment = catchAsync(async (req: Request, res: Response) => {
  req.body.createdBy = req.user.id;
  const comment = await commentService.createComment(req.body);
  res.status(httpStatus.CREATED).send(comment);
});

export const getCommentByPostId = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['postId'] === 'string') {
    const options = req.body?.options;
    delete req.body?.options;
    const comment = await commentService.getCommentByPostId(new mongoose.Types.ObjectId(req.params['postId']), options);
    if (!comment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Comment not found');
    }
    res.send(comment);
  }
});

export const updateComment = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['commentId'] === 'string') {
    const comment = await commentService.updateCommentById(
      new mongoose.Types.ObjectId(req.params['commentId']),
      req.body,
      req.user.id
    );
    res.send(comment);
  }
});

export const deleteComment = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['commentId'] === 'string') {
    await commentService.deleteCommentById(new mongoose.Types.ObjectId(req.params['commentId']), req.user.id);
    res.status(httpStatus.NO_CONTENT).send();
  }
});
