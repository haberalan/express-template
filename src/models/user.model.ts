import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

import {
  IEmailUpdate,
  IPasswordReset,
  IUser,
  IUserModel,
} from "../types/IUser.types";

const Schema = mongoose.Schema;

const passwordResetSchema = new Schema<IPasswordReset>({
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
});

const emailUpdateSchema = new Schema<IEmailUpdate>({
  newEmail: {
    type: String,
    required: true,
    unique: true,
    minLength: 3,
    maxLength: 50,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
});

const userSchema = new Schema<IUser, IUserModel>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minLength: 3,
      maxLength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      minLength: 3,
      maxLength: 50,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      maxLength: 100,
    },
    passwordLastUpdated: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    verified: {
      type: String,
    },
    passwordReset: {
      type: passwordResetSchema,
    },
    emailUpdate: {
      type: emailUpdateSchema,
    },
    firstName: {
      type: String,
      minlength: 3,
      maxlength: 80,
    },
    lastName: {
      type: String,
      minlength: 3,
      maxlength: 80,
    },
    avatar: {
      data: {
        type: Buffer,
      },
      type: {
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
  let errors: {
    username?: string;
    password?: string;
  } = {};

  if (!username) errors.username = "Username is not valid.";
  if (!password) errors.password = "Password is not valid.";

  if (Object.keys(errors).length) throw errors;

  const enteredUsername = username.trim().toLowerCase();
  if (
    !enteredUsername ||
    enteredUsername.length < 3 ||
    enteredUsername.length > 30
  )
    errors.username = "Username is not valid.";

  if (Object.keys(errors).length) throw errors;

  const user = await this.findOne({ username: enteredUsername });

  if (!user) errors.username = "There is no user with this username.";

  if (Object.keys(errors).length) throw errors;

  const passwordsMatch = await bcrypt.compare(password, user.password);
  if (!passwordsMatch) errors.password = "Password is not valid.";

  if (Object.keys(errors).length) throw errors;

  return user;
};

userSchema.statics.signup = async function (
  username: string,
  email: string,
  password: string
): Promise<{ user: IUser; token: string }> {
  let errors: {
    username?: string;
    email?: string;
    password?: string;
  } = {};

  if (!username) errors.username = "Username is not valid.";
  if (!email) errors.email = "Email is not valid.";
  if (!password) errors.password = "Password is not valid.";

  if (Object.keys(errors).length) throw errors;

  const enteredUsername = username.trim().toLowerCase();
  if (
    !enteredUsername ||
    enteredUsername.length < 3 ||
    enteredUsername.length > 30
  )
    errors.username = "Username is not valid.";

  const enteredEmail = email.trim().toLowerCase();
  if (
    !enteredEmail ||
    !validator.isEmail(enteredEmail) ||
    enteredUsername.length < 3 ||
    enteredUsername.length > 50
  )
    errors.email = "Email is not valid.";

  if (Object.keys(errors).length) throw errors;

  if (!validator.isStrongPassword(password))
    errors.password = "Password is not valid.";

  if (Object.keys(errors).length) throw errors;

  const usernameExists = await this.findOne({ username: enteredUsername });
  if (usernameExists) errors.username = "Username is already in use.";

  const emailExists = await this.findOne({ email: enteredEmail });
  if (emailExists) errors.email = "Email is already in use.";

  if (Object.keys(errors).length) throw errors;

  const salt = await bcrypt.genSalt(10);

  const hashedPassword = await bcrypt.hash(password, salt);

  const verifyNumber = Math.floor(100000 + Math.random() * 900000).toString();

  const token = await bcrypt.hash(verifyNumber, salt);

  const user = await this.create({
    username: enteredUsername,
    email: enteredEmail,
    password: hashedPassword,
    verified: token,
  });

  return {
    user,
    token: verifyNumber,
  };
};

userSchema.statics.verify = async function (
  token: string,
  id: string
): Promise<IUser> {
  let errors: {
    global?: string;
  } = {};

  if (!token) errors.global = "Token is not valid.";

  if (Object.keys(errors).length) throw errors;

  if (!mongoose.Types.ObjectId.isValid(id))
    errors.global = "User ID is not valid.";

  if (Object.keys(errors).length) throw errors;

  const user = await this.findById(id);

  if (!user) errors.global = "Token is not valid.";

  if (Object.keys(errors).length) throw errors;

  if (!user.verified) errors.global = "User is already verified.";

  if (Object.keys(errors).length) throw errors;

  const valid = await bcrypt.compare(token.toString(), user.verified);

  if (!valid) errors.global = "Token is not valid.";

  if (Object.keys(errors).length) throw errors;

  user.verified = "";
  await user.save();

  return user;
};

userSchema.statics.updateAvatar = async function (
  user_id: string,
  image: Buffer
): Promise<IUser> {
  let errors: {
    global?: string;
  } = {};

  const user = await this.findById(user_id);

  if (!user) errors.global = "There is no user.";

  if (Object.keys(errors).length) throw errors;

  return this.findByIdAndUpdate(user_id, { avatar: image }, { new: true });
};

userSchema.statics.updatePassword = async function (
  user_id: string,
  newPassword: string
): Promise<IUser> {
  let errors: {
    newPassword?: string;
    global?: string;
  } = {};

  if (!newPassword || !validator.isStrongPassword(newPassword))
    errors.newPassword = "Password is not valid.";

  if (Object.keys(errors).length) throw errors;

  const user = await this.findById(user_id);

  if (!user) errors.global = "There is no user.";

  const isUpdatedPasswordSame = await bcrypt.compare(
    newPassword,
    user.password
  );
  if (isUpdatedPasswordSame)
    errors.newPassword = "New password must be different than the old one.";

  if (Object.keys(errors).length) throw errors;

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

userSchema.statics.requestResetPassword = async function (
  email: string
): Promise<{ user: IUser; token: string }> {
  let errors: {
    global?: string;
  } = {};

  if (!email) errors.global = "Email is not valid.";

  if (Object.keys(errors).length) throw errors;

  const user = await this.findOne({ email });

  if (!user) errors.global = "There is no user.";

  if (Object.keys(errors).length) throw errors;

  const salt = await bcrypt.genSalt(10);

  const verifyNumber = Math.floor(100000 + Math.random() * 900000).toString();

  const token = await bcrypt.hash(verifyNumber, salt);

  const passwordReset = {
    token,
    createdAt: Date.now(),
  };

  const updatedUser = await this.findByIdAndUpdate(
    user._id,
    {
      passwordReset,
    },
    { new: true }
  );

  return {
    user: updatedUser,
    token: verifyNumber,
  };
};

userSchema.statics.resetPassword = async function (
  user_id: string,
  token: string,
  newPassword: string
): Promise<IUser> {
  const errors: {
    newPassword?: string;
    global?: string;
  } = {};

  if (!token) errors.global = "Token is not valid.";

  if (Object.keys(errors).length) throw errors;

  if (!mongoose.Types.ObjectId.isValid(user_id))
    errors.global = "User ID is not valid.";

  if (Object.keys(errors).length) throw errors;

  const user = await this.findById(user_id);

  if (!user) errors.global = "There is no user.";

  if (Object.keys(errors).length) throw errors;

  if (!user.passwordReset) errors.global = "Token is not valid.";

  if (Object.keys(errors).length) throw errors;

  if (user.passwordReset.createdAt.getTime() + 1000 * 60 * 10 < Date.now())
    errors.global = "Token is expired.";

  if (Object.keys(errors).length) throw errors;

  const valid = await bcrypt.compare(
    token.toString(),
    user.passwordReset.token.toString()
  );

  if (!valid) errors.global = "Token is not valid.";

  if (Object.keys(errors).length) throw errors;

  if (!newPassword || !validator.isStrongPassword(newPassword))
    errors.newPassword = "Password is not valid.";

  if (Object.keys(errors).length) throw errors;

  const salt = await bcrypt.genSalt(10);

  const hashedPassword = await bcrypt.hash(newPassword, salt);

  user.password = hashedPassword;
  user.passwordReset = undefined;

  await user.save();

  return user;
};

// userSchema.statics.requestUpdateEmail = async function (): Promise<IUser> {};

// userSchema.statics.updateEmail = async function (): Promise<IUser> {};

userSchema.statics.deleteUser = async function (
  user_id: string
): Promise<IUser> {
  let errors: {
    global?: string;
  } = {};

  const user = await this.findById(user_id);

  if (!user) errors.global = "There is no user.";

  if (Object.keys(errors).length) throw errors;

  return this.findByIdAndDelete(user_id);
};

export default mongoose.model<IUser, IUserModel>("User", userSchema);
