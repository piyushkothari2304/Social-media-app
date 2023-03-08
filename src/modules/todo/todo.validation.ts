import Joi from 'joi';
import { objectId } from '../validate/custom.validation';
import { TodoStatusEnum } from '../../interfaces/todo.interfaces';

export const createTodo = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    status: Joi.string()
      .optional()
      .valid(...Object.values(TodoStatusEnum)),
  }),
};

export const getUserTodo = {
  body: Joi.object().keys({
    userId: Joi.string().optional(),
    options: {
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
    },
  }),
};

export const getTodo = {
  params: Joi.object().keys({
    todoId: Joi.string().custom(objectId),
  }),
};

export const updateTodo = {
  params: Joi.object().keys({
    todoId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
  }),
};

export const updateTodoStatus = {
  params: Joi.object().keys({
    todoId: Joi.string().custom(objectId),
  }),
};
