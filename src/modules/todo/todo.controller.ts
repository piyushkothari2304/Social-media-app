import httpStatus from 'http-status';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import * as todoService from './todo.service';

export const createTodo = catchAsync(async (req: Request, res: Response) => {
  req.body.userId = req.user.id;
  const todo = await todoService.createTodo(req.body);
  res.status(httpStatus.CREATED).send(todo);
});

export const getUserTodo = catchAsync(async (req: Request, res: Response) => {
  const userId = req.body.userId ? req.body.userId : req.user.id;
  const options = req.body?.options;
  delete req.body?.options;

  const todo = await todoService.getUserTodo(new mongoose.Types.ObjectId(userId), options);
  if (!todo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Todo not found');
  }
  res.send(todo);
});

export const getTodoById = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['todoId'] === 'string') {
    const todo = await todoService.getTodoById(new mongoose.Types.ObjectId(req.params['todoId']));
    if (!todo) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Todo not found');
    }
    res.send(todo);
  }
});

export const updateTodo = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['todoId'] === 'string') {
    const todo = await todoService.updateTodoById(new mongoose.Types.ObjectId(req.params['todoId']), req.body, req.user.id);
    res.send(todo);
  }
});

export const markAsComplete = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['todoId'] === 'string') {
    const todo = await todoService.markAsComplete(new mongoose.Types.ObjectId(req.params['todoId']), req.user.id);
    res.send(todo);
  }
});

export const deleteTodo = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params['todoId'] === 'string') {
    await todoService.deleteTodoById(new mongoose.Types.ObjectId(req.params['todoId']), req.user.id);
    res.status(httpStatus.NO_CONTENT).send();
  }
});
