import mongoose, { Model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import { ITodoDoc, TodoStatusEnum } from '../interfaces/todo.interfaces';

export interface ITodo extends ITodoDoc {
  id?: string;
}

export type ITodoModel = Model<ITodo>;

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    status: {
      type: String,
      enum: TodoStatusEnum,
      default: 'BACKLOG',
    },
  },
  {
    timestamps: true,
  }
);

todoSchema.plugin(paginate);

const Todo = mongoose.model<ITodo, mongoose.PaginateModel<ITodoModel>>('Todo', todoSchema);

export default Todo;
