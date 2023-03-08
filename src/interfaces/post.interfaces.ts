import { Document } from 'mongoose';
import { ObjectId } from 'bson';
// import { QueryResult } from '../paginate/paginate';
// import { AccessAndRefreshTokens } from '../token/token.interfaces';

export type PostBody = Partial<IPostDoc>;

export interface IPostDoc extends Document {
  title: string;
  body: string;
  createdBy: ObjectId;
}
