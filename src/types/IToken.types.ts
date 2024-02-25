import { Document, Model, ObjectId } from "mongoose";

export interface IToken extends Document {
  user_id: ObjectId;
  token: string;
  createdAt: Date;
}

export interface ITokenModel extends Model<IToken> {}
