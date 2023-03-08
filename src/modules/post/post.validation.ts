import Joi from 'joi';
import { objectId } from '../validate/custom.validation';

export const createPost = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    body: Joi.string().required(),
  }),
};

export const getUserPost = {
  body: Joi.object().keys({
    userId: Joi.string().optional(),
    options: {
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
    },
  }),
};

export const getPost = {
  params: Joi.object().keys({
    postId: Joi.string().custom(objectId),
  }),
};

export const updatePost = {
  params: Joi.object().keys({
    postId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    title: Joi.string().optional(),
    body: Joi.string().optional(),
  }),
};
