import httpStatus from 'http-status';
import mongoose from 'mongoose';
import Todo, { ITodoModel } from '../../models/todo.model';
import ApiError from '../errors/ApiError';
import { ITodoDoc, TodoStatusEnum } from '../../interfaces/todo.interfaces';

/**
 * Create a todo
 * @param {ITodoDoc} todoBody
 * @returns {Promise<ITodoModel>}
 */
export const createTodo = async (todoBody: ITodoDoc): Promise<ITodoModel> => {
  return Todo.create(todoBody);
};

/**
 * Get todo by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<ITodoDoc | null>}
 */
export const getTodoById = async (id: mongoose.Types.ObjectId): Promise<ITodoDoc | null> => Todo.findById(id);

/**
 * Get user todo
 * @param {mongoose.Types.ObjectId} userId
 * @returns {Promise<QueryResult>}
 */
export const getUserTodo = async (
  userId: mongoose.Types.ObjectId,
  options: {
    page: number;
    limit: number;
  }
): Promise<mongoose.PaginateResult<
  mongoose.Document<unknown, any, ITodoModel> &
    ITodoModel & {
      _id: mongoose.Types.ObjectId;
    } & {
      page: number;
      limit: number;
    }
> | null> => {
  const paginationOptions = {
    page: options?.page || 1,
    limit: options?.limit || 10,
  };

  const data = await Todo.paginate({ userId }, paginationOptions, function (err, result) {
    if (err) {
      return err;
    }
    return result;
  });

  return data;
};

/**
 * Update todo by id
 * @param {mongoose.Types.ObjectId} todoId
 * @param {ITodoDoc} updateBody
 * @param {string} userId
 * @returns {Promise<ITodoDoc | null>}
 */
export const updateTodoById = async (
  todoId: mongoose.Types.ObjectId,
  updateBody: ITodoDoc,
  userId: string
): Promise<ITodoDoc | null> => {
  const todo = await getTodoById(todoId);
  if (!todo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Todo not found');
  }
  if (todo.userId.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Operation Not Allowed');
  }
  Object.assign(todo, updateBody);
  await todo.save();

  return todo;
};

/**
 * Mark todo as completed
 * @param {mongoose.Types.ObjectId} todoId
 * @param {string} userId
 * @returns {Promise<ITodoDoc | null>}
 */
export const markAsComplete = async (todoId: mongoose.Types.ObjectId, userId: string): Promise<ITodoDoc | null> => {
  const todo = await getTodoById(todoId);
  if (!todo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Todo not found');
  }
  if (todo.userId.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Operation Not Allowed');
  }
  Object.assign(todo, { status: TodoStatusEnum.COMPLETED });
  await todo.save();

  return todo;
};

/**
 * Delete todo by id
 * @param {mongoose.Types.ObjectId} todoId
 * @param {string} userId
 * @returns {Promise<ITodoDoc | null>}
 */
export const deleteTodoById = async (todoId: mongoose.Types.ObjectId, userId: string): Promise<ITodoDoc | null> => {
  const todo = await getTodoById(todoId);
  if (!todo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Todo not found');
  }
  if (todo.userId.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Operation Not Allowed');
  }
  await todo.remove();
  return todo;
};
