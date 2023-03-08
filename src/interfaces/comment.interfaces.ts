import { Document } from 'mongoose';
import { ObjectId } from 'bson';
// import { QueryResult } from '../paginate/paginate';
// import { AccessAndRefreshTokens } from '../token/token.interfaces';

export type CommentBody = Partial<ICommentDoc>;

export interface ICommentDoc extends Document {
  message: string;
  postId: ObjectId;
  createdBy: ObjectId;
}
