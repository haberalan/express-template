import { Document, Model } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  avatar?: {
    data: Buffer;
    type: string;
  };
  updatedAt?: Date;
  createdAt?: Date;
}

export interface IUserModel extends Model<IUser> {
  login(username: string, password: string): Promise<IUser>;
  signup(username: string, email: string, password: string): Promise<IUser>;
  updateAvatar(
    user_id: string,
    image: { data: Buffer; type: string }
  ): Promise<IUser>;
  updatePassword(user_id: string, newPassword: string): Promise<IUser>;
  deleteUser(user_id: string): Promise<IUser>;
}
