import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

import { IUser, IUserModel } from "../types/IUser.types";

const Schema = mongoose.Schema;

const userSchema = new Schema<IUser, IUserModel>(
  {
    username: {
      type: String,
      minLength: 3,
      maxLength: 30,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      minLength: 3,
      maxLength: 50,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      minLength: 8,
      maxLength: 100,
      required: true,
    },
    avatar: {
      required: false,
      data: {
        required: false,
        type: Buffer,
      },
      type: {
        required: false,
        type: String,
      },
    },
  },
  { timestamps: true }
);

userSchema.statics.login = async function (
  username: string,
  password: string
): Promise<IUser> {
  if (!username || !password) throw Error("All fields must be filled!");

  const enteredUsername = username.trim().toLowerCase();

  if (!enteredUsername) throw Error("All fields must be filled!");

  const user = await this.findOne({ username: enteredUsername });

  if (!user) throw Error("Incorrect username!");

  const passwordsMatch = await bcrypt.compare(password, user.password);

  if (!passwordsMatch) throw Error("Incorrect password!");

  return user;
};

userSchema.statics.signup = async function (
  username: string,
  email: string,
  password: string
): Promise<IUser> {
  if (!username || !email || !password)
    throw Error("All fields must be filled!");

  const enteredUsername = username.trim().toLowerCase();
  const enteredEmail = email.trim().toLowerCase();

  if (!enteredUsername || !enteredEmail)
    throw Error("All fields must be filled!");

  if (!validator.isEmail(enteredEmail)) throw Error("Email is not valid!");

  if (!validator.isStrongPassword(password))
    throw Error("Password is not strong enough!");

  const usernameExists = await this.findOne({ username: enteredUsername });
  if (usernameExists) throw Error("Username is already in use!");

  const emailExists = await this.findOne({ email: enteredEmail });
  if (emailExists) throw Error("Email is already in use!");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  return this.create({
    username: enteredUsername,
    email: enteredEmail,
    password: hashedPassword,
  });
};

userSchema.statics.updateAvatar = async function (
  user_id: string,
  image: { data: Buffer; type: string }
): Promise<IUser> {
  const user = await this.findById(user_id);

  if (!user) throw Error("There was an error!");

  return this.findByIdAndUpdate(user_id, { avatar: image }, { new: true });
};

userSchema.statics.updatePassword = async function (
  user_id: string,
  newPassword: string
): Promise<IUser> {
  if (!newPassword) throw Error("All fields must be filled!");

  if (!validator.isStrongPassword(newPassword))
    throw Error("Password is not strong enough!");

  console.log("Is strong enough?: ", validator.isStrongPassword(newPassword));

  const user = await this.findById(user_id);

  if (!user) throw Error("There was an error!");

  const isUpdatedPasswordSame = await bcrypt.compare(
    newPassword,
    user.password
  );

  if (isUpdatedPasswordSame) throw Error("New passwords must be different!");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  return this.findByIdAndUpdate(
    user_id,
    {
      password: hashedPassword,
    },
    { new: true }
  );
};

userSchema.statics.deleteUser = async function (
  user_id: string
): Promise<IUser> {
  const user = await this.findById(user_id);

  if (!user) throw Error("There was an error!");

  return this.findByIdAndDelete(user_id);
};

export default mongoose.model<IUser, IUserModel>("User", userSchema);
