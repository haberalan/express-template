import { Document, Model, ObjectId } from "mongoose";

interface IPasswordReset extends Document {
  user_id: ObjectId;
  token: string;
  createdAt: Date;
}

interface IEmailUpdate extends Document {
  user_id: ObjectId;
  newEmail: string;
  token: string;
  createdAt: Date;
}

interface IUser extends Document {
  _id: ObjectId;
  username: string;
  email: string;
  password: string;
  passwordLastUpdated: Date;
  verified: string;
  passwordReset?: IPasswordReset;
  emailUpdate?: IEmailUpdate;
  firstName?: string;
  lastName?: string;
  avatar?: {
    data: Buffer;
    type: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

interface IUserModel extends Model<IUser> {
  login(username: string, password: string): Promise<IUser>;
  signup(
    username: string,
    email: string,
    password: string
  ): Promise<{ user: IUser; token: string }>;
  verify(token: string, id: string): Promise<IUser>;
  updateAvatar(user_id: ObjectId, image: Buffer): Promise<IUser>;
  updatePassword(user_id: ObjectId, newPassword: string): Promise<IUser>;
  requestResetPassword(email: string): Promise<{ user: IUser; token: string }>;
  resetPassword(
    user_id: string,
    token: string,
    newPassword: string
  ): Promise<IUser>;
  requestUpdateEmail(
    user_id: ObjectId,
    newEmail: string
  ): Promise<{ user: IUser; token: string }>;
  updateEmail(user_id: ObjectId, token: string): Promise<IUser>;
  updateProfile(
    user_id: ObjectId,
    firstName: string,
    lastName: string
  ): Promise<IUser>;
  deleteUser(user_id: ObjectId): Promise<IUser>;
}

export { IUser, IUserModel, IPasswordReset, IEmailUpdate };
