import Joi from 'joi';
import { objectId } from '../validate/custom.validation';

export const createComment = {
  body: Joi.object().keys({
    message: Joi.string().required(),
    postId: Joi.string().required(),
  }),
};

export const getComment = {
  params: Joi.object().keys({
    postId: Joi.string().custom(objectId),
    options: {
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
    },
  }),
};

export const updateComment = {
  params: Joi.object().keys({
    commentId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    message: Joi.string().optional(),
  }),
};

export const deleteComment = {
  params: Joi.object().keys({
    commentId: Joi.string().custom(objectId),
  }),
};
