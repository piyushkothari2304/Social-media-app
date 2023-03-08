import { Document } from 'mongoose';
import { ObjectId } from 'bson';
// import { QueryResult } from '../paginate/paginate';
// import { AccessAndRefreshTokens } from '../token/token.interfaces';

export enum TodoStatusEnum {
  BACKLOG = 'BACKLOG',
  INPROGRESS = 'INPROGRESS',
  COMPLETED = 'COMPLETED',
}

export type TodoBody = Partial<ITodoDoc>;

export interface ITodoDoc extends Document {
  title: string;
  description: string;
  userId: ObjectId;
  status: TodoStatusEnum;
}
